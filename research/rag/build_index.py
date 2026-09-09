from __future__ import annotations
import json
from pathlib import Path

import joblib
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer

from .config import CORPUS_DIR, GENERATED_DIR, CHUNKS_JSONL, WEB_INDEX_JSON, FACTS_JSON, VECTORIZER_FILE, MATRIX_FILE, SEED_JSON
from .loaders import SUPPORTED, load_file
from .structured_facts import load_seed, seed_fact_chunks


def main() -> None:
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    CORPUS_DIR.mkdir(parents=True, exist_ok=True)
    seed = load_seed(SEED_JSON)
    chunks = seed_fact_chunks(seed)

    file_count = 0
    errors: list[dict] = []
    for path in sorted(CORPUS_DIR.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED:
            continue
        if path.name.endswith(".meta.json") or path.name.lower().startswith("readme"):
            continue
        file_count += 1
        try:
            loaded = list(load_file(path))
            if not loaded:
                raise ValueError("No readable text; OCR or extraction review required")
            chunks.extend(loaded)
        except Exception as e:
            errors.append({"file": str(path), "error": str(e)})

    seen = set()
    unique = []
    for c in chunks:
        key = (c["text"], c["metadata"].get("path"), c["metadata"].get("unit"), c["metadata"].get("doc_type"))
        if key in seen or not c["text"].strip():
            continue
        seen.add(key)
        unique.append(c)
    chunks = unique

    texts = [c["text"] for c in chunks]
    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=1, sublinear_tf=True, max_features=180000)
    matrix = vectorizer.fit_transform(texts)
    joblib.dump(vectorizer, VECTORIZER_FILE)
    sparse.save_npz(MATRIX_FILE, matrix)

    with CHUNKS_JSONL.open("w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")

    web = {
        "meta": {"chunk_count": len(chunks), "corpus_file_count": file_count, "errors": errors},
        "chunks": [{"id": c["id"], "text": c["text"][:2200], "metadata": c["metadata"]} for c in chunks],
    }
    WEB_INDEX_JSON.write_text(json.dumps(web, ensure_ascii=False), encoding="utf-8")
    FACTS_JSON.write_text(json.dumps(seed, ensure_ascii=False), encoding="utf-8")

    print(f"Built index: {len(chunks)} chunks from {file_count} corpus files + structured seed")
    print(f"Matrix shape: {matrix.shape}")
    if errors:
        print(f"Warnings: {len(errors)} file(s) failed. See web_index.json meta.errors")


if __name__ == "__main__":
    main()
