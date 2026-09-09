# Thai Bank Money Map — 3D + research

Next.js / React Three Fiber banking world with bank-specific evidence retrieval.

## Explore
Click a bank tower → **เข้าไปในตึก** → select one of six floors → click a metric node.
The panel shows imported figures, reporting scope, dates, notes, source links and evidence search.
Use breadcrumbs to leave the interior. Mobile keeps the 3D world and uses a bottom panel.
“ตามเงิน ฿100” is a guided educational sequence through the floors, not a traced deposit, bank forecast or factual allocation.

## Run
`npm ci` then `npm run dev`. Production: `npm run build` / `npm start`.
Use the Next.js preset on Vercel. No Python service or API key is needed at runtime.

## Data integrity
- Initial source: user-provided thai-bank-rag-starter ZIP, September 9, 2026.
- Data is imported with its stated provenance, not independently reverified by this integration.
- The initial corpus has 0 research documents; 91 chunks come from the structured seed.
- Unknown values stay null. Missing metrics display DATA NOT AVAILABLE.
- Search is scoped strictly to ticker and financial period; market snapshots retain their own dates.
- Different loan-mix taxonomies/periods are shown explicitly and are not summed together.
- No generated financial answers or investment recommendations.
- Tower heights, floors, paths and particles are educational geometry, not data scales.

## Update research
See [research/README.md](research/README.md). Add corpus documents with metadata, rebuild the index, validate/import, review, and deploy. Adding documents does not overwrite verified structured facts.
There is no public upload endpoint or automatic live sync in this version.

## Verification
`node --test tests/rag.test.cjs`
`npm run build`

3D browser acceptance requires a WebGL-capable browser. Build and retrieval tests do not establish visual or GPU performance acceptance.
