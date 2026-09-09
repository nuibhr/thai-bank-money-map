from __future__ import annotations
import json
import re
from pathlib import Path
from typing import Any

from .config import SEED_JSON, BANKS
from .chunking import stable_id

METRIC_ALIASES = {
    "nim": ["nim", "net interest margin", "ส่วนต่างดอกเบี้ย"],
    "roe_q2": ["roe", "return on equity", "ผลตอบแทนต่อส่วนผู้ถือหุ้น"],
    "npl_pct": ["npl", "หนี้เสีย", "non-performing"],
    "credit_cost_q2": ["credit cost", "ต้นทุนเครดิต", "ต้นทุนสินเชื่อ"],
    "coverage": ["coverage", "coverage ratio", "สำรองต่อ npl"],
    "casa": ["casa", "เงินฝากต้นทุนต่ำ"],
    "cost_fund": ["cost of fund", "cost fund", "ต้นทุนเงินทุน"],
    "cost_deposit": ["cost of deposit", "ต้นทุนเงินฝาก"],
    "yield_loans": ["loan yield", "yield loan", "ผลตอบแทนสินเชื่อ"],
    "assets": ["asset", "assets", "สินทรัพย์"],
    "loans": ["loan", "loans", "สินเชื่อรวม"],
    "deposits": ["deposit", "deposits", "เงินฝาก"],
    "equity_attrib": ["equity", "book value", "ส่วนผู้ถือหุ้น"],
    "q2_profit": ["q2 profit", "กำไร q2", "กำไรไตรมาส"],
    "h1_profit": ["h1 profit", "กำไรครึ่งปี", "กำไร 6 เดือน"],
    "car": ["car", "capital adequacy", "เงินกองทุนรวม"],
    "tier1": ["tier 1", "tier1"],
    "ldr": ["ldr", "loan to deposit", "สินเชื่อต่อเงินฝาก"],
    "loan_growth_ytd": ["loan growth", "สินเชื่อโต", "loan growth ytd"],
    "deposit_growth_ytd": ["deposit growth", "เงินฝากโต"],
}
MARKET_ALIASES = {
    "price": ["price", "ราคา", "ราคาหุ้น"],
    "market_cap": ["market cap", "มาร์เก็ตแคป", "มูลค่าตลาด"],
    "pe": ["p/e", "pe", "พีอี"],
    "pbv": ["p/bv", "pbv", "พีบีวี"],
    "dividend_yield": ["dividend yield", "yield ปันผล", "ปันผล"],
}


def load_seed(path: Path = SEED_JSON) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def detect_tickers(query: str) -> list[str]:
    q = query.upper()
    return [t for t in BANKS if re.search(rf"\b{re.escape(t)}\b", q)]


def _metric_hits(query: str, aliases: dict[str, list[str]]) -> list[str]:
    q = query.lower()
    out = []
    for field, words in aliases.items():
        if any(w.lower() in q for w in words):
            out.append(field)
    return out


def direct_facts(query: str, seed: dict[str, Any] | None = None) -> list[dict]:
    seed = seed or load_seed()
    tickers = detect_tickers(query)
    bank_fields = _metric_hits(query, METRIC_ALIASES)
    market_fields = _metric_hits(query, MARKET_ALIASES)
    if not tickers and not bank_fields and not market_fields:
        return []
    if not tickers:
        tickers = BANKS

    facts = []
    for row in seed.get("banks", []):
        t = row.get("ticker")
        if t not in tickers:
            continue
        fields = bank_fields or ["nim_q2", "roe_q2", "npl_pct", "credit_cost_q2", "coverage"]
        for field in fields:
            value = row.get(field)
            if field == "nim" and value is None:
                value = row.get("nim_q2")
                actual_field = "nim_q2"
            else:
                actual_field = field
            if value is None:
                continue
            facts.append({
                "ticker": t,
                "field": actual_field,
                "value": value,
                "period": row.get("fin_period_end"),
                "source_ids": row.get("sources", "").split("; ") if row.get("sources") else [],
                "status": "REPORTED_OR_DATASET_DERIVED",
                "scope": row.get("entity_level"),
            })
    for row in seed.get("market", []):
        t = row.get("ticker")
        if t not in tickers:
            continue
        for field in market_fields:
            value = row.get(field)
            if value is None:
                continue
            facts.append({
                "ticker": t,
                "field": field,
                "value": value,
                "period": row.get("as_of"),
                "source_ids": [row.get("source")] if row.get("source") else [],
                "status": "MARKET_SNAPSHOT",
                "scope": "listed_entity",
            })
    return facts


def seed_fact_chunks(seed: dict[str, Any] | None = None) -> list[dict]:
    seed = seed or load_seed()
    chunks: list[dict] = []
    source_map = {s.get("id"): s for s in seed.get("sources", [])}

    for row in seed.get("banks", []):
        t = row.get("ticker")
        lines = [f"Ticker: {t}", f"Entity: {row.get('listed_entity')}", f"Period end: {row.get('fin_period_end')}"]
        for k, v in row.items():
            if k in {"ticker", "listed_entity", "sources", "notes"} or v is None:
                continue
            lines.append(f"{k}: {v}")
        if row.get("notes"):
            lines.append(f"notes: {row['notes']}")
        chunks.append({
            "id": stable_id("seed-bank", t),
            "text": "\n".join(lines),
            "metadata": {"ticker": t, "doc_type": "structured_bank_snapshot", "source_kind": "structured_fact", "source_ids": row.get("sources", "").split("; ") if row.get("sources") else [], "period": row.get("fin_period_end")},
        })

    for section in ["market", "loan_mix", "macro", "asset_quality", "funding_mix", "capital_entity"]:
        for i, row in enumerate(seed.get(section, [])):
            t = row.get("ticker")
            text = f"Section: {section}\n" + "\n".join(f"{k}: {v}" for k, v in row.items() if v is not None)
            chunks.append({
                "id": stable_id("seed", section, i, t),
                "text": text,
                "metadata": {"ticker": t, "doc_type": f"structured_{section}", "source_kind": "structured_fact", "source_ids": [row.get("source")] if row.get("source") else [], "period": row.get("period") or row.get("as_of") or row.get("ref_period")},
            })
    return chunks


def source_lookup(seed: dict[str, Any] | None = None) -> dict[str, dict]:
    seed = seed or load_seed()
    return {s.get("id"): s for s in seed.get("sources", []) if s.get("id")}
