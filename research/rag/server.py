from __future__ import annotations
from fastapi import FastAPI, Query
from .retriever import search, build_context
from .prompt import SYSTEM_PROMPT

app = FastAPI(title="Thai Bank Money Map RAG", version="0.1.0")

@app.get("/health")
def health():
    return {"ok": True, "service": "thai-bank-rag"}

@app.get("/search")
def rag_search(q: str = Query(..., min_length=2), top_k: int = Query(8, ge=1, le=20)):
    return search(q, top_k=top_k)

@app.get("/context")
def rag_context(q: str = Query(..., min_length=2), top_k: int = Query(8, ge=1, le=20)):
    out = build_context(q, top_k=top_k)
    return {"query": q, "system_prompt": SYSTEM_PROMPT, "context": out["context"], "facts": out["facts"], "documents": out["documents"]}
