# Multimodal RAG System with GPU-Accelerated Inference

A **production-style Multimodal Retrieval-Augmented Generation (RAG)** system for querying **PDF documents containing text, images, and tables**.  
The system performs **page-wise chunking, multimodal summarization, embedding, retrieval**, and enables **streaming conversational Q&A** grounded in user-provided documents.

This project is designed to mirror **real-world ML system architecture**, focusing on **asynchronous pipelines, GPU inference orchestration, service decoupling**, and **model trade-offs under constrained compute**.

---

## Key Capabilities

- **PDF ingestion pipeline**
  - Supports PDFs with **text, images, and tables**
  - Page-wise chunking with structured extraction
- **Multimodal chunk summarization**
  - Image + text → meaningful textual summaries
  - Preserves visual and tabular context for retrieval
- **Semantic retrieval**
  - Dense vector search using cosine similarity
- **Conversational RAG chat**
  - Streaming, grounded responses with retrieved context
- **GPU-accelerated inference**
  - Dedicated inference services for summarization, embeddings, and chat
- **Asynchronous task orchestration**
  - Parallel chunking, summarization, and embedding
- **Deployment-ready design**
  - Hosted on managed inference endpoints

---

## System Architecture

### High-Level Design

- **Backend service**
  - Handles ingestion, orchestration, retrieval, and API routing
- **Inference services (decoupled)**
  - Summarization + embedding service
  - Chat / reasoning service
- **Vector storage**
  - pgvector-enabled PostgreSQL for similarity search
- **Object storage**
  - Extracted images stored in S3-compatible storage

### Core Design Decisions

- **Decoupled GPU inference**
  - Prevents long-running model calls from blocking the backend
- **Asynchronous processing**
  - Enables scaling document ingestion and preprocessing
- **Task-specific models**
  - Smaller models for embeddings and summarization
  - Larger reasoning model only for chat
- **Explicit GPU contention handling**
  - Requests are queued when GPUs are busy

---

## Document Ingestion & Chunking

- **Input format**: PDF (current)
- **Chunking strategy**:
  - Page-wise chunking using **LlamaParse**
- **Extraction details**:
  - Text extracted per page
  - Images extracted and stored separately (S3)
  - Tables extracted as **HTML or Markdown**
- **Retrieval-aware design**:
  - Images and tables are linked back to their parent chunks
  - Enables multimodal context during summarization and retrieval

---

## Models Used

### Multimodal Summarization

- **Model**: `qwen3-vl-2b-instruct`
- **Purpose**:
  - Convert *(image + text + tables)* into concise, information-dense summaries
  - Summaries are optimized to generate **useful semantic search queries**
- **Why**:
  - Enables downstream embedding and retrieval over visual content

### Embeddings

- **Model**: `all-MiniLM-L6-v2`
- **Purpose**:
  - Generate dense embeddings for chunk summaries
- **Why**:
  - Fast inference
  - Low GPU memory footprint
  - Strong baseline for semantic retrieval

### Chat / Reasoning

- **Model**: `DeepSeek-R1-Distill-Qwen-7B`
- **Purpose**:
  - Long-context reasoning over retrieved document chunks
- **Features**:
  - Streaming responses enabled
- **Why**:
  - Strong reasoning quality with manageable compute requirements

> Model choices prioritize **reasoning quality, long-context support, and cost efficiency**, making the system viable on small-scale GPU deployments.

---

## Processing Workflow

1. User uploads a PDF
2. Backend triggers ingestion pipeline
3. PDF is split into **page-wise chunks**
4. For each chunk:
   - Images and tables are extracted
   - Multimodal summary is generated
   - Summary is embedded
5. Summaries, embeddings, and metadata are stored
6. During chat:
   - Relevant chunks are retrieved via cosine similarity
   - Context is injected into the chat model
   - Model streams grounded responses to the user

---

## Tech Stack

### Backend

- FastAPI
- PostgreSQL + **pgvector**
- Celery
- Redis
- Python

### ML / AI

- Hugging Face Transformers
- Vision-Language Models
- Sentence embedding models
- CUDA-enabled GPU inference

### Infrastructure

- Containerized GPU inference services
- Managed inference endpoints
- S3-compatible object storage
- Vector search via PostgreSQL

### Frontend

- Minimal UI for:
  - PDF upload
  - Conversational document querying

---

## Service Separation

- **Summarization + Embedding Service**
  - Handles multimodal summarization
  - Generates embeddings
- **Chat Service**
  - Dedicated to conversational inference
  - Optimized for streaming responses

Both services are deployed independently on **inference endpoints**, enabling:
- Independent scaling
- Clear resource boundaries
- Easier experimentation with model upgrades

---

## Why This Project?

This project was built to explore and demonstrate:

- Production-grade **RAG system design**
- **Multimodal retrieval** over documents with images and tables
- Asynchronous ML pipelines using task queues
- GPU contention, batching, and cost trade-offs
- Clean separation between application logic and inference
- Practical deployment patterns used in real AI systems

This is intentionally **not a toy demo**, but a portfolio-grade systems project.

---

## Current Status

- End-to-end pipeline implemented
- PDF ingestion with images and tables
- Multimodal summarization functional
- Semantic retrieval via pgvector
- Streaming RAG chat operational
- Hosted on inference endpoints

---

## Planned Improvements

- Inline **citations** in chat responses
- Reranking during retrieval
- Hybrid dense + sparse search
- Section-aware chunking strategies
- Context-aware retrieval logic
- Message history and conversation memory
- Upgraded models as compute allows
- Observability (metrics, tracing, latency tracking)

---

## Acknowledgements

- Hugging Face ecosystem
- DeepSeek & Qwen open-source models
- LlamaParse
- Modern RAG and multimodal system design patterns

---

> This repository serves as a **portfolio-grade demonstration** of applied machine learning systems engineering with multimodal RAG.
