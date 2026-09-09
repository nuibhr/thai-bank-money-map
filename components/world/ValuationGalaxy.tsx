'use client';
import {Html,Line} from '@react-three/drei';
import {banks,display,type WorldData,type Snapshot,type V3} from '@/lib/world/model';
export function valuationPosition(b:Snapshot):V3{return [(b.pbv??0)*10-15,(b.roe??0)*1.1+1,b.growth===null?0:b.growth*.5]}
export default function ValuationGalaxy({data,selected,onSelect}:{data:WorldData|null;selected:string|null;onSelect:(ticker:string,point:V3)=>void}){
 const available=data?.banks.filter(b=>b.pbv!==null&&b.roe!==null)??[];const max=Math.max(1,...available.map(b=>b.marketCap??0));
 return <group name="valuation-galaxy"><Line points={[[-17,0,0],[18,0,0]]} color="#8298ac"/><Line points={[[-17,0,0],[-17,24,0]]} color="#8298ac"/>
 {[0,5,10,15,20].map(n=><group key={n}><Line points={[[-17,n*1.1+1,0],[18,n*1.1+1,0]]} color="#253649"/><Html center position={[-20,n*1.1+1,0]}><span className="axis-label">{n}%</span></Html></group>)}
 {[0,.5,1,1.5,2,2.5,3].map(n=><Html key={n} center position={[n*10-15,-1.4,0]}><span className="axis-label">{n}×</span></Html>)}
 <Html center position={[0,-4,0]}><div className="axis-title">P/BV · ตลาดเทียบมูลค่าทางบัญชี</div></Html><Html center position={[-17,27,0]}><div className="axis-title">ROE · ผลตอบแทนต่อทุน</div></Html>
 {available.map(b=>{const bank=banks.find(x=>x.ticker===b.ticker);const pos=valuationPosition(b);return <group key={b.ticker} position={pos}><mesh onClick={e=>{e.stopPropagation();onSelect(b.ticker,pos)}}><sphereGeometry args={[b.marketCap===null?.6:.35+Math.cbrt(b.marketCap/max)*1.1,24,16]}/><meshStandardMaterial color={bank?.accent??'#8fbeb0'} emissive={bank?.accent??'#8fbeb0'} emissiveIntensity={selected===b.ticker?.6:.15} metalness={.55} roughness={.2}/></mesh><Html center position={[0,2.1,0]} zIndexRange={[7,0]}><button className="tower-label" onClick={()=>onSelect(b.ticker,pos)}>{b.ticker}<small>{display(b.pbv,'×')} · {display(b.roe,'%')}</small></button></Html></group>})}
 <Html center position={[0,25,0]}><div className="galaxy-method">IMPORTED DATA · Bubble size = Market cap<br/>Z: Earnings growth {available.every(b=>b.growth===null)?'N/A — ไม่เข้ารหัสแกน Z':'%'}<br/>งบและราคาตลาดคนละวัน: คลิกธนาคารเพื่อดูงวดและหมายเหตุ</div></Html>
 {!available.length&&<Html center position={[0,8,0]}><div className="galaxy-method">ยังไม่มีข้อมูล P/BV และ ROE ที่ใช้วางตำแหน่ง</div></Html>}
 </group>
}
