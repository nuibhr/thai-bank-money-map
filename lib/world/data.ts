import raw from '@/data/rag/facts.json';
import taxonomy from '@/data/exposure-taxonomy.json';
import {numberOrNull,type Exposure,type WorldData} from './model';
import {metricForPeriod} from '@/lib/bank-sections';
type R=Record<string,unknown>;
const data=raw as unknown as {meta:R;banks:R[];market:R[];loan_mix:R[];sources:R[]};
export function buildWorldData():WorldData{
 const tickers=[...new Set(data.banks.map(b=>String(b.ticker)))];
 return {updated:String(data.meta.prepared_at??''),status:'IMPORTED — SOURCE CLAIMS NOT REVERIFIED',sources:data.sources,banks:tickers.map(ticker=>{
 const b=data.banks.filter(b=>b.ticker===ticker).sort((a,b)=>String(b.fin_period_end).localeCompare(String(a.fin_period_end)))[0];
 const market=data.market.filter(b=>b.ticker===ticker).sort((a,b)=>String(b.as_of).localeCompare(String(a.as_of)))[0]??{};
 const rows=data.loan_mix.filter(r=>r.ticker===ticker&&Number.isFinite(Date.parse(String(r.period)))&&String(r.period)<=String(b.fin_period_end));
 const latest=rows.map(r=>String(r.period)).sort().at(-1);const latestRows=rows.filter(r=>r.period===latest);
 // Each taxonomy remains separate. Never add parent + child categories or mix companies with economic sectors.
 const primary=latestRows[0]?.taxonomy;const exclusions=taxonomy.excludeInTaxonomy as Record<string,string[]>;
 const exposure=latestRows.filter(r=>r.taxonomy===primary&&!taxonomy.excludedCategories.includes(String(r.category))&&!(exclusions[String(r.taxonomy)]??[]).includes(String(r.category)));
 const exposures:Exposure[]=exposure.map(r=>({category:String(r.category),destination:(taxonomy.destinations as Record<string,string>)[String(r.category)]??null,amount:numberOrNull(r.amount),share:numberOrNull(r.share),period:String(r.period),taxonomy:String(r.taxonomy),source:String(r.source??''),note:String(r.note??''),company:taxonomy.companyTaxonomies.includes(String(r.taxonomy))}));
 const period=String(b.fin_period_end);const q=(key:string)=>numberOrNull(metricForPeriod(b,key,period));
 return {ticker,period,scope:String(b.entity_level??''),roe:q('roe_q2'),nim:q('nim_q2'),npl:numberOrNull(b.npl_pct),assets:numberOrNull(b.assets),loans:numberOrNull(b.loans),deposits:numberOrNull(b.deposits),profit:q('q2_profit'),creditCost:q('credit_cost_q2'),car:numberOrNull(b.car),pbv:numberOrNull(market.pbv),pe:numberOrNull(market.pe),marketCap:numberOrNull(market.market_cap),growth:numberOrNull(b.earnings_growth),marketDate:String(market.as_of??''),marketNote:String(market.note??''),sources:String(b.sources??''),exposures};
 })}
}
