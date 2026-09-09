import layout from '@/data/world.json';
export type V3=[number,number,number];
export type Bank={ticker:string;position:V3;height:number;shape:string;accent:string};
export type Place={id:string;label:string;en:string;position:V3;kind?:string};
export const banks=layout.banks as Bank[];
export const origins=layout.origins as Place[];
export const sectors=layout.sectors as Place[];
export const engines=layout.engines as Place[];
export type Mode='overview'|'funding'|'district'|'flow'|'concentration'|'sectors'|'risk'|'profit'|'compare'|'valuation';
export const modes:{id:Mode;label:string;en:string}[]=[{id:'overview',label:'ภาพรวม',en:'WORLD OVERVIEW'},{id:'funding',label:'ต้นทางเงิน',en:'FUNDING ORIGINS'},{id:'district',label:'ย่านธนาคาร',en:'BANK DISTRICT'},{id:'flow',label:'เส้นเงินทั้งระบบ',en:'SYSTEM FLOW'},{id:'concentration',label:'เงินกระจุกที่ไหน',en:'CONCENTRATION'},{id:'sectors',label:'ปลายทางสินเชื่อ',en:'EXPOSURE'},{id:'risk',label:'ความเสี่ยง',en:'RISK / NPL'},{id:'profit',label:'กำไร / ผู้ถือหุ้น',en:'PROFIT FLOW'},{id:'compare',label:'เปรียบเทียบ',en:'COMPARE'},{id:'valuation',label:'Valuation',en:'VALUATION GALAXY'}];
export type Exposure={category:string;destination:string|null;amount:number|null;share:number|null;period:string;taxonomy:string;source:string;note:string;company:boolean};
export type Snapshot={ticker:string;period:string;scope:string;roe:number|null;nim:number|null;npl:number|null;assets:number|null;loans:number|null;deposits:number|null;profit:number|null;creditCost:number|null;car:number|null;pbv:number|null;pe:number|null;marketCap:number|null;growth:number|null;marketDate:string;marketNote:string;sources:string;exposures:Exposure[]};
export type WorldData={banks:Snapshot[];sources:Record<string,unknown>[];updated:string;status:string};
export const numberOrNull=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:null;
export const display=(v:number|null|undefined,unit='')=>v==null?'N/A':v.toLocaleString('th-TH',{maximumFractionDigits:2})+unit;
export function exposureWeight(e:Exposure,all:Exposure[]){const amount=all.every(x=>x.amount!==null);const v=amount?e.amount:e.share;const max=Math.max(...all.map(x=>(amount?x.amount:x.share)??0),0);return v==null||max<=0?null:Math.sqrt(Math.max(0,v)/max)}
export function rankedExposure(items:Exposure[]){if(!items.length)return [];const amount=items.every(x=>x.amount!==null);return [...items].filter(x=>(amount?x.amount:x.share)!==null).sort((a,b)=>((amount?b.amount:b.share)??0)-((amount?a.amount:a.share)??0))}
export const tour=[
 ['เงินเริ่มต้นจากคุณ','เงินฝาก ฿100 เป็นหนี้สินของธนาคาร ไม่ใช่รายได้ของธนาคาร','HOUSEHOLD'],
 ['เข้าสู่ฐานเงินทุน','เงินฝากรวมกับเงินทุนแหล่งอื่น ก่อนบริหารสภาพคล่องและต้นทุน','FUNDING'],
 ['ผ่านแกนงบดุล','สินทรัพย์ = หนี้สิน + ส่วนของผู้ถือหุ้น','BALANCE SHEET'],
 ['จัดสรรเป็นสินทรัพย์','ธนาคารกระจายเงินทุนสู่สภาพคล่อง การลงทุน และสินเชื่อ ไม่ได้ปล่อยกู้ทั้งหมด','LOAN ALLOCATION'],
 ['เข้าสู่เศรษฐกิจ','ผู้กู้นำเงินไปใช้ในกิจกรรมเศรษฐกิจ พร้อมภาระชำระเงินคืน','REAL ECONOMY'],
 ['ดอกเบี้ยกลับมา','จากจุดนี้ติดตามรายได้เชิงแนวคิด ไม่ใช่เงินต้นฝาก ฿100 ก้อนเดิม','INTEREST / FEES'],
 ['หักต้นทุนการดำเนินงาน','รายได้ต้องรองรับค่าใช้จ่าย ต้นทุนเงินทุน ภาษี และรายการอื่น','COSTS'],
 ['ผ่านด่านความเสี่ยง','ผู้กู้บางรายอาจผิดนัด แต่ NPL ที่เพิ่มไม่เท่ากับค่าใช้จ่ายสำรองทันที','NPL'],
 ['กันสำรองเผื่อความเสียหาย','ECL เป็นการรับรู้ผลขาดทุนด้านเครดิตที่คาดว่าจะเกิด ไม่ใช่การเผาเงินสด','PROVISION'],
 ['เหลือเป็นกำไร','กำไรสุทธิเป็นผลหลังหักต้นทุนและรายการที่เกี่ยวข้อง','NET PROFIT'],
 ['เสริมฐานทุน','กำไรบางส่วนอาจเก็บสะสมเพื่อรองรับธุรกิจและความเสียหาย','CAPITAL'],
 ['กลับไปยังผู้ถือหุ้น','การจ่ายปันผลขึ้นกับกำไร เงินกองทุน และการอนุมัติ ไม่ใช่ผลตอบแทนของผู้ฝาก','DIVIDEND'],
] as const;
export function journeyPoints(bank:Bank):V3[]{const [x,,z]=bank.position;return [[-40,1.5,-16],[-25,2,-12],[x,4,z],[x+4,3,z+3],[29,2,1],[x,8,z],[-10,3,25],[-32,3,33],[-18,2,34],[-3,4,34],[10,3,35],[23,3,42]]}
