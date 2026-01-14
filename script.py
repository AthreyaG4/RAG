from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer, logger
from sentence_transformers import SentenceTransformer
import torch
from typing import Optional
import time
import logging

app = FastAPI()

embedding_model = None
summarizer = None

BATCH_SIZE = 8
BATCH_TIMEOUT = 0.05

device = "cuda" if torch.cuda.is_available() else "cpu"

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