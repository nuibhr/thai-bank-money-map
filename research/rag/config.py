from pathlib import Path
import os
import json

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SEED_DIR = ROOT / "seed"
CORPUS_DIR = DATA_DIR / "corpus"
GENERATED_DIR = DATA_DIR / "generated"
SEED_JSON = Path(os.environ.get("SEED_JSON", str(SEED_DIR / "thai_bank_data_pack_2026-09-09.json")))
CHUNKS_JSONL = GENERATED_DIR / "chunks.jsonl"
WEB_INDEX_JSON = GENERATED_DIR / "web_index.json"
FACTS_JSON = GENERATED_DIR / "facts.json"
VECTORIZER_FILE = GENERATED_DIR / "tfidf_vectorizer.joblib"
MATRIX_FILE = GENERATED_DIR / "tfidf_matrix.npz"

BANKS = sorted({b["ticker"] for b in json.loads(SEED_JSON.read_text(encoding="utf-8")).get("banks", [])})
