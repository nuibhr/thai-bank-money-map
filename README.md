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

## Spatial navigation refinement
Left-side layer navigation, contextual upstream/downstream links, expandable bank floors, and separate evidence/source views follow the exploration pattern requested in the INVX reference. The actual WebGL scene is schematic banking geometry; no INVX assets, company data or branding were copied.

## V3 spatial banking world

The primary view is a full-screen React Three Fiber / WebGL world. Seven original procedural tower variants sit between deposit origins, economic districts, risk/provision machines, and capital/shareholders. Buildings, streams, and district labels are selectable. OrbitControls supports orbit, pan, and zoom; GSAP flies the camera between targets. Enter a bank to inspect the six existing financial layers and retrieve bank/period-scoped RAG evidence.

**FOLLOW ฿100** follows one emissive 3D marker along a continuous CatmullRomCurve3 through twelve locations (approximately one minute). Manual camera controls are disabled while following; pause or Escape exits/restores interaction. The narration explicitly switches from deposit principal to the income concept at the interest stage: dividends are not the depositor's principal being paid away.

Ten views: overview, funding origins, bank district, system flows, concentration, loan destinations, illustrative credit stress, profit/shareholders, three-bank comparison, and an orbitable valuation galaxy. Comparison towers move into formation; valuation uses imported P/BV, ROE, and market capitalization with financial/market dates retained. Missing earnings growth is not encoded on Z and is never labeled zero. Mobile retains WebGL with fewer particles/buildings, lower DPR, and no shadows.

### Data boundaries

- `data/world.json` owns the spatial layout; tower height is architectural, **not** a financial metric.
- `data/exposure-taxonomy.json` excludes overlapping parent/child rows and maps loan categories to broad destinations. Corporate exposure is not assumed to be manufacturing or tourism.
- `/api/bank-world` serves the normalized view from `lib/world/data.ts`. RAG search remains `/api/bank-rag/search`.
- Concentration widths use square-root scaling relative to the largest category **within the selected bank**. Amounts are used only when every displayed row has an amount; otherwise reported shares are used. Unknown values produce no measured exposure line. Widths are not comparable between banks.
- KBANK loan mix is March 2026 while its main snapshot is June. SCB's mix is by group company, not industry, and uses separate company satellites. BBL and TTB have no loan mix in this import. Imported rounded subtotals are preserved rather than silently adjusted to reconcile.
- All imported figures retain source IDs, source links, dates, and the notice that original source claims have **not been independently reverified**. Unavailable metrics remain null/N/A.
- Depositor routes, generic borrower flows, particle counts, cost removal, and the credit-stress slider are **ILLUSTRATIVE**. The slider does not calculate bank NPL ratios, provisions, earnings, or capital forecasts. It changes visual behavior only.
- Sector districts are conceptual macro storytelling unless a supported loan category is selected. No geographic bank exposures are inferred.

Update research using the existing ingestion + `scripts/import-rag.mjs` workflow, review, then deploy. This release does not add unattended upload/publishing or generated investment advice.

### Verification

Run `node --test tests/rag.test.cjs tests/world.test.cjs` and `npm run build`. Tests cover ticker/period isolation, missing values, independent market dates, and non-overlapping loan taxonomy. HTTP smoke tests exercise the home page and both APIs. Interactive WebGL rendering, camera motion, and frame rate require a browser with WebGL enabled; a successful build does not establish GPU performance.
