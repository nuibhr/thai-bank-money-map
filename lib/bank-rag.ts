import rawFacts from '@/data/rag/facts.json';
import rawIndex from '@/data/rag/web_index.json';
export type Row=Record<string,string|number|null>;
export type Evidence={id:string;text:string;metadata:Record<string,unknown>;score?:number};
const facts=rawFacts as unknown as {meta:Record<string,string>;banks:Row[];market:Row[];loan_mix:Row[];funding_mix:Row[];asset_quality:Row[];capital_entity:Row[];sources:Row[]};
const index=rawIndex as {meta:{chunk_count:number;corpus_file_count:number;errors:unknown[]};chunks:Evidence[]};
export const tickers=[...new Set(facts.banks.map(b=>String(b.ticker)))];
const grams=(s:string)=>{const t=s.toLowerCase().replace(/\s+/g,' ').trim();return new Set(Array.from({length:Math.max(0,t.length-2)},(_,i)=>t.slice(i,i+3)))};
export function searchBankRag(ticker:string,query='',period='',topK=8){
 if(!tickers.includes(ticker)) throw new Error('Unknown bank');
 const banks=facts.banks.filter(b=>b.ticker===ticker);
 const periods=[...new Set(banks.map(b=>String(b.fin_period_end)))].sort().reverse();
 const chosen=period||periods[0];
 if(!periods.includes(chosen))throw new Error('Unknown period');
 const bank=banks.find(b=>b.fin_period_end===chosen)!;
 const q=grams(query);
 const documents=index.chunks.filter(c=>c.metadata.ticker===ticker&&(!c.metadata.period||String(c.metadata.period)===chosen)).map(c=>{
 const g=grams(c.text);let hits=0;for(const x of q)if(g.has(x))hits++;
 return {...c,score:q.size?hits/Math.sqrt(q.size*Math.max(1,g.size)):1};
 }).filter(c=>c.score>0).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(20,topK)));
 return {ticker,period:chosen,periods,bank,market:facts.market.filter(b=>b.ticker===ticker),loanMix:facts.loan_mix.filter(b=>b.ticker===ticker),fundingMix:facts.funding_mix.filter(b=>b.ticker===ticker),assetQuality:facts.asset_quality.filter(b=>b.ticker===ticker),capitalEntity:facts.capital_entity.filter(b=>b.ticker===ticker),sources:facts.sources.filter(s=>s.entity===ticker),documents,meta:{...facts.meta,...index.meta,prepared_at:facts.meta.prepared_at,verification:'Imported user-supplied dataset; source claims have not been independently reverified in this integration.'}};
}
export type BankResearch=ReturnType<typeof searchBankRag>;
