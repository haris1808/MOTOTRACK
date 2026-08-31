# Panduan Penggunaan & Deployment -- MOTO-TRACK

MOTO-TRACK adalah aplikasi web SPA (Single Page Application) modern untuk memantau jadwal servis dan penggantian sparepart motor matic berbasis kilometer (KM). Aplikasi terdiri dari file statis (HTML, CSS, JavaScript) yang dapat berjalan sepenuhnya secara offline (menggunakan `localStorage`) maupun tersinkronisasi online ke cloud database melalui **Supabase**.

---

## 1. Persyaratan Sistem

- Browser modern dengan dukungan ES6+:
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Apple Safari 14+
  - Microsoft Edge 90+
  - Browser Mobile (Android Chrome / iOS Safari)
- Runtime khusus seperti Node.js / npm **tidak wajib** untuk menjalankan aplikasi karena merupakan web statis client-side murni.
- Koneksi internet diperlukan jika menggunakan fitur sinkronisasi Supabase cloud.

---

## 2. Cara Menjalankan Aplikasi Secara Lokal

### Cara 1: Buka Langsung di Browser
Cukup buka file `index.html` dengan double-click atau drag ke browser.

### Cara 2: Live Server (VS Code)
1. Install ekstensi **Live Server** di VS Code.
2. Buka folder proyek `MOTOTRACK` di VS Code.
3. Klik kanan pada `index.html`, pilih **Open with Live Server**.
4. Browser akan terbuka otomatis di `http://127.0.0.1:5500`.

### Cara 3: Python HTTP Server
```bash
python -m http.server 8080
```
Buka `http://localhost:8080` di browser.

---

## 3. Login & Manajemen Akun

### Akun Administrator Bawaan:
- **Username:** `admin`
- **Password:** `admin354313`

### Fitur Registrasi & Pengguna Baru:
- Pengguna baru dapat mendaftar melalui tab **Daftar Akun Baru** di halaman awal.
- Setiap pengguna memiliki ruang data motor dan riwayat servis terisolasi.
- Pengguna dapat memperbarui nama lengkap dan password melalui menu **Edit Profil**.
- Administrator memiliki akses ke menu **Kelola Pengguna** untuk melihat statistik seluruh akun, mereset password pengguna, atau menghapus akun.

---

## 4. Setup Database Supabase & Deployment ke Vercel

Agar data tersimpan permanen di cloud dan tersinkronisasi di semua perangkat (termasuk saat dibuka dari link Vercel), ikuti langkah berikut:

### Langkah A: Setup Project & Database di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
2. Klik **New Project**, beri nama project (misal `mototrack-db`), buat database password yang aman, dan pilih Region terdekat (misal `Singapore`).
3. Tunggu hingga project Supabase selesai dibuat (1-2 menit).
4. Buka menu **SQL Editor** pada sidebar kiri Supabase dashboard.
5. Klik **New Query**, lalu salin seluruh isi file `supabase-schema.sql` dan tempelkan ke SQL Editor.
6. Klik tombol **Run** (Ctrl+Enter). Pastikan muncul pesan `Success. No rows returned`.
   > SQL ini membuat tabel `users`, `vehicles`, `parts`, `service_logs`, relasi Foreign Key dengan `ON DELETE CASCADE`, serta Row Level Security (RLS) policies agar proses CRUD (termasuk DELETE) tersinkron dengan lancar.
7. Buka menu **Project Settings > API**.
8. Salin 2 nilai penting:
   - **Project URL** (contoh: `https://abcdefghijkl.supabase.co`)
   - **Project API Keys (`anon` / `public`)** (contoh: `eyJhbGciOiJIUzI1NiIsIn...`)

### Langkah B: Hubungkan Supabase di Aplikasi MOTO-TRACK
1. Buka aplikasi MOTO-TRACK (lokal maupun di URL Vercel).
2. Login menggunakan akun **Admin** (`admin`).
3. Klik ikon **Database/Cloud** di header (atau klik status pill **Mode Lokal**).
4. Masukkan **Project URL** dan **Anon Key** yang sudah disalin dari Supabase.
5. Klik **Simpan & Hubungkan Supabase**.
6. Jika berhasil, status pill di header akan berubah hijau menjadi **Cloud Terhubung**.
7. Data lokal Anda akan otomatis tersinkronisasi ke cloud database Supabase.

*(Opsional)* Anda juga dapat mengisi `DEFAULT_CONFIG` pada file `supabase-config.js` dengan URL dan Anon Key agar aplikasi langsung terhubung ke Supabase secara otomatis saat pertama kali dibuka di hosting Vercel.

---

## 5. Deployment dari GitHub ke Vercel

MOTO-TRACK adalah aplikasi statis murni, sehingga proses deploy ke Vercel sangat cepat dan mudah:

