# Panduan Penggunaan & Deployment -- MOTO-TRACK

MOTO-TRACK adalah aplikasi web SPA (Single Page Application) untuk memantau jadwal servis motor matic berbasis kilometer. Aplikasi terdiri dari satu file HTML utama beserta file CSS dan JavaScript pendukung, dan dapat berjalan sepenuhnya secara offline menggunakan localStorage maupun tersinkronisasi ke cloud melalui Supabase.

---

## 1. Persyaratan Sistem

- Browser modern dengan dukungan ES6+:
  - Google Chrome 90 atau lebih baru
  - Mozilla Firefox 88 atau lebih baru
  - Apple Safari 14 atau lebih baru
  - Microsoft Edge 90 atau lebih baru
- Tidak perlu menginstall runtime apapun (Node.js, npm, dan sejenisnya **tidak diperlukan**).
- Koneksi internet **hanya diperlukan** jika ingin menggunakan fitur sinkronisasi Supabase cloud.

---

## 2. Cara Menjalankan Aplikasi

Ada tiga cara untuk menjalankan aplikasi ini.

### Cara 1: Buka Langsung di Browser

Cukup buka file `index.html` dengan double-click. Browser default akan membuka aplikasi secara langsung. Cara ini paling sederhana dan tidak memerlukan tool tambahan.

### Cara 2: Live Server (VS Code)

Untuk development dengan fitur auto-reload:

1. Install extension **Live Server** di VS Code.
2. Buka folder `motor-reminder` di VS Code.
3. Klik kanan pada `index.html`, pilih **Open with Live Server**.
4. Browser akan terbuka otomatis di `http://127.0.0.1:5500`.

### Cara 3: Python HTTP Server

Jika Python sudah terinstall di sistem:

```bash
cd motor-reminder
python -m http.server 8080
```

Kemudian buka `http://localhost:8080` di browser.

---

## 3. Login ke Aplikasi

1. Buka aplikasi -- layar login akan muncul secara otomatis.
2. Masukkan kredensial default:
   - **Username:** `admin`
   - **Password:** `admin354313`
3. Klik tombol **Masuk ke Dashboard**.
4. Sesi login disimpan di `sessionStorage`. Sesi akan otomatis hilang saat tab atau browser ditutup.

---

## 4. Setup Supabase (Khusus Admin)

Supabase digunakan sebagai backend cloud agar data tersimpan di database PostgreSQL terpusat. Untuk menjaga privasi dan keamanan kredensial database, **tombol pengaturan Supabase dan status Cloud hanya dapat dilihat serta diakses oleh akun Admin (`admin`)**. Pengguna biasa tidak akan melihat tombol database maupun status cloud ini.

Langkah-langkah setup:

