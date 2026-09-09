'use client';
import {useEffect,useState} from 'react';
import type {BankResearch,Row} from '@/lib/bank-rag';
import {sectionById,definitions,metricForPeriod,type SectionId} from '@/lib/bank-sections';
const format=(v:unknown)=>v===null||v===undefined?'DATA NOT AVAILABLE':typeof v==='number'?v.toLocaleString('th-TH',{maximumFractionDigits:2}):String(v);
const safeUrl=(s:unknown)=>typeof s==='string'&&/^https?:\/\//.test(s)?s:null;
export default function ResearchPanel({ticker,section,metric,onMetric,view}:{ticker:string;view:'overview'|'evidence'|'sources';section:SectionId|null;metric:string|null;onMetric:(s:string)=>void}){
 const [data,setData]=useState<BankResearch|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[query,setQuery]=useState(''),[search,setSearch]=useState(''),[period,setPeriod]=useState('');
 useEffect(()=>{setPeriod('');setQuery('');setSearch('')},[ticker]);
 useEffect(()=>{const abort=new AbortController();setBusy(true);setError('');setData(null);fetch(`/api/bank-rag/search?${new URLSearchParams({ticker,q:search,period})}`,{signal:abort.signal}).then(async r=>{if(!r.ok)throw new Error('โหลดข้อมูลไม่สำเร็จ');return r.json()}).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>{if(!abort.signal.aborted)setBusy(false)});return()=>abort.abort()},[ticker,search,period]);
 const current=section?sectionById(section):null;
 return <div className="research-content" aria-busy={busy}>
 {busy&&<p role="status">กำลังค้นข้อมูล {ticker}…</p>}{error&&<p role="alert">{error} <button onClick={()=>setSearch(s=>s+' ')}>ลองอีกครั้ง</button></p>}
 {data&&<><div className="provenance">ข้อมูลจากชุด RAG ที่นำเข้า · ยังไม่ได้ตรวจต้นฉบับซ้ำ</div><p className="muted">{data.bank.listed_entity}<br/>{data.bank.entity_level}</p>
 <label>งวดงบการเงิน <select value={data.period} onChange={e=>setPeriod(e.target.value)}>{data.periods.map(p=><option key={p}>{p}</option>)}</select></label>
 <p className="muted">อัปเดตชุดข้อมูล: {data.meta.prepared_at}</p>
 {view==='overview'&&<><h3>{current?.label||'ข้อมูลธนาคาร'}</h3>
 {current?<div className="metric-list">{current.children.map(([id,label,unit])=><button key={id} className={metric===id?'active':''} onClick={()=>onMetric(id)}><span>{label}</span><strong>{format(metricForPeriod(data.bank,id,data.period))} {metricForPeriod(data.bank,id,data.period)!=null?unit:''}</strong></button>)}</div>:<p>เลือกชั้นในตึกเพื่อดูเงินทุน สินทรัพย์ รายได้ ความเสี่ยง กำไร หรือเงินกองทุน</p>}
 {metric&&<div className="explanation"><b>{current?.children.find(c=>c[0]===metric)?.[1]}</b><p>{definitions[metric]||'ดูขอบเขตการรายงาน งวด และนิยามจากเอกสารต้นฉบับประกอบตัวเลขนี้'}</p><small>แหล่งอ้างอิงของ snapshot: {String(data.bank.sources||'ไม่ระบุ')}</small></div>}
 {section==='assets'&&<Rows title="โครงสร้างสินเชื่อ" rows={data.loanMix}/>}
 {section==='funding'&&<Rows title="โครงสร้างเงินฝาก" rows={data.fundingMix}/>}
 {section==='risk'&&<Rows title="คุณภาพสินทรัพย์" rows={data.assetQuality}/>}
 {section==='capital'&&<Rows title="ขอบเขตเงินกองทุน" rows={data.capitalEntity}/>}
 {data.bank.notes&&<details><summary>หมายเหตุและข้อจำกัดข้อมูล</summary><p>{data.bank.notes}</p></details>}
 </>}
 {view==='evidence'&&<><form onSubmit={e=>{e.preventDefault();setSearch(query)}}><label htmlFor="research-query">ค้นหลักฐานใน {ticker}</label><div className="search-row"><input id="research-query" maxLength={500} value={query} onChange={e=>setQuery(e.target.value)} placeholder="เช่น NIM, SME, credit cost"/><button type="submit">ค้นหา</button></div></form>
 <p className="muted">{data.meta.corpus_file_count} เอกสารใน corpus · {data.meta.chunk_count} ข้อความในดัชนีทั้งหมด</p>
 {!data.meta.corpus_file_count&&<p>ชุดนี้ยังไม่มีเอกสารรีเสิร์ชใน corpus ผลค้นหาจึงมาจากข้อมูลที่จัดโครงสร้างไว้</p>}
 {data.documents.length===0?<p>ไม่พบหลักฐานที่ตรงคำค้นในธนาคารและงวดที่เลือก</p>:data.documents.map(d=><details key={d.id}><summary>{String(d.metadata.filename||d.metadata.doc_type)} · {String(d.metadata.period||'ไม่ระบุงวด')}</summary><p className="evidence-text">{d.text}</p><small>{String(d.metadata.unit||'')} · {d.id}<br/>{String(d.metadata.entityScope||'ขอบเขตไม่ระบุ')} · เผยแพร่ {String(d.metadata.publishedAt||'ไม่ระบุ')}</small>{safeUrl(d.metadata.sourceUrl)&&<p><a href={safeUrl(d.metadata.sourceUrl)!} target="_blank" rel="noreferrer">เปิดต้นฉบับ ↗</a></p>}</details>)}
 </>}
 {view==='sources'&&<><h3>เอกสารอ้างอิง</h3>{data.sources.map(s=><div className="source" key={String(s.id)}>{safeUrl(s.url)?<a href={safeUrl(s.url)!} target="_blank" rel="noreferrer">{s.title} ↗</a>:<span>{s.title}</span>}<small>{s.id} · งวด {s.period||'ไม่ระบุ'} · เผยแพร่ {s.published||'ไม่ระบุ'}</small></div>)}
 </>}
 </>}
 </div>
}
function Rows({title,rows}:{title:string;rows:Row[]}){return <details><summary>{title} ({rows.length})</summary><p className="muted">แสดง taxonomy และงวดตามต้นฉบับ ห้ามรวมรายการแม่กับรายการย่อยซ้ำ</p>{rows.length?rows.map((row,i)=><dl key={i}>{Object.entries(row).filter(([k])=>k!=='ticker').map(([k,v])=><div key={k}><dt>{k}</dt><dd>{format(v)}</dd></div>)}</dl>):<p>DATA NOT AVAILABLE</p>}</details>}
