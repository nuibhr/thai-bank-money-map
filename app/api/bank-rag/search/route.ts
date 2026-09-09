import {searchBankRag,tickers} from '@/lib/bank-rag';
export async function GET(request:Request){
 const p=new URL(request.url).searchParams;const ticker=(p.get('ticker')||'').toUpperCase();const q=p.get('q')||'';
 if(!tickers.includes(ticker)||q.length>500)return Response.json({error:'ระบุ ticker ที่รองรับ และคำค้นไม่เกิน 500 ตัวอักษร'},{status:400});
 try{return Response.json(searchBankRag(ticker,q,p.get('period')||''),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'ไม่พบงวดข้อมูลนี้'},{status:400})}
}
