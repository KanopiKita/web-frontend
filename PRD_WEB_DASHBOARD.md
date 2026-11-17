# PRD KANOPI KITA — WEB DASHBOARD (ADMIN & PEMILIK KAWASAN) v2.2 (PRODUCTION FINAL)

- **Dokumen:** Product Requirement Document (PRD) & Baseline Arsitektur — Web Dashboard Backoffice
- **Versi:** 2.2 (100% Implemented, Production Build & Security Hardened)
- **Status:** COMPLETED & LIVE (`http://localhost:3001` / `https://kanopiindonesia.id`)
- **Target Pengguna:** Administrator Platform Kanopi Kita & Pemilik/Pengelola Kawasan Konservasi (Area Owner)
- **Teknologi Utama:** **Next.js 16 (App Router) + MUI v7 (`@mui/material`) + Mapbox GL JS (`react-map-gl`) + TypeScript** berbasis **Materialize Admin Template (`vertical-layout`)** yang terintegrasi penuh dengan Backend **NestJS + Fastify + PostgreSQL/PostGIS (`/v1`)**.

---

## 1. Ringkasan Eksekutif & Status Implementasi

Web Dashboard Kanopi Kita adalah pusat kendali operasional, verifikasi survei lapangan, pemetaan kawasan konservasi (WebGIS), pengawasan transaksi adopsi pohon, sertifikasi karbon, dan pengelolaan master data ekosistem Kanopi Kita.

Seluruh **16 halaman rute**, **Edge Auth Middleware (`src/middleware.ts`)**, **Adaptive Light & Dark Mode Ecological Theme**, serta **Integrasi CRUD Live ke Backend PostgreSQL/PostGIS** telah diimplementasikan 100% dan berjalan dalam mode **Production Server (`next start`)**.

---

## 2. Arsitektur Shell Vertikal & UX Pattern (PRD Bagian 2)

