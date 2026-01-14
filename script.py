from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from transformers import Qwen3VLForConditionalGeneration, AutoProcessor
from sentence_transformers import SentenceTransformer
import torch
from typing import Optional
import time
import logging

summarizing_model_id = "/repository/Qwen3.5-VL-2B-Instruct"
embedding_model_id = "sentence-transformers/all-MiniLM-L6-v2"

BATCH_SIZE = 8
BATCH_TIMEOUT = 0.05

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DTYPE = torch.bfloat16 if torch.cuda.is_available() else torch.float32

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelNotLoadedError(RuntimeError):
    """Raised when attempting to use the model before it is loaded."""

class ModelManager:
    def __init__(self, 
                 summarizing_model_id: str,
                 embedding_model_id: str, 
                 device: str, 
                 dtype: torch.dtype):
        
        self.summarizing_model_id = summarizing_model_id
        self.embedding_model_id = embedding_model_id
        self.device = device
        self.dtype = dtype

        self.summarizing_model: Optional[Qwen3VLForConditionalGeneration] = None
        self.embedding_model: Optional[SentenceTransformer] = None
        self.processor: Optional[AutoProcessor] = None

    async def load(self):
        """Load model + tokenizer if not already loaded."""
        if self.summarizing_model is not None and self.processor is not None:
            return

        start = time.perf_counter()
        logger.info(f"Loading processor and model for {self.summarizing_model_id}")
        self.processor = AutoProcessor.from_pretrained(self.summarizing_model_id)

        self.summarizing_model = (
            Qwen3VLForConditionalGeneration.from_pretrained(
                self.summarizing_model_id,
                dtype=self.dtype,
            )
            .to(self.device)
            .eval()
        )

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(f"Finished loading {self.summarizing_model_id} in {duration_ms:.2f} ms")

        start = time.perf_counter()
        logger.info(f"Loading embedding model for {self.embedding_model_id}")
        self.embedding_model = SentenceTransformer(self.embedding_model_id, device=self.device, cache_folder = "/data")
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(f"Finished loading {self.embedding_model_id} in {duration_ms:.2f} ms")

    async def unload(self):
        """Free model + tokenizer and clear CUDA cache."""
        if self.summarizing_model is not None:
            self.summarizing_model.to("cpu")
            del self.summarizing_model
            self.summarizing_model = None

        if self.embedding_model is not None:
            del self.embedding_model
            self.embedding_model = None

        if self.processor is not None:
            del self.processor
            self.processor = None

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def getSummarizer(self):
        """Return the summarizing model + processor or raise if not ready."""
        if self.summarizing_model is None or self.processor is None:
            raise ModelNotLoadedError("Summarizing model not loaded")
        return self.summarizing_model, self.processor
    
    def getEmbedder(self):
        """Return the embedding model or raise if not ready."""
        if self.embedding_model is None:
            raise ModelNotLoadedError("Embedding model not loaded")
        return self.embedding_model
    
model_manager = ModelManager(summarizing_model_id, embedding_model_id, DEVICE, DTYPE)

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