1. Push seluruh source code project ke repository GitHub Anda (misal `haris1808/MOTOTRACK`).
2. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub.
3. Klik tombol **Add New... > Project**.
4. Cari dan pilih repository **MOTOTRACK**, lalu klik **Import**.
5. Pada bagian **Framework Preset**, biarkan bernilai **Other** (atau Static Site).
6. **Root Directory:** `./` (default).
7. Klik tombol **Deploy**.
8. Dalam beberapa detik, situs Anda sudah aktif di URL publik Vercel (contoh: `https://mototrack.vercel.app`).
9. Buka URL Vercel tersebut, login sebagai `admin`, lalu hubungkan Supabase via modal pengaturan Cloud.

---

## 6. Panduan Penggunaan Fitur

### Menambah Motor Baru
1. Klik tombol **+ Tambah Motor** di samping pilihan motor.
2. Masukkan nama motor, tahun pembuatan, plat nomor, kilometer saat ini, dan tipe preset part (**Standar Motor Matic** / **Kosong**).
3. Klik **Simpan Motor**.

### Menghapus Motor
1. Buka menu opsi pada motor yang ingin dihapus.
2. Klik tombol **Hapus Motor** dan konfirmasi. Motor beserta seluruh part dan catatan servisnya akan terhapus baik di lokal maupun di cloud database.

### Memantau Status & Mengganti Sparepart
1. Pada kartu sparepart, sistem menampilkan indikator visual:
   - **Hijau (Aman):** Pemakaian di bawah 70% dari batas interval.
   - **Kuning (Perhatian):** Pemakaian 70% - 99% dari batas interval. Segera siapkan part pengganti.
   - **Merah (Wajib Ganti / Overdue):** Pemakaian 100% ke atas. Wajib segera diganti.
2. Klik **Tandai Sudah Diganti** untuk mencatat penggantian sparepart dan mereset odometer part.

### Menghapus Part atau Catatan Riwayat Servis
1. **Hapus Part:** Klik ikon sampah pada kartu sparepart dan konfirmasi.
2. **Hapus Catatan Riwayat:** Masuk ke tab **Riwayat & Catatan Servis**, klik tombol sampah pada baris riwayat yang ingin dihapus. Perubahan akan langsung tersinkron ke Supabase.

### Backup & Restore Data (JSON)
- Klik ikon **Cadangan & Demo** di header.
- **Unduh File JSON:** Menyimpan seluruh data motor dan servis ke file `.json`.
- **Pulihkan dari File JSON:** Memuat data cadangan kembali ke aplikasi.
- **Muat Data Demo:** Memuat data simulasi untuk mencoba fitur aplikasi.
- **Hapus Semua Data:** Mengosongkan data motor dan riwayat yang dimiliki pengguna saat ini.

---

## 7. Troubleshooting / Tanya Jawab (FAQ)

### Tanya: Mengapa data yang dihapus sebelumnya sempat muncul kembali?
**Jawaban & Solusi:**
Hal tersebut terjadi jika:
1. **Mode Cloud belum aktif saat penghapusan dilakukan:** Jika Supabase belum terhubung saat menghapus part/motor, penghapusan hanya terjadi di memori browser lokal. Saat Supabase terhubung kemudian hari, data dari cloud ditarik kembali.
   *Solusi yang sudah diperbaiki:* Sistem kini otomatis menghubungkan cloud terlebih dahulu sebelum memuat atau memodifikasi data, dan proses hapus di cloud dipastikan tereksekusi dengan validasi response.
2. **Auto-seeding Data Demo:** Sebelumnya sistem memuat ulang data demo jika daftar motor kosong.
   *Solusi yang sudah diperbaiki:* Sistem kini hanya memuat data demo sekali saat instalasi pertama, dan tidak akan memaksakan pembuatan data demo saat pengguna sengaja menghapus motor/datanya.

### Tanya: Bagaimana cara memastikan Supabase Cloud aktif di Vercel?
1. Login sebagai `admin`.
2. Lihat indikator di kanan atas header. Jika berwarna hijau dengan teks **Cloud Terhubung**, berarti semua aktivitas (tambah, edit, hapus) langsung tersinkron ke database PostgreSQL Supabase.
3. Jika masih **Mode Lokal**, klik tombol tersebut dan masukkan URL serta Anon Key dari Supabase Dashboard.

### Tanya: Bagaimana cara mengganti password atau mengelola akun pengguna?
- Masuk ke menu **Edit Profil** (ikon user di pojok kanan atas) untuk mengubah nama atau password akun sendiri.
- Akun `admin` dapat membuka menu **Kelola Pengguna** (ikon users di samping database) untuk mengelola semua akun pengguna lain.

---

## Struktur File Project

```
MOTOTRACK/
  ├── index.html            # File HTML utama (Single Page Application)
  ├── styles.css            # Desain styling antarmuka modern & responsif
  ├── app.js                # Logika utama aplikasi, DataStore, & UI controller
  ├── supabase-config.js    # Pengelola koneksi dan konfigurasi Supabase Cloud
  ├── supabase-schema.sql   # SQL Schema (tabel, foreign key cascade, index, RLS)
  ├── manifest.json         # Konfigurasi Progressive Web App (PWA)
  ├── assets/               # Ikon SVG sparepart motor matic
  └── Panduan.md            # Dokumentasi panduan penggunaan & deployment
```

