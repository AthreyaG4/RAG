from collections import defaultdict


def reciprocal_rank_fusion(result_lists, k=60):
    scores = defaultdict(float)
    doc_map = {}

    for results in result_lists:
        for rank, doc in enumerate(results, start=1):
            scores[doc.id] += 1.0 / (k + rank)
            doc_map[doc.id] = doc

    sorted_ids = sorted(scores.keys(), key=lambda doc_id: scores[doc_id], reverse=True)

    return [doc_map[doc_id] for doc_id in sorted_ids]
