'use client';

import { useState } from 'react';
import BankWorld, { type Bank } from '@/components/BankWorld';

export default function Home() {
  const [selected, setSelected] = useState<Bank | null>(null);

  return (
    <main style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#02050a'}}>
      <div style={{position:'absolute',inset:0}}>
        <BankWorld selected={selected} onSelect={setSelected} />
      </div>

      <div style={{position:'absolute',left:28,top:24,zIndex:10,pointerEvents:'none'}}>
        <div style={{fontSize:12,letterSpacing:'.32em',color:'#7dd3fc'}}>หนุ่มนักออม</div>
        <h1 style={{margin:'8px 0 4px',fontSize:34}}>THAI BANK MONEY MAP</h1>
        <div style={{color:'#94a3b8'}}>เข้าใจหุ้นแบงก์ ผ่านเส้นทางของเงิน</div>
        <div style={{marginTop:10,color:'#cbd5e1',fontSize:14}}>ตามเงิน → ตามความเสี่ยง → ตามกำไร → แล้วค่อยดูราคา</div>
      </div>

      <button
        onClick={() => alert('FOLLOW ฿100 cinematic flow — next build')}
        style={{position:'absolute',left:28,bottom:28,zIndex:10,border:'1px solid rgba(255,255,255,.18)',background:'rgba(5,12,20,.78)',color:'white',padding:'12px 18px',borderRadius:999,cursor:'pointer',backdropFilter:'blur(12px)'}}
      >
        FOLLOW ฿100
      </button>

      {selected && (
        <aside style={{position:'absolute',right:20,top:20,bottom:20,width:360,zIndex:20,border:'1px solid rgba(255,255,255,.12)',background:'rgba(2,5,10,.82)',backdropFilter:'blur(18px)',borderRadius:18,padding:20,overflow:'auto'}}>
          <button onClick={() => setSelected(null)} style={{float:'right',border:0,background:'rgba(255,255,255,.08)',color:'white',borderRadius:8,padding:'6px 10px',cursor:'pointer'}}>✕</button>
          <div style={{fontSize:12,letterSpacing:'.18em',color:'#34d399'}}>BANK FOCUS</div>
          <h2 style={{fontSize:42,margin:'6px 0'}}>{selected.ticker}</h2>
          <div style={{color:'#94a3b8',fontSize:13}}>Q2 / 2026</div>
          <hr style={{border:0,borderTop:'1px solid rgba(255,255,255,.1)',margin:'18px 0'}} />
          <div style={{fontSize:13,color:'#cbd5e1',lineHeight:1.7}}>
            <b>3D interaction connected.</b><br/>
            Investor metrics and RAG source panel will be wired in the next build. Unknown values will never be fabricated.
          </div>
        </aside>
      )}

      <div style={{position:'absolute',right:20,bottom:16,zIndex:10,fontSize:11,color:'#64748b',maxWidth:520,textAlign:'right'}}>
        ข้อมูลเพื่อการศึกษาและวิเคราะห์ ไม่ใช่คำแนะนำซื้อขายหลักทรัพย์ และผลลัพธ์จากแบบจำลองไม่ใช่ Guidance ของบริษัท
      </div>
    </main>
  );
}
