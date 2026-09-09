from __future__ import annotations
import argparse
import json
from .retriever import build_context


def main():
    p = argparse.ArgumentParser()
    p.add_argument("query", nargs="+", help="Question, e.g. KBANK NIM Q2 2026")
    p.add_argument("--top-k", type=int, default=8)
    p.add_argument("--context", action="store_true", help="Print LLM-ready context")
    args = p.parse_args()
    q = " ".join(args.query)
    out = build_context(q, top_k=args.top_k)
    if args.context:
        print(out["context"])
    else:
        print(json.dumps({"query": q, "facts": out["facts"], "documents": out["documents"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
