# คู่มือตั้งค่า Google OAuth สำหรับ Vercel

## ปัญหา: ข้อผิดพลาด redirect_uri_mismatch

ข้อผิดพลาดนี้เกิดขึ้นเมื่อ redirect URI ที่แอปพลิเคชันใช้ไม่ตรงกับที่ตั้งค่าไว้ใน Google Cloud Console

## วิธีแก้ไข

### ขั้นตอนที่ 1: หา URL ของ Vercel

1. ไปที่ Vercel project dashboard ของคุณ
2. คัดลอก production deployment URL (เช่น `https://your-app.vercel.app`)
3. ถ้ามี preview deployments ให้จด URL เหล่านั้นด้วย (เช่น `https://your-app-git-branch.vercel.app`)

### ขั้นตอนที่ 2: ตั้งค่า Google Cloud Console

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจกต์ของคุณ (หรือสร้างใหม่ถ้ายังไม่มี)
3. ไปที่ **APIs & Services** > **Credentials**
4. คลิกที่ OAuth 2.0 Client ID ของคุณ (หรือสร้างใหม่ถ้ายังไม่มี)
5. ในส่วน **Authorized JavaScript origins** ให้เพิ่ม:
   - `http://localhost:5173` (สำหรับรันในเครื่องด้วย Vite)
   - `http://localhost:3000` (ถ้าใช้พอร์ตอื่น)
   - `https://your-app.vercel.app` (URL ของ Vercel production ของคุณ)
   - `https://*.vercel.app` (สำหรับ preview deployments ทั้งหมด - รองรับ wildcard)

6. ในส่วน **Authorized redirect URIs** ให้เพิ่ม:
   - `http://localhost:5173` (สำหรับรันในเครื่อง)
   - `http://localhost:3000` (ถ้าใช้พอร์ตอื่น)
   - `https://your-app.vercel.app` (URL ของ Vercel production ของคุณ)
   - `https://*.vercel.app` (สำหรับ preview deployments ทั้งหมด)

   **หมายเหตุ:** สำหรับ `@react-oauth/google` กับ `useGoogleLogin` redirect URI จะถูกตั้งอัตโนมัติเป็น `window.location.origin` ดังนั้นคุณต้องเพิ่ม URL แบบเต็ม

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables ใน Vercel

1. ไปที่ Vercel project settings
2. ไปที่ **Environment Variables**
3. เพิ่ม `VITE_GOOGLE_CLIENT_ID` พร้อมใส่ Google OAuth Client ID ของคุณ
4. ตรวจสอบว่ามีให้ใช้สำหรับ **Production**, **Preview**, และ **Development** environments

### ขั้นตอนที่ 4: ตรวจสอบการตั้งค่า

หลังจากอัปเดต Google Cloud Console แล้ว:
- รอสักครู่เพื่อให้การเปลี่ยนแปลงมีผล (ประมาณ 5-10 นาที)
- ล้าง cache ของเบราว์เซอร์
- ลองล็อกอินอีกครั้ง

## ปัญหาที่พบบ่อย

### ปัญหา: ยังได้ redirect_uri_mismatch หลังจากเพิ่ม URL แล้ว

**วิธีแก้:**
- ตรวจสอบว่าใช้ URL ที่ถูกต้อง (รวม `https://` และไม่มี `/` ท้าย URL)
- รอ 5-10 นาทีเพื่อให้การเปลี่ยนแปลงของ Google มีผล
- ตรวจสอบว่าเพิ่ม URL ในทั้ง "Authorized JavaScript origins" **และ** "Authorized redirect URIs"
- ตรวจสอบว่า URL ของ Vercel ตรงกับที่ใส่ใน Google Cloud Console ทุกตัวอักษร

### ปัญหา: ใช้ได้ในเครื่องแต่ใช้ไม่ได้บน Vercel

**วิธีแก้:**
- ตรวจสอบว่า `VITE_GOOGLE_CLIENT_ID` ถูกตั้งค่าใน Vercel environment variables แล้ว
- ตรวจสอบว่าเพิ่ม URL ของ Vercel ใน Google Cloud Console แล้ว
- ตรวจสอบว่า environment variable มีให้ใช้สำหรับ environment ที่ถูกต้อง (Production/Preview)

### ปัญหา: Preview deployments ใช้ไม่ได้

**วิธีแก้:**
- เพิ่ม preview URL เฉพาะใน Google Cloud Console, หรือ
- ใช้ wildcard pattern `https://*.vercel.app` (ถ้า Google รองรับ)
- หรือเพิ่ม preview URL แต่ละตัวด้วยตนเองเมื่อสร้าง

## การทดสอบ

1. **ทดสอบในเครื่อง:**
   ```bash
   npm run dev
   ```
   ตรวจสอบว่า `http://localhost:5173` อยู่ใน Google Cloud Console ของคุณ

2. **ทดสอบบน Vercel:**
   - Deploy ไปที่ Vercel
   - ตรวจสอบ deployment URL
   - ตรวจสอบว่า URL นั้นอยู่ใน Google Cloud Console
   - ทดสอบการล็อกอิน

## หมายเหตุเพิ่มเติม

- `useGoogleLogin` hook จาก `@react-oauth/google` ใช้ popup-based OAuth flow
- redirect URI ถูกตั้งอัตโนมัติเป็น `window.location.origin`
- คุณไม่สามารถ override redirect URI ใน `useGoogleLogin` ได้ ดังนั้นต้องแน่ใจว่า deployment URLs ทั้งหมดถูก whitelist ใน Google Cloud Console

