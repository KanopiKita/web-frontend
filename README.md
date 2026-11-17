# Kanopi Kita — Web Admin & Backoffice Dashboard

Platform dashboard manajemen restorasi pohon, verifikasi lapangan, dan monitoring adopsi untuk Admin, Area Owner, dan Stakeholder Kanopi Kita. Dibangun menggunakan Next.js (App Router), MUI (Material UI), Emotion, dan Tailwind CSS.

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi**: Halaman Login & Register terintegrasi JWT auth backend.
- **Manajemen Kawasan (Areas)**: Monitoring poligon kawasan konservasi dan zonasi restorasi.
- **Inventarisasi Pohon (Trees)**: Katalog pohon kandidat, tag QR code, dan status verifikasi.
- **Survei & Inspeksi Lapangan (Surveys)**: Monitoring submission lapangan dan antrean verifikasi review.
- **Monitoring Adopsi (Adoptions)**: Pelacakan paket adopsi, status reservasi, dan transaksi.
- **Sertifikat Karbon (Carbon Certificates)**: Penerbitan dan validasi sertifikat dampak lingkungan.
- **Manajemen Insiden (Incidents)**: Triage dan tindak lanjut laporan kerusakan pohon/hama.
- **Manajemen Pengguna (Users)**: Pengaturan user, organisasi, dan penugasan RBAC.

## 🛠️ Stack Teknologi

- **Framework**: Next.js 16 (App Router) + Turbopack
- **UI Library**: MUI (Material-UI v7) + Emotion
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Iconify + Lucide
- **Runtime**: Node.js 18+ LTS

## ⚙️ Menjalankan di Lokal / Server

### 1. Salin Environment
```bash
cp .env.example .env.local
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Development Server
```bash
npm run dev
# Dashboard berjalan di http://localhost:3001
```

### 4. Build untuk Produksi
```bash
npm run build
npm run start
```
