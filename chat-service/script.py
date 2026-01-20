import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

import json
import torch
from threading import Thread
from schemas import GenerateRequest
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

MODEL_ID = "/repository"
# MODEL_ID = "HuggingFaceTB/SmolLM3-3B"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DTYPE = torch.bfloat16 if torch.cuda.is_available() else torch.float32
MAX_NEW_TOKENS = 512

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelNotLoadedError(RuntimeError):
    """Raised when attempting to use the model before it is loaded."""


class ModelManager:
    def __init__(self, model_id: str, device: str, dtype: torch.dtype):
        self.model_id = model_id
        self.device = device
        self.dtype = dtype

        self.model: Optional[AutoModelForCausalLM] = None
        self.tokenizer: Optional[AutoTokenizer] = None

    async def load(self):
        """Load model + tokenizer if not already loaded."""
        if self.model is not None and self.tokenizer is not None:
            return

        start = time.perf_counter()
        logger.info(f"Loading tokenizer and model for {self.model_id}")

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_id,
        )
        self.model = (
            AutoModelForCausalLM.from_pretrained(
                self.model_id,
                dtype=self.dtype,
            )
            .to(self.device)
            .eval()
        )
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(f"Finished loading {self.model_id} in {duration_ms:.2f} ms")

    async def unload(self):
        """Free model + tokenizer and clear CUDA cache."""
        if self.model is not None:
            self.model.to("cpu")
            del self.model
            self.model = None

        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def get(self):
        """Return the loaded model + tokenizer or raise if not ready."""
        if self.model is None or self.tokenizer is None:
            raise ModelNotLoadedError("Model not loaded")
        return self.model, self.tokenizer


model_manager = ModelManager(MODEL_ID, DEVICE, DTYPE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await model_manager.load()
    try:
        yield
    finally:
        await model_manager.unload()


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health():
    try:
        model_manager.get()
    except ModelNotLoadedError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"message": "API is running."}


@app.post("/generate")
def generate(request: GenerateRequest):
    def generate():
        model, tokenizer = model_manager.get()

        messages = [
            {
                "role": "system",
                "content": """
                    You are a helpful assistant that answers questions using retrieved documents.

                    Use the provided context to answer the user’s question accurately.
                    If the answer cannot be found in the context, say that you don’t have enough information.
                    Do not guess or invent details.

                    Keep answers clear, concise, and easy to understand.
                    """,
            },
            {"role": "user", "content": request.prompt},
        ]

        inputs = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(model.device)

        streamer = TextIteratorStreamer(
            tokenizer, skip_prompt=True, skip_special_tokens=True
        )

        generation_args = {"max_new_tokens": 768, "streamer": streamer, **inputs}

        def generate_in_thread():
            with torch.inference_mode():
                model.generate(**generation_args)

        thread = Thread(target=generate_in_thread)
        thread.start()

        for token in streamer:
            yield f"data: {json.dumps({'content': token})}\n\n"
        thread.join()
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
