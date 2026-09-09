import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
const input=process.argv[2];if(!input)throw new Error('Usage: node scripts/import-rag.mjs /path/to/data/generated');
const facts=JSON.parse(await readFile(resolve(input,'facts.json'),'utf8'));
const index=JSON.parse(await readFile(resolve(input,'web_index.json'),'utf8'));
if(!Array.isArray(facts.banks)||!Array.isArray(facts.sources)||!Array.isArray(index.chunks))throw new Error('Invalid RAG schema');
if(index.meta?.errors?.length)throw new Error('Corpus has ingestion errors; fix before publishing');
const tickers=new Set(facts.banks.map(b=>b.ticker));
for(const bank of facts.banks)if(!bank.ticker||!bank.fin_period_end)throw new Error('Bank ticker and period required');
const ids=new Set();for(const c of index.chunks){if(!c.id||typeof c.text!=='string'||!c.metadata||ids.has(c.id))throw new Error('Invalid/duplicate chunk');ids.add(c.id);if(c.metadata.source_kind==='local_document'&&(!tickers.has(c.metadata.ticker)||!c.metadata.period))throw new Error('Document must identify bank and period: '+c.id);delete c.metadata.path;}
for(const key of ['market','loan_mix','funding_mix','asset_quality','capital_entity'])if(!Array.isArray(facts[key]))facts[key]=[];
const dest=resolve('data/rag');await mkdir(dest,{recursive:true});
for(const [name,data] of [['facts.json',facts],['web_index.json',index]]){await writeFile(resolve(dest,name+'.tmp'),JSON.stringify(data,null,2)+'\n');await rename(resolve(dest,name+'.tmp'),resolve(dest,name))}
console.log(`Imported ${facts.banks.length} snapshots, ${index.chunks.length} chunks. Review git diff and source rights before publication.`);
