from celery_app import celery_app
from db import SessionLocal
from models import Document, Chunk, Project, Image
from uuid import UUID
from utils.s3 import get_presigned_urls_for_chunk_images
from litellm import embedding, completion


@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=10,
    retry_kwargs={"max_retries": 3},
)
def process_chunk(self, chunk_id: str):
    db = SessionLocal()

    summarized_text = ""
    try:
        chunk_uuid = UUID(chunk_id)

        chunk = db.query(Chunk).filter(Chunk.id == chunk_uuid).with_for_update().first()

        if not chunk:
            return {"status": "error", "message": "Chunk not found"}

        if chunk.status == "embedded":
            return {"status": "already_processed"}

        document = (
            db.query(Document)
            .filter(Document.id == chunk.document_id)
            .with_for_update()
            .first()
        )

        images = db.query(Image).filter(Image.chunk_id == chunk.id).all()

        if len(images) != 0:
            image_urls = get_presigned_urls_for_chunk_images(
                images=images,
                expires_in=900,
            )

            messages = [
                {
                    "role": "system",
                    "content": """
                        Task: Create a brief, searchable summary (under 500 words total).

                        Structure:
                        **Overview:** 2 sentences - what this is about
                        **Facts:** Bullet list - key details only  
                        **Visual:** 2 sentences - image description
                        **Questions:** List 4-5 questions (no answers)
                        **Keywords:** 15-20 search terms

                        Be concise and avoid repetition.
                    """,
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": chunk.content},
                        *[
                            {"type": "image_url", "image_url": url}
                            for url in image_urls
                        ],
                    ],
                },
            ]

            response = completion(
                model="gpt-5-mini",
                max_tokens=2000,
                reasoning_effort="low",
                messages=messages,
                stream=False,
            )

            summarized_text = response.choices[0].message.content

            chunk.summarised_content = summarized_text + "\n\n" + chunk.content
        else:
            chunk.summarised_content = chunk.content
            summarized_text = chunk.content

        chunk.status = "summarized"
        document.chunks_summarized += 1

        embed_resp = embedding(
            model="text-embedding-3-small", input=summarized_text, dimensions=384
        )

        chunk.embedding = embed_resp.data[0]["embedding"]
        chunk.status = "embedded"
        document.chunks_embedded += 1

        if document.chunks_embedded == document.total_chunks:
            document.status = "ready"

            project = (
                db.query(Project)
                .filter(Project.id == document.project_id)
                .with_for_update()
                .first()
            )

            all_docs = (
                db.query(Document).filter(Document.project_id == project.id).all()
            )

            if all(
                d.status == "ready" and d.chunks_embedded == d.total_chunks
                for d in all_docs
            ):
                project.status = "ready"

        db.commit()
        return {"status": "done"}

    except:
        db.rollback()

        chunk = db.query(Chunk).filter(Chunk.id == chunk_uuid).first()
        if chunk:
            chunk.status = "failed"
            document = (
                db.query(Document).filter(Document.id == chunk.document_id).first()
            )
            if document:
                document.status = "failed"
            db.commit()

        raise

    finally:
        db.close()
