from __future__ import annotations
import json
import re
from functools import lru_cache

import joblib
import numpy as np
from scipy import sparse
from sklearn.metrics.pairwise import cosine_similarity

from .config import CHUNKS_JSONL, VECTORIZER_FILE, MATRIX_FILE, BANKS
from .structured_facts import direct_facts, load_seed, source_lookup


def _detect_ticker(query: str) -> str | None:
    q = query.upper()
    for t in BANKS:
        if re.search(rf"\b{re.escape(t)}\b", q):
            return t
    return None


@lru_cache(maxsize=1)
def _load_index():
    if not CHUNKS_JSONL.exists():
        raise FileNotFoundError("RAG index missing. Run: python -m rag.build_index")
    chunks = [json.loads(line) for line in CHUNKS_JSONL.read_text(encoding="utf-8").splitlines() if line.strip()]
    vectorizer = joblib.load(VECTORIZER_FILE)
    matrix = sparse.load_npz(MATRIX_FILE)
    seed = load_seed()
    return chunks, vectorizer, matrix, seed, source_lookup(seed)


def search(query: str, top_k: int = 8) -> dict:
    chunks, vectorizer, matrix, seed, sources = _load_index()
    qv = vectorizer.transform([query])
    scores = cosine_similarity(qv, matrix).ravel()
    ticker = _detect_ticker(query)

    adjusted = scores.copy()
    direct = direct_facts(query, seed)
    fact_fields = {str(f.get("field", "")).lower() for f in direct}
    if ticker:
        for i, c in enumerate(chunks):
            ct = c.get("metadata", {}).get("ticker")
            if ct == ticker:
                adjusted[i] += 0.18
            elif ct and ct != ticker:
                adjusted[i] -= 0.08
    for i, c in enumerate(chunks):
        meta = c.get("metadata", {})
        if meta.get("source_kind") == "structured_fact":
            adjusted[i] += 0.025
        text_lower = c.get("text", "").lower()
        if fact_fields and meta.get("doc_type") == "structured_bank_snapshot":
            if any(field in text_lower for field in fact_fields):
                adjusted[i] += 0.24
        if ticker and meta.get("doc_type") == "structured_bank_snapshot" and meta.get("ticker") == ticker:
            adjusted[i] += 0.04

    order = np.argsort(-adjusted)[: max(top_k * 3, top_k)]
    results = []
    for idx in order:
        c = chunks[int(idx)]
        meta = c.get("metadata", {})
        if ticker and meta.get("ticker") not in {None, ticker}:
            continue
        srcs = []
        for sid in meta.get("source_ids", []) or []:
            if sid in sources:
                srcs.append(sources[sid])
            elif sid:
                srcs.append({"id": sid})
        results.append({"score": round(float(adjusted[idx]), 5), "id": c["id"], "text": c["text"], "metadata": meta, "sources": srcs})
        if len(results) >= top_k:
            break

    return {"query": query, "ticker": ticker, "facts": direct, "documents": results}


def build_context(query: str, top_k: int = 8, max_chars: int = 12000) -> dict:
    result = search(query, top_k=top_k)
    lines = ["[STRUCTURED FACTS]"]
    for f in result["facts"]:
        lines.append(json.dumps(f, ensure_ascii=False))
    lines.append("\n[RETRIEVED DOCUMENT EVIDENCE]")
    used = len("\n".join(lines))
    for i, d in enumerate(result["documents"], start=1):
        header = f"\n--- EVIDENCE {i} | score={d['score']} | metadata={json.dumps(d['metadata'], ensure_ascii=False)}"
        src = ""
        if d["sources"]:
            src = "\nSOURCES: " + json.dumps(d["sources"], ensure_ascii=False)
        block = header + src + "\n" + d["text"]
        if used + len(block) > max_chars:
            break
        lines.append(block)
        used += len(block)
    return {**result, "context": "\n".join(lines)}
