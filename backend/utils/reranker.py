import cohere

co = cohere.ClientV2()


def reranker(query: str, fused_chunks: list[dict]) -> list[dict]:
    documents = [fc.summarised_content for fc in fused_chunks]

    results = co.rerank(
        model="rerank-v4.0-pro",
        query=query,
        documents=documents,
        top_n=3,
    )

    reranked = []
    for r in results.results:
        chunk = fused_chunks[r.index]
        reranked.append(chunk)

    return reranked
