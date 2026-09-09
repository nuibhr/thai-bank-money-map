'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import type {Bank} from '@/components/BankWorld';
import bankLayout from '@/data/banks.json';
const BANKS=bankLayout as Bank[];
import ResearchPanel from '@/components/ResearchPanel';
import {sections,type SectionId} from '@/lib/bank-sections';
const BankWorld=dynamic(()=>import('@/components/BankWorld'),{ssr:false});
export default function Home(){
 const [selected,setSelected]=useState<Bank|null>(null),[interior,setInterior]=useState(false),[section,setSection]=useState<SectionId|null>(null),[metric,setMetric]=useState<string|null>(null),[journey,setJourney]=useState(false);
 const choose=(bank:Bank)=>{setSelected(bank);setInterior(false);setSection(null);setMetric(null);setJourney(false)};
 const openSection=(s:SectionId)=>{setSection(s);setMetric(null);setJourney(false)};
 const overview=()=>{setSelected(null);setInterior(false);setSection(null);setMetric(null);setJourney(false)};
 useEffect(()=>{if(!journey)return;let step=0;setSection(sections[0].id);const timer=setInterval(()=>{step++;if(step>=sections.length){setJourney(false);clearInterval(timer)}else {setSection(sections[step].id);setMetric(null)}},5500);return()=>clearInterval(timer)},[journey]);
 return <main className="bank-app">
 <BankWorld selected={selected} onSelect={choose} interior={interior} section={section} metric={metric} onSection={openSection} onMetric={setMetric}/>
 <header className="brand-header"><button onClick={overview}><span>หนุ่มนักออม</span><strong>THAI BANK MONEY MAP</strong></button><small>เข้าใจหุ้นแบงก์ ผ่านเส้นทางของเงิน</small></header>
 <div className="world-navigation"><button onClick={overview}>โลกธนาคาร</button>{selected&&<><span>›</span><button onClick={()=>{setInterior(true);setSection(null);setJourney(false)}}>{selected.ticker}</button></>}{section&&<><span>›</span><span>{sections.find(s=>s.id===section)?.label}</span></>}</div>
 {!selected&&<div className="world-intro"><h1>เข้าไปดูว่า<br/>เงินทำงานอย่างไร</h1><p>คลิกตึกเพื่อสำรวจโครงสร้างภายใน<br/>ลากหมุน · คลิกขวาเลื่อน · Scroll ซูม</p></div>}
 {selected&&<aside className="research-panel"><div className="panel-heading"><div><small>{interior?'INSIDE THE BANK':'BANK FOCUS'}</small><h2>{selected.ticker}</h2></div><button onClick={overview} aria-label="ปิดรายละเอียด">✕</button></div>
 {!interior?<button className="enter-bank" onClick={()=>{setInterior(true);setSection('funding')}}>เข้าไปในตึก →</button>:<nav className="floor-tabs" aria-label="ชั้นธุรกิจ">{sections.map(s=><button className={section===s.id?'active':''} key={s.id} onClick={()=>openSection(s.id)}>{s.label}</button>)}</nav>}
 <ResearchPanel key={selected.ticker} ticker={selected.ticker} section={section} metric={metric} onMetric={setMetric}/>
 </aside>}
 <footer className="world-footer"><nav aria-label="เลือกธนาคาร">{BANKS.map(b=><button key={b.ticker} className={selected?.ticker===b.ticker?'active':''} onClick={()=>choose(b)}>{b.ticker}</button>)}</nav><button className="follow-money" onClick={()=>{if(journey){setJourney(false);return}setSelected(selected||BANKS[0]);setInterior(true);setMetric(null);setJourney(true)}}>{journey?'หยุดเรื่องราว':'ตามเงิน ฿100 →'}</button><small>อาคารและเส้นเงินเป็นภาพจำลองเพื่อการศึกษา ไม่สื่อสัดส่วนเงินจริง</small></footer>
 {journey&&<div className="story-caption"><b>EDUCATIONAL SIMPLIFIED MODEL</b><p>เงินฝากเป็นเงินทุน → จัดสรรเป็นสินทรัพย์ → เกิดรายได้ → หักต้นทุนและสำรอง → เหลือกำไร → สะสมทุนหรือจ่ายคืนผู้ถือหุ้น</p></div>}
 <details className="disclaimer"><summary>ข้อมูลและข้อจำกัด</summary><p>ข้อมูลนี้จัดทำขึ้นเพื่อการศึกษาและการวิเคราะห์เท่านั้น ไม่ใช่คำแนะนำในการซื้อหรือขายหลักทรัพย์ ข้อมูลจาก AI หรือแบบจำลองอาจไม่ครบถ้วนหรือคลาดเคลื่อน นักลงทุนควรตรวจสอบข้อมูลจากแหล่งอ้างอิงและพิจารณาความเสี่ยงก่อนตัดสินใจลงทุน</p><p>ผลลัพธ์จากแบบจำลอง ไม่ใช่ประมาณการหรือ Guidance ของบริษัท</p></details>
 </main>
}
