import numpy as np
from typing import List, Dict, Any

class ColBERTReranker:
    """
    ColBERT Late-Interaction MaxSim Reranker for Dish Semantic Search.
    Calculates token-level late-interaction dot products between query token embeddings
    and candidate dish token embeddings:
        Score(Q, D) = sum_{i in Q} max_{j in D} (E_q(i) . E_d(j)^T)
    """
    def __init__(self, dim: int = 32):
        self.dim = dim
        np.random.seed(42)

    def _get_token_embeddings(self, text: str) -> np.ndarray:
        """Simulates token embedding vectors for input text using deterministic hashing."""
        tokens = text.lower().split()
        if not tokens:
            return np.zeros((1, self.dim))
            
        embeddings = []
        for token in tokens:
            # Deterministic pseudo-random seed per token string
            token_hash = abs(hash(token)) % (2**31)
            rng = np.random.RandomState(token_hash)
            vec = rng.randn(self.dim)
            vec /= np.linalg.norm(vec) + 1e-9
            embeddings.append(vec)
            
        return np.array(embeddings)

    def score(self, query: str, document: str) -> float:
        """Calculates MaxSim late-interaction score between query and document text."""
        Q = self._get_token_embeddings(query)      # Shape: (N_q, dim)
        D = self._get_token_embeddings(document)   # Shape: (N_d, dim)

        # Token-level similarity matrix: (N_q, N_d)
        sim_matrix = np.dot(Q, D.T)
        
        # MaxSim per query token, then sum over query tokens
        max_sim_per_q_token = np.max(sim_matrix, axis=1)
        total_score = float(np.sum(max_sim_per_q_token))
        return round(total_score, 4)

    def rerank(self, query: str, candidates: List[Dict[str, Any]], text_key: str = "name") -> List[Dict[str, Any]]:
        """Reranks candidate dictionary items by MaxSim score in descending order."""
        if not candidates:
            return []

        scored = []
        for item in candidates:
            doc_text = item.get(text_key, "") + " " + item.get("description", "")
            sc = self.score(query, doc_text)
            item_copy = dict(item)
            item_copy["colbert_score"] = sc
            scored.append(item_copy)

        scored.sort(key=lambda x: x["colbert_score"], reverse=True)
        return scored

colbert_reranker = ColBERTReranker()
