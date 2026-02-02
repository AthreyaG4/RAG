# Multimodal RAG: Production-Grade Document Intelligence

A high-performance **Multimodal Retrieval-Augmented Generation (RAG)** system designed for querying complex PDF documents containing interleaved text, images, and tables.

This project demonstrates a production-style ML system architecture, moving beyond basic vector search to implement a **Hybrid Retrieval + RRF + Reranking** pipeline. It leverages an asynchronous backbone to handle heavy multimodal ingestion while maintaining a responsive, streaming user experience.

---

## Key Capabilities

- **Deep Multimodal Ingestion**
  - High-fidelity parsing via **LlamaParse** for structural integrity.
  - **Multimodal Summarization:** Images and tables are transformed into information-dense textual summaries via **GPT-5-Nano**, ensuring visual context is fully searchable.
- **Advanced Hybrid Retrieval Pipeline**
  - **Dense Search:** Semantic vector search using OpenAI `text-embedding-3-small` in **pgvector**.
  - **Sparse Search:** BM25 keyword matching to capture specific technical terminology.
  - **Rank Fusion:** Results unified via **Reciprocal Rank Fusion (RRF)**.
  - **Cross-Encoder Reranking:** Final top-k results refined by **Cohere Rerank-v4.0** for maximum precision.
- **Asynchronous Orchestration**
  - Decoupled ingestion pipeline using **Celery** and **Redis** to handle parallel processing of document chunks.
- **Conversational Intelligence**
  - Streaming RAG chat powered by **GPT-5-Nano** via **LiteLLM**, providing grounded, long-context reasoning.

---

## System Architecture

### High-Level Flow

1. **Ingestion:** User uploads PDF → Assets (images/docs) persisted in **Amazon S3**.
2. **Parsing:** LlamaParse extracts text, HTML tables, and image assets page-wise.
3. **Task Queue:** Celery workers trigger parallel multimodal summarization and embedding jobs.
4. **Storage:** Metadata and embeddings are stored in **PostgreSQL (pgvector)**.
5. **Retrieval:** User query triggers a dual-path (Vector + BM25) search → RRF Merge → Cohere Rerank.
6. **Generation:** Re-ranked context is passed to the LLM for a streamed, grounded response.

### Core Design Decisions

- **Service Decoupling:** FastAPI handles the API layer, while Celery/Redis manages heavy-duty ingestion, preventing request blocking.
- **Storage Strategy:** Large binary objects (images) are offloaded to S3, keeping the database lean and performant.
- **Unified LLM Interface:** **LiteLLM** acts as the gateway for all model interactions, simplifying model swapping and fallback logic.

---

## Tech Stack

### Backend & Orchestration

- **Framework:** FastAPI
- **Database:** PostgreSQL + **pgvector**
- **Task Queue:** Celery
- **Message Broker / Cache:** Redis
- **Storage:** Amazon S3

### AI / ML Pipeline

- **Orchestration:** LiteLLM (OpenAI-standard wrapper)
- **Parsing:** LlamaParse
- **Embedding Model:** `text-embedding-3-small` (OpenAI)
- **Reranker:** `rerank-v4.0-pro` (Cohere)
- **Multimodal & Chat Models:** `gpt-5-nano`
- **Retrieval Logic:** Hybrid (Dense + BM25) with Reciprocal Rank Fusion (RRF)

### Frontend

- **React:** Modern UI for document management and streaming chat interface.

---

## Processing Workflow

1. **Upload:** PDF is received and moved to S3.
2. **Parse:** Document is split into page-level chunks.
3. **Summarize:** Visual chunks (images/tables) are sent to GPT-5-Nano for textual description.
4. **Embed:** All text and summaries are converted into 1536-dimensional vectors.
5. **Query:**
   - Query embedded $\rightarrow$ Vector Search.
   - Query tokenized $\rightarrow$ BM25 Search.
   - **RRF** merges both lists.
   - **Cohere** reranks the top results.
6. **Chat:** Reranked context is injected into the prompt for a streaming response.

---

## Why This Project?

This project was built to solve common "toy-RAG" failures:

- **Multimodal Blindness:** Solving the "images aren't searchable" problem via GPT-powered summarization.
- **Retrieval Precision:** Using Hybrid search + RRF + Reranking to ensure the most relevant context is always in the top-k.
- **System Scalability:** Using an asynchronous worker-based architecture to prevent ingestion bottlenecks.

---

## Future Roadmap

- [ ] **Conversation Memory:** Implement Redis-backed session history.
- [ ] **Observability:** Integrate Tracing (LangSmith/Arize) to monitor retrieval quality.
- [ ] **Advanced Parsing:** Section-aware chunking for better context window management.
