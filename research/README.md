# อัปเดตฐานวิจัย

RAG ที่นำเข้าครั้งแรกมี 91 chunks จาก structured seed และ 0 เอกสารใน corpus
สถานะข้อมูล: ผู้ใช้จัดส่งพร้อมแหล่งอ้างอิง ไม่ได้ตรวจต้นฉบับซ้ำโดยระบบนี้

## เพิ่มรีเสิร์ช / งบใหม่
1. ติดตั้ง Python dependencies: `python -m pip install -r research/requirements.txt`
2. วางเอกสารที่มีสิทธิเผยแพร่ใน `research/data/corpus/{TICKER}/` เช่น `KBANK_2026Q3_MDA.pdf` (เอกสารดิบจะไม่เข้า Git)
3. เพิ่ม sidecar ชื่อ `KBANK_2026Q3_MDA.pdf.meta.json` มี `ticker`, `period` (YYYY-MM-DD), `sourceUrl`, `publishedAt`, `entityScope` เพื่อระบุงวดและขอบเขตชัดเจน
4. อัปเดต structured seed ใน `research/seed/` โดยคง null และ source IDs; ตั้ง `SEED_JSON` ไปไฟล์ใหม่ถ้าชื่อเปลี่ยน
5. จากโฟลเดอร์ research รัน `python -m rag.build_index`
6. กลับ root repo รัน `node scripts/import-rag.mjs research/data/generated`
7. ตรวจ diff, ตัวเลข, งวด, entity และสิทธิการเผยแพร่ข้อความที่สกัดออกมา แล้ว commit/deploy บน Vercel

ข้อมูลบนเว็บเปลี่ยนหลัง deploy สำเร็จ ไม่ได้อ่านจาก PC แบบสด ไม่มี endpoint อัปโหลดสาธารณะ
การเพิ่มเอกสารไม่เขียนทับตัวเลข structured facts อัตโนมัติ ต้องตรวจและอัปเดต seed แยก
ค้นหลักฐานแยก ticker อย่างเคร่งครัด; เอกสารที่ไม่ระบุงวดต้องแก้ metadata ก่อน import
ดัชนีเป็นการค้นข้อความแบบ character trigrams ไม่มีการเรียก LLM หรือสร้างบทสรุปที่ไม่มีหลักฐาน
หากย้ายไปฐานข้อมูลภายหลัง คง response ของ `/api/bank-rag/search` และแยก structured facts จากเอกสารเช่นเดิม