1. **Left Vertical Navigation ([VerticalMenu.tsx](file:///root/kanopi/kanopi-apps/frontend/src/components/layout/vertical/VerticalMenu.tsx)):**
   - Lebar desktop `260px` (collapsible menjadi mini rail `64px`).
   - **Header Brand ([Logo.tsx](file:///root/kanopi/kanopi-apps/frontend/src/components/layout/shared/Logo.tsx)):** Ikon Kanopi Hutan SVG (`#176B4D` & `#C8E66A`) + judul `Kanopi Kita` (`BACKOFFICE v2.0`).
   - **6 Grup Navigasi Terstruktur:** *Dashboard Utama*, *Konservasi & Spasial*, *Adopsi & Transaksi*, *Operasional & Tim*, *Master Data & Dokumen*, serta *Pengaturan & Audit*.
   - **Bottom User Profile Widget:** Menampilkan avatar, nama akun aktif, badge role (`SUPERADMIN` / `AREA_OWNER`), dan tombol *Quick Sign-Out*.
2. **Top Navbar Interaktif ([NavbarContent.tsx](file:///root/kanopi/kanopi-apps/frontend/src/components/layout/vertical/NavbarContent.tsx)):**
   - **Dynamic Breadcrumb** yang menyesuaikan judul modul dan sub-bagian halaman aktif.
   - **Global Quick Search Dialog:** Pencarian instan pohon terdaftar (`KNP-MRG-001`..`005`), spesies, kawasan, maupun seluruh rute menu.
   - **Status Layanan Aktif**, **Shortcut Pengaturan Mapbox (🔑)**, **Popover Notifikasi Operasional**, **Mode Switcher (Light / Dark / System)**, dan **Menu Profil Lengkap ([UserDropdown.tsx](file:///root/kanopi/kanopi-apps/frontend/src/components/layout/shared/UserDropdown.tsx))**.
3. **Vertical UX Patterns:**
   - **4-Step Vertical Stepper:** Digunakan pada modal verifikasi pohon di `/trees` (*Data Dasar $\rightarrow$ Validasi Koordinat Geospasial $\rightarrow$ Bukti Foto & Tag QR $\rightarrow$ Keputusan Kelayakan*).
   - **Vertical Activity Timeline:** Digunakan pada halaman `/settings/audit-log` untuk menampilkan kronologi aktivitas lintas peran.

---

## 3. Sistem Desain & Optimalisasi Light / Dark Mode ([colorSchemes.ts](file:///root/kanopi/kanopi-apps/frontend/src/@core/theme/colorSchemes.ts) & [globals.css](file:///root/kanopi/kanopi-apps/frontend/src/app/globals.css))

| Token | Mode Terang (Light Mode) | Mode Gelap (Dark Forest Mode) | Penggunaan |
| :--- | :---: | :---: | :--- |
| **Primary Main** | `#176B4D` | `#248F68` | Aksen utama, tombol primer, menu aktif, header. |
| **Primary Dark** | `#104D39` | `#176B4D` | State *hover* dan *active*. |
| **Secondary Sage** | `#83A98C` | `#83A98C` | Elemen sekunder & garis grafik pendukung. |
| **Accent Lime** | `#C8E66A` | `#C8E66A` | Sorotan badge khusus & outline polygon peta. |
| **Canvas Background** | `#F7F7F9` | `#0D1914` | Latar belakang utama layar (*Ecological Canvas*). |
| **Paper / Card Surface** | `#FFFFFF` | `#13241D` | Permukaan kartu, tabel, dialog modal, dan dropdown. |
| **Table Header Surface** | `#F5F5F7` | `#182C23` | Latar header tabel dengan kontras tinggi. |

---

## 4. Peta Rute Lengkap (16 Halaman Terimplementasi)

| No | Rute URL | File Komponen | Endpoint Backend Terhubung | Fitur Utama yang Sudah Aktif |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `/dashboard` | [dashboard/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/dashboard/page.tsx) | Agregasi `/v1/admin/areas`, `/trees`, `/review-queue`, `/incidents` | 4 KPI Cards, Tabel Antrean Verifikasi Pohon, Aksi Cepat, Distribusi Kesehatan. |
| **2** | `/areas` | [areas/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/areas/page.tsx) & [KanopiWebGisMap.tsx](file:///root/kanopi/kanopi-apps/frontend/src/components/map/KanopiWebGisMap.tsx) | `GET/POST /v1/admin/areas`, `POST /v1/admin/areas/:id/publish` | **Peta Interaktif Mapbox GL**, render MultiPolygon PostGIS & marker pohon, **Impor/Input Custom GeoJSON**, Publikasi Kawasan. |
| **3** | `/trees` | [trees/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/trees/page.tsx) | `GET /v1/admin/trees`, `PATCH /v1/admin/trees/:id/availability` | Tabel inventaris pohon, filter status adopsi, **Modal Review 4-Step Vertical Stepper**, **Ekspor CSV**. |
| **4** | `/surveys` | [surveys/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/surveys/page.tsx) | `GET /v1/admin/review-queue`, `POST /v1/admin/submissions/:id/review` | Toggle **Board Kanban 4 Kolom** & Tabel Batch, modal persetujuan (`APPROVED` / `REVISION_REQUIRED`). |
| **5** | `/adoptions` | [adoptions/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/adoptions/page.tsx) | `GET /v1/adoption-packages`, `POST /v1/adoption-orders`, `POST /v1/webhooks/payments/:provider` | Katalog Paket Adopsi, **Modal Buat Order Adopsi Baru**, **Rekonsiliasi Bayar**, **Ekspor Rekap Keuangan CSV**. |
| **6** | `/carbon-certificates` | [carbon-certificates/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/carbon-certificates/page.tsx) | `GET /v1/certificates/verify/:token` | Kalkulasi karbon Chave et al., **Verifikasi Nomor Sertifikat Live**, **Modal Pratinjau & Cetak Sertifikat PDF (QR Code)**. |
| **7** | `/incidents` | [incidents/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/incidents/page.tsx) | `GET /v1/admin/incidents`, `POST /v1/incidents` | Tabel tiket insiden pohon, **Modal Input Laporan Insiden Baru**, **Modal Keputusan Triage**. |
| **8** | `/calendar` | [calendar/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/calendar/page.tsx) | `GET/POST /v1/admin/assignments`, `POST /v1/admin/assignments/:id/cancel` | Kartu jadwal monitoring surveyor, **Modal Buat Jadwal Penugasan Baru**, & pembatalan tugas. |
| **9** | `/users` | [users/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/users/page.tsx) | `GET/POST /v1/users`, `PATCH /v1/users/:id/verify` | Direktori pengguna & organisasi, **Modal Undang Pengguna Baru**, **Modal Kelola Verifikasi Akun**. |
| **10** | `/master/species` | [master/species/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/master/species/page.tsx) | `GET /v1/species`, `POST /v1/admin/species` | Katalog taksonomi pohon, indikator **IUCN Red List** (`LC`/`NT`/`VU`/`EN`/`CR`), pencarian, & **Modal Tambah Spesies**. |
| **11** | `/master/form-templates` | [master/form-templates/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/master/form-templates/page.tsx) | `GET/POST /v1/admin/form-templates` | Manajemen skema form dinamis surveyor (`tree_registration`, `tree_inspection`, `monitoring`), **Inspector JSON Schema**, & tambah versi. |
| **12** | `/master/organizations` | [master/organizations/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/master/organizations/page.tsx) | `GET/POST /v1/organizations`, `PATCH /v1/organizations/:id/verify` | Manajemen lembaga (`NGO`, `COMMUNITY`, `CORPORATE`, `GOVERNMENT`), tambah mitra, & verifikasi organisasi. |
| **13** | `/master/evidence` | [master/evidence/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/master/evidence/page.tsx) | Agregasi submissions, trees, & areas | **Galeri Foto Bukti Lapangan ber-EXIF GPS**, **Inspector Checksum SHA-256**, & **Arsip Dokumen SK Kawasan**. |
| **14** | `/settings/account` | [settings/account/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/settings/account/page.tsx) | `GET /v1/me`, `PATCH /v1/users/:id`, `POST /v1/auth/login` | Edit profil & password, daftar **Kapabilitas RBAC Aktif**, & **1-Click Multi-Role Session Switcher**. |
| **15** | `/settings/system` | [settings/system/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/settings/system/page.tsx) | `GET /v1/areas`, `POST /v1/webhooks/payments/:provider` | **Kredensial Mapbox Token (`pk.*`) & Default Style**, **Cek Latensi Layanan**, & **Konfirmasi Manual/Simulator Pembayaran**. |
| **16** | `/settings/audit-log` | [settings/audit-log/page.tsx](file:///root/kanopi/kanopi-apps/frontend/src/app/(dashboard)/settings/audit-log/page.tsx) | Agregasi mutasi lintas modul | **Vertical Activity Timeline**, filter modul audit, & **Ekspor Audit CSV**. |
| **17** | `/login` & `/register` | [Login.tsx](file:///root/kanopi/kanopi-apps/frontend/src/views/Login.tsx) & [Register.tsx](file:///root/kanopi/kanopi-apps/frontend/src/views/Register.tsx) | `POST /v1/auth/login`, `POST /v1/adopters/register` | Login dengan preset cepat 3 role (*Admin*, *Area Owner*, *Surveyor*), set cookie `SameSite=Lax`, & registrasi adopter baru. |

---

## 5. Keamanan, Klien API & Arsitektur Produksi

1. **Edge Route Protection ([src/middleware.ts](file:///root/kanopi/kanopi-apps/frontend/src/middleware.ts)):**
   - Memverifikasi cookie `access_token` di sisi server pada setiap request halaman dashboard. Pengguna yang belum login diarahkan (`307 Redirect`) ke `/login?redirect=...`.
2. **API Client Terpusat ([src/libs/apiClient.ts](file:///root/kanopi/kanopi-apps/frontend/src/libs/apiClient.ts)) & Tipe Domain ([src/types/kanopiTypes.ts](file:///root/kanopi/kanopi-apps/frontend/src/types/kanopiTypes.ts)):**
   - Otomatis menyisipkan header `Authorization: Bearer <token>` dan `X-Idempotency-Key` pada setiap mutasi.
   - Mendukung rotasi token otomatis via `POST /v1/auth/refresh` saat menerima respons `401`.
   - Dilengkapi *In-Memory GET Request Deduplication & Short-Lived Cache* (12 detik) yang otomatis di-reset saat ada mutasi data.
3. **Production Server (`kanopi-frontend.service`):**
   - Berjalan menggunakan hasil build `next build` + `next start -p 3001 -H 0.0.0.0` (konsumsi memori ~110 MB, waktu respons halaman ~100 ms).
   - Catatan operasional: Setiap kali ada perubahan kode di `src/`, jalankan `npm run build && systemctl restart kanopi-frontend.service` agar bundle produksi diperbarui.
