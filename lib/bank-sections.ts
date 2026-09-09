export const sections = [
 {id:'funding',label:'เงินทุน',en:'FUNDING',color:'#56b9ed',children:[['deposits','เงินฝาก','ล้านบาท'],['casa','CASA','%'],['cost_deposit','ต้นทุนเงินฝาก','%'],['cost_fund','ต้นทุนเงินทุน','%'],['deposit_growth_ytd','เงินฝากเติบโต YTD','%']]},
 {id:'assets',label:'สินทรัพย์และสินเชื่อ',en:'LOAN ENGINE',color:'#68d9ad',children:[['assets','สินทรัพย์','ล้านบาท'],['loans','สินเชื่อ','ล้านบาท'],['loan_growth_ytd','สินเชื่อเติบโต YTD','%'],['ldr','Loan / Deposit','%']]},
 {id:'income',label:'รายได้และ NIM',en:'INTEREST ENGINE',color:'#efc57e',children:[['q2_nii','รายได้ดอกเบี้ยสุทธิ ไตรมาส','ล้านบาท'],['q2_noninterest','รายได้อื่น ไตรมาส','ล้านบาท'],['nim_q2','NIM ไตรมาส','%'],['q2_netfees','ค่าธรรมเนียมสุทธิ ไตรมาส','ล้านบาท']]},
 {id:'risk',label:'ความเสี่ยงและสำรอง',en:'RISK / PROVISION',color:'#ed8990',children:[['npl_pct','NPL','%'],['stage2_pct','Stage 2 / SICR','%'],['credit_cost_q2','Credit cost ไตรมาส','bps'],['coverage','Coverage','%'],['q2_ecl','ECL ไตรมาส','ล้านบาท']]},
 {id:'profit',label:'กำไรและประสิทธิภาพ',en:'PROFIT ENGINE',color:'#9cdcc4',children:[['q2_profit','กำไร ไตรมาส','ล้านบาท'],['h1_profit','กำไร H1','ล้านบาท'],['q2_opex','ค่าใช้จ่าย ไตรมาส','ล้านบาท'],['cost_income','Cost / Income','%'],['roe_q2','ROE ไตรมาส','%']]},
 {id:'capital',label:'ทุนและผู้ถือหุ้น',en:'CAPITAL',color:'#b4a1ef',children:[['equity_attrib','ส่วนผู้ถือหุ้น','ล้านบาท'],['car','CAR','%'],['tier1','Tier 1','%'],['cet1','CET1','%']]},
] as const;
export type SectionId = typeof sections[number]['id'];
export const sectionById = (id:string) => sections.find(s=>s.id===id);
export const definitions:Record<string,string>={nim_q2:'NIM คือรายได้ดอกเบี้ยสุทธิต่อสินทรัพย์ที่ก่อให้เกิดดอกเบี้ยเฉลี่ย วิธี annualize ให้ยึดตามรายงาน ไม่ใช่อัตรากู้ลบอัตราฝากโดยตรง',npl_pct:'หนี้ที่มีปัญหาตามนิยามของรายงาน NPL เพิ่มไม่ได้หมายความว่าจะเกิดขาดทุนจำนวนเดียวกันทันที',credit_cost_q2:'ต้นทุนสำรองเทียบสินเชื่อเฉลี่ย ตรวจวิธี annualize ในต้นฉบับ หน่วย bps: 100 bps = 1%',roe_q2:'กำไรเทียบทุนผู้ถือหุ้นเฉลี่ย ตามขอบเขตและวิธี annualize ของบริษัท ROE สูงต้องพิจารณาความเสี่ยงและเงินกองทุนร่วมด้วย',stage2_pct:'สินเชื่อที่ความเสี่ยงเพิ่มขึ้นอย่างมีนัยสำคัญ นิยาม SICR/Stage 2 อาจต่างกันตามรายงาน ไม่ใช่ NPL ทั้งหมด',car:'เงินกองทุนต่อสินทรัพย์เสี่ยง ต้องดูขอบเขตกลุ่มการเงินหรือธนาคารก่อนเปรียบเทียบ'};
export const connections:Record<SectionId,{upstream:SectionId[];downstream:SectionId[];why:string}>={
 funding:{upstream:[],downstream:['assets','income'],why:'เงินฝากและเงินทุนอื่นรองรับสินทรัพย์ ต้นทุนเงินทุนเป็นหนึ่งในปัจจัยของรายได้ดอกเบี้ยสุทธิ'},
 assets:{upstream:['funding'],downstream:['income','risk'],why:'สินทรัพย์สร้างรายได้และรับความเสี่ยงควบคู่กัน โครงสร้างสินเชื่อช่วยอธิบายแหล่งรายได้และช่องทางความเสี่ยง'},
 income:{upstream:['funding','assets'],downstream:['profit'],why:'รายได้ดอกเบี้ยสุทธิและรายได้อื่นต้องหักค่าใช้จ่าย สำรอง และภาษี ก่อนเป็นกำไรสุทธิ'},
 risk:{upstream:['assets'],downstream:['profit','capital'],why:'คุณภาพสินเชื่อที่อ่อนลงอาจเพิ่มสำรองและกดดันกำไร การเปลี่ยน NPL ไม่เท่ากับค่าใช้จ่าย ECL โดยตรง'},
 profit:{upstream:['income','risk'],downstream:['capital'],why:'กำไรหลังต้นทุนและสำรองอาจสะสมเป็นทุนหรือจัดสรรให้ผู้ถือหุ้น ขึ้นกับเงินกองทุนและการอนุมัติ'},
 capital:{upstream:['profit'],downstream:['assets'],why:'ทุนรองรับความเสียหายและความสามารถขยายธุรกิจ จึงเชื่อมกลับไปยังการจัดสรรสินทรัพย์'},
};

/** Quarter-specific keys resolve only to the selected quarter; never borrow an old quarter's value. */
export function metricForPeriod(bank:Record<string,unknown>,key:string,period:string):unknown{
 const month=Number(period.slice(5,7));if(!Number.isInteger(month)||month<1||month>12)return null;
 const q=Math.ceil(month/3);const sourceKey=key.replace(/^q2_/,`q${q}_`).replace(/_q2$/,`_q${q}`);
 return bank[sourceKey]??null;
}