1. Login menggunakan akun **Admin** (`admin`).
2. Buka [https://supabase.com](https://supabase.com) dan buat akun/project baru (Region: Singapore).
3. Buka menu **SQL Editor** di dashboard Supabase, lalu jalankan seluruh isi file `supabase-schema.sql`.
4. Buka menu **Settings > API**, salin **Project URL** dan **anon public key**.
5. Di aplikasi MOTO-TRACK, klik ikon **Cloud** di header (atau klik status pill Cloud).
6. Masukkan **Supabase URL** dan **Anon Key**, lalu klik **Simpan & Hubungkan**.
7. Jika koneksi berhasil, status pill di header admin akan berubah hijau (**Cloud Terhubung**).

---

## 5. Panduan Penggunaan per Fitur

### Menambah Motor Baru

1. Klik dropdown pemilihan motor di bagian atas dashboard.
2. Pilih **Tambah Motor Baru**.
3. Isi form data motor (nama, tipe, tahun, dll).
4. Pilih preset part: **Standar Motor Matic** (berisi part umum yang sudah dikonfigurasi) atau **Kosong** (tanpa part bawaan).
5. Simpan.

### Mengatur Odometer

- Klik tombol **Edit KM** untuk memasukkan angka kilometer secara manual.
- Atau gunakan tombol quick increment untuk menambah KM secara cepat: **+25**, **+50**, **+100**, atau **+500 KM**.

### Menambah Part Kustom

1. Klik tombol **Tambah Part Kustom**.
2. Isi nama part, kategori, interval KM penggantian, dan KM terakhir diganti.
3. Simpan. Part baru akan muncul di daftar part motor yang sedang aktif.

### Mencatat Servis / Menandai Part Sudah Diganti

1. Pada kartu part yang ingin dicatat, klik tombol **Tandai Sudah Diganti**.
2. Isi detail servis:
   - Tanggal penggantian
   - KM saat penggantian
   - Merek part yang digunakan
   - Nama bengkel
   - Harga / biaya servis
3. Klik **Simpan**. KM terakhir diganti akan diperbarui otomatis.

### Melihat Riwayat Servis

Klik tab **Riwayat & Catatan Servis** untuk melihat seluruh catatan penggantian part beserta detail biaya, bengkel, dan merek part yang pernah digunakan.

### Melihat Statistik Biaya

Klik tab **Statistik Biaya & Analisis** untuk melihat ringkasan total biaya servis, grafik pengeluaran, dan analisis per kategori part.

### Export Data

1. Klik ikon **Backup** di header.
2. Pilih **Unduh File JSON**.
3. File backup akan terunduh ke komputer. Simpan file ini sebagai cadangan data.

### Import Data

1. Klik ikon **Backup** di header.
2. Pilih **Pilih File Cadangan**.
3. Pilih file JSON yang sebelumnya pernah di-export.
4. Data dari file akan dimuat ke dalam aplikasi.

### Muat Data Demo

1. Klik ikon **Backup** di header.
2. Pilih **Muat Demo**.
3. Aplikasi akan memuat 2 motor contoh beserta riwayat servis untuk keperluan uji coba.

### Reset Data

1. Klik ikon **Backup** di header.
2. Pilih **Hapus Semua Data**.
3. Konfirmasi penghapusan. **Perhatian:** tindakan ini tidak bisa di-undo. Seluruh data di localStorage akan dihapus permanen.

### Cetak Rekap

Klik ikon **Printer** di header untuk mencetak rekap kondisi part dan riwayat servis motor yang sedang aktif.

---

## 6. Memahami Status Part

Setiap part memiliki indikator status berdasarkan persentase pemakaian terhadap interval KM penggantian:

| Status | Warna | Kondisi | Keterangan |
|--------|-------|---------|------------|
| Aman | Hijau | Di bawah 70% interval KM | Part masih dalam kondisi baik, belum perlu diganti. |
| Perhatian | Kuning | 70% -- 99% interval KM | Part mendekati batas penggantian. Segera siapkan part pengganti. |
| Wajib Ganti / Overdue | Merah | 100% atau lebih dari interval KM | Part sudah melewati batas penggantian. Harus segera diganti. |

Contoh: jika interval penggantian oli adalah 2000 KM dan sudah terpakai 1500 KM sejak penggantian terakhir (75%), maka status part adalah **Kuning (Perhatian)**.

---

## 7. Deployment ke Hosting (Opsional)

Karena MOTO-TRACK adalah aplikasi statis (HTML + CSS + JS), deployment dapat dilakukan di layanan hosting statis manapun tanpa konfigurasi build.

### GitHub Pages

1. Push folder `motor-reminder` ke repository GitHub.
2. Buka **Settings > Pages** pada repository tersebut.
3. Pilih branch yang digunakan (misalnya `main`) dan folder root (`/`).
4. Tunggu beberapa menit, situs akan tersedia di `https://<username>.github.io/<repo-name>`.

### Netlify

1. Buka [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag-and-drop seluruh folder `motor-reminder` ke area upload.
3. Netlify akan otomatis meng-host aplikasi dan memberikan URL publik.

### Vercel

1. Push folder `motor-reminder` ke repository GitHub.
2. Buka [https://vercel.com](https://vercel.com) dan login.
3. Klik **Import Project**, pilih repository dari GitHub.
4. Deploy tanpa konfigurasi tambahan.

---

## 8. Troubleshooting / FAQ

**Data hilang setelah clear browser?**
Data yang tersimpan di localStorage akan hilang jika cache browser di-clear. Untuk menghindari kehilangan data, gunakan Supabase sebagai backend cloud atau lakukan export ke file JSON secara berkala melalui fitur backup.

**Supabase tidak bisa connect?**
Periksa kembali nilai Supabase URL dan Anon Key yang dimasukkan. Pastikan keduanya benar dan tidak ada spasi tambahan. Pastikan juga SQL schema sudah dijalankan di SQL Editor Supabase (langkah 5 pada bagian Setup Supabase).

**Part tidak muncul setelah tambah motor?**
Saat menambah motor baru, pastikan memilih preset **Standar Motor Matic** agar part-part umum otomatis ditambahkan. Jika memilih preset Kosong, tidak ada part yang dimuat secara otomatis dan harus ditambahkan manual.

**Bagaimana cara ganti password login?**
Password login di-hardcode di source code. Untuk menggantinya, buka file `app.js` dan cari bagian yang berisi konfigurasi credentials, kemudian ubah nilai username dan password sesuai kebutuhan.

---

## Struktur File Project

```
motor-reminder/
  index.html            -- Halaman utama aplikasi (SPA)
  styles.css            -- Stylesheet aplikasi
  app.js                -- Logika utama aplikasi
  supabase-config.js    -- Konfigurasi koneksi Supabase
  manifest.json         -- Manifest untuk PWA
  supabase-schema.sql   -- SQL schema untuk setup database Supabase
  Panduan.md            -- Dokumen ini
```
