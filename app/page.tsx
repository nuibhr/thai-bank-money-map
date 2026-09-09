'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import type {Bank} from '@/components/BankWorld';
import bankLayout from '@/data/banks.json';
const BANKS=bankLayout as Bank[];
import WorldBoundary from '@/components/WorldBoundary';
import ResearchPanel from '@/components/ResearchPanel';
import {sections,connections,type SectionId} from '@/lib/bank-sections';
const BankWorld=dynamic(()=>import('@/components/BankWorld'),{ssr:false});
export default function Home(){
 const [selected,setSelected]=useState<Bank|null>(null),[interior,setInterior]=useState(false),[section,setSection]=useState<SectionId|null>(null),[metric,setMetric]=useState<string|null>(null),[journey,setJourney]=useState(false),[expanded,setExpanded]=useState(true);
 const [researchView,setResearchView]=useState<'overview'|'evidence'|'sources'>('overview');
 const choose=(bank:Bank)=>{setSelected(bank);setInterior(false);setSection(null);setMetric(null);setJourney(false)};
 const openSection=(s:SectionId)=>{if(!selected)setSelected(BANKS[0]);setInterior(true);setResearchView('overview');setSection(s);setMetric(null);setJourney(false)};
 const overview=()=>{setSelected(null);setInterior(false);setSection(null);setMetric(null);setJourney(false)};
 useEffect(()=>{if(!journey)return;let step=0;setSection(sections[0].id);const timer=setInterval(()=>{step++;if(step>=sections.length){setJourney(false);clearInterval(timer)}else {setSection(sections[step].id);setMetric(null)}},5500);return()=>clearInterval(timer)},[journey]);
 return <main className="bank-app">
 <WorldBoundary><BankWorld expanded={expanded} selected={selected} onSelect={choose} interior={interior} section={section} metric={metric} onSection={openSection} onMetric={setMetric}/></WorldBoundary>
 <header className="brand-header"><button onClick={overview}><span>หนุ่มนักออม</span><strong>THAI BANK MONEY MAP</strong></button><small>เข้าใจหุ้นแบงก์ ผ่านเส้นทางของเงิน</small></header>
 <nav className="exploration-modes" aria-label="มุมมองการสำรวจ"><button onClick={overview} aria-pressed={!interior}>ภาพรวม</button><button onClick={()=>openSection('funding')} aria-pressed={interior&&section==='funding'}>เส้นทางเงิน</button><button onClick={()=>openSection('risk')} aria-pressed={section==='risk'}>ตามความเสี่ยง</button><button onClick={()=>{if(!selected)setSelected(BANKS[0]);setResearchView('evidence')}} aria-pressed={researchView==='evidence'&&!!selected}>ค้นรีเสิร์ช</button></nav>
 <div className="world-navigation"><button onClick={overview}>โลกธนาคาร</button>{selected&&<><span>›</span><button onClick={()=>{setInterior(true);setSection(null);setJourney(false)}}>{selected.ticker}</button></>}{section&&<><span>›</span><span>{sections.find(s=>s.id===section)?.label}</span></>}</div>
 <aside className="stack-navigation"><small>{selected?'EXPLORE THE BANK':'EXPLORE THE SYSTEM'}</small><h1>{selected?selected.ticker:'ตามเงิน\nเข้าใจแบงก์'}</h1><p>{selected?'เลือกชั้นเพื่อดูโครงสร้างและหลักฐาน':'ธนาคารเปลี่ยนเงินทุนและความเสี่ยงเป็นผลตอบแทนอย่างไร'}</p><div className="stack-title">{selected?'โครงสร้างธุรกิจ · 6 ชั้น':'เลือกธนาคาร · 7 แห่ง'}</div>
 {selected?sections.map((s,i)=><button key={s.id} className={section===s.id?'active':''} onClick={()=>openSection(s.id)}><span>{String(i+1).padStart(2,'0')}</span>{s.label}<b>›</b></button>):BANKS.map((b,i)=><button key={b.ticker} onClick={()=>choose(b)}><span>{String(i+1).padStart(2,'0')}</span>{b.ticker}<b>›</b></button>)}
 {selected&&<button className="stack-back" onClick={overview}>← กลับไปเลือกธนาคาร</button>}</aside>
 {selected&&<aside className="research-panel"><div className="panel-heading"><div><small>{interior?'INSIDE THE BANK':'BANK FOCUS'}</small><h2>{selected.ticker}</h2></div><button onClick={overview} aria-label="ปิดรายละเอียด">✕</button></div>
 {!interior?<button className="enter-bank" onClick={()=>{setInterior(true);setSection('funding')}}>เข้าไปในตึก →</button>:<nav className="floor-tabs" aria-label="ชั้นธุรกิจ">{sections.map(s=><button className={section===s.id?'active':''} key={s.id} onClick={()=>openSection(s.id)}>{s.label}</button>)}</nav>}
 {interior&&<button className="explode-button" aria-pressed={expanded} onClick={()=>setExpanded(e=>!e)}>{expanded?'รวมโครงสร้างตึก':'แยกชั้นตึกเพื่อสำรวจ'} <span>{expanded?'↘':'↗'}</span></button>}
 {section&&<div className="layer-context"><small>THE INVESTMENT CONNECTION</small><p>{connections[section].why}</p>{(['upstream','downstream'] as const).map(direction=><div key={direction}><span>{direction==='upstream'?'เชื่อมจากต้นทาง':'ส่งผลต่อปลายทาง'}</span>{connections[section][direction].length?connections[section][direction].map(id=><button key={id} onClick={()=>openSection(id)}>{sections.find(s=>s.id===id)?.label} ↗</button>):<p className="muted">ผู้ฝากเงินและแหล่งเงินทุนภายนอก</p>}</div>)}<small>ความเชื่อมโยงเชิงอธิบาย ไม่ใช่การคาดการณ์ผลประกอบการ</small></div>}
 <nav className="research-switch" aria-label="ข้อมูลประกอบ"><button aria-pressed={researchView==='overview'} onClick={()=>setResearchView('overview')}>ข้อมูล</button><button aria-pressed={researchView==='evidence'} onClick={()=>setResearchView('evidence')}>หลักฐาน</button><button aria-pressed={researchView==='sources'} onClick={()=>setResearchView('sources')}>แหล่งอ้างอิง</button></nav>
 <ResearchPanel view={researchView} key={selected.ticker} ticker={selected.ticker} section={section} metric={metric} onMetric={setMetric}/>
 </aside>}
 <footer className="world-footer"><nav aria-label="เลือกธนาคาร">{BANKS.map(b=><button key={b.ticker} className={selected?.ticker===b.ticker?'active':''} onClick={()=>choose(b)}>{b.ticker}</button>)}</nav><button className="follow-money" onClick={()=>{if(journey){setJourney(false);return}setSelected(selected||BANKS[0]);setInterior(true);setMetric(null);setJourney(true)}}>{journey?'หยุดเรื่องราว':'ตามเงิน ฿100 →'}</button><small>อาคารและเส้นเงินเป็นภาพจำลองเพื่อการศึกษา ไม่สื่อสัดส่วนเงินจริง</small></footer>
 {journey&&<div className="story-caption"><b>EDUCATIONAL SIMPLIFIED MODEL</b><p>เงินฝากเป็นเงินทุน → จัดสรรเป็นสินทรัพย์ → เกิดรายได้ → หักต้นทุนและสำรอง → เหลือกำไร → สะสมทุนหรือจ่ายคืนผู้ถือหุ้น</p></div>}
 <details className="disclaimer"><summary>ข้อมูลและข้อจำกัด</summary><p>ข้อมูลนี้จัดทำขึ้นเพื่อการศึกษาและการวิเคราะห์เท่านั้น ไม่ใช่คำแนะนำในการซื้อหรือขายหลักทรัพย์ ข้อมูลจาก AI หรือแบบจำลองอาจไม่ครบถ้วนหรือคลาดเคลื่อน นักลงทุนควรตรวจสอบข้อมูลจากแหล่งอ้างอิงและพิจารณาความเสี่ยงก่อนตัดสินใจลงทุน</p><p>ผลลัพธ์จากแบบจำลอง ไม่ใช่ประมาณการหรือ Guidance ของบริษัท</p></details>
 </main>
}
