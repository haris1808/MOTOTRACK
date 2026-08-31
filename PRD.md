# MOTO-TRACK -- Product Requirements Document

| Field   | Detail          |
| ------- | --------------- |
| Produk  | MOTO-TRACK      |
| Versi   | 1.0             |
| Author  | Haris           |
| Tanggal | Agustus 2026    |

---

## 1. Ringkasan Produk

MOTO-TRACK adalah aplikasi web berbasis single-page application (SPA) yang dirancang khusus untuk membantu pemilik motor matic memantau jadwal servis dan penggantian sparepart berdasarkan kilometer (KM) tempuh kendaraan. Aplikasi ini menyediakan dashboard terpusat di mana pengguna dapat melacak odometer, melihat status keausan belasan komponen motor, mencatat riwayat servis, serta menganalisis pengeluaran perawatan kendaraan secara visual.

Dibangun dengan teknologi Vanilla HTML, CSS, dan JavaScript tanpa framework berat, MOTO-TRACK mengutamakan performa ringan dan kemampuan offline-first melalui dukungan Progressive Web App (PWA). Data disimpan di localStorage secara default sehingga aplikasi tetap berfungsi tanpa koneksi internet, dengan opsi sinkronisasi ke Supabase cloud bagi pengguna yang menginginkan backup data di server.

Seluruh antarmuka menggunakan Bahasa Indonesia agar mudah dipahami oleh target pengguna utama, yaitu pemilik motor matic di Indonesia yang ingin menjaga kondisi kendaraannya tetap prima tanpa harus mengingat-ingat jadwal servis secara manual.

---

## 2. Latar Belakang dan Masalah

Motor matic adalah jenis kendaraan bermotor paling populer di Indonesia. Namun banyak pemilik motor matic yang tidak memiliki catatan perawatan yang terstruktur. Jadwal penggantian oli mesin, V-Belt, roller, dan komponen lainnya sering kali hanya mengandalkan ingatan atau perkiraan kasar. Akibatnya, sparepart sering terlambat diganti yang berujung pada kerusakan lebih parah dan biaya perbaikan yang membengkak.

Buku servis bawaan dealer jarang diisi secara konsisten, dan catatan manual di kertas mudah hilang. Tidak ada solusi digital sederhana berbahasa Indonesia yang fokus pada kebutuhan spesifik pemilik motor matic, yaitu pelacakan berbasis KM untuk setiap komponen yang memiliki interval penggantian berbeda-beda.

MOTO-TRACK hadir untuk mengisi kekosongan tersebut. Dengan memasukkan KM odometer terkini, pengguna langsung bisa melihat komponen mana yang sudah mendekati batas atau wajib diganti, lengkap dengan riwayat servis dan analisis biaya. Pendekatan ini mengubah perawatan motor dari reaktif (rusak baru ganti) menjadi preventif (ganti sebelum rusak).

---

## 3. Target Pengguna

- Pemilik motor matic di Indonesia yang ingin merawat kendaraannya secara preventif.
- Pengguna yang terbiasa menggunakan smartphone atau laptop untuk mencatat data harian.
- Tidak memerlukan keahlian teknis mekanik; cukup mengetahui KM odometer motor.
- Rentang usia 17-45 tahun, pengguna aktif kendaraan pribadi untuk harian maupun perjalanan jarak jauh.

---

## 4. Tujuan Produk

1. Menyediakan sistem pelacakan jadwal servis motor matic berbasis KM yang akurat dan mudah digunakan.
2. Mengurangi risiko kerusakan kendaraan akibat keterlambatan penggantian sparepart dengan indikator visual status komponen (aman, perhatian, wajib ganti).
3. Memberikan catatan riwayat servis yang terstruktur dan dapat ditelusuri secara kronologis.
4. Membantu pengguna menganalisis dan mengontrol pengeluaran perawatan motor melalui statistik dan grafik.
5. Menyediakan aplikasi yang ringan, cepat, dan tetap berfungsi secara offline tanpa ketergantungan pada koneksi internet.

---

## 5. Fitur Utama

### 5.1 Sistem Multi-User & Autentikasi Pengguna

Sistem autentikasi terstruktur dengan dukungan multi-user dan isolasi data per akun:
- **Tab Masuk & Daftar Akun Baru**: Pengguna baru dapat mendaftar dengan Nama Lengkap, Username unik, dan Kata Sandi.
- **Akun Default Bawaan**: Akun bawaan `admin` (`admin` / `admin354313`) tetap tersedia secara otomatis untuk data demo motor matic awal.
- **Isolasi Data Penuh (Data Scoping)**: Setiap akun pengguna memiliki data motor, sparepart, kilometer, dan histori servis yang terpisah secara independen (`user_id`). Data pengguna A tidak akan bercampur atau terlihat oleh pengguna B.
- **Pengaturan Profil Akun**: Modal interaktif di header dashboard untuk mengubah nama lengkap dan memperbarui kata sandi pengguna.
- **Panel Manajemen Pengguna untuk Admin**: Akun `admin` memiliki tombol khusus di header untuk membuka modal **Manajemen Pengguna Terdaftar**, yang menampilkan statistik total akun, total motor, total servis, tabel seluruh pengguna terdaftar, pencarian live, reset password pengguna oleh admin, serta opsi menghapus akun pengguna (cascade).

### 5.2 Multi-Kendaraan

Pengguna dapat menambahkan lebih dari satu motor pada akunnya, berpindah antar kendaraan aktif, serta mengelola (edit/hapus) data masing-masing motor. Setiap motor memiliki data odometer, daftar part, dan riwayat servis yang terpisah.

### 5.3 Odometer Real-Time

Panel update KM memungkinkan pengguna memasukkan angka odometer terkini secara manual atau menggunakan tombol quick increment (+25, +50, +100, +500 KM). Perubahan KM langsung memperbarui status seluruh part yang terpasang pada kendaraan tersebut.

### 5.4 Pelacak Sparepart (13+ Komponen)

Setiap kendaraan memiliki daftar 13 atau lebih sparepart standar motor matic dengan interval penggantian masing-masing. Status setiap part dihitung otomatis berdasarkan persentase KM yang sudah ditempuh sejak penggantian terakhir:

| Status       | Kondisi                                |
| ------------ | -------------------------------------- |
| Aman         | Pemakaian masih di bawah 75% interval  |
| Perhatian    | Pemakaian antara 75% - 100% interval   |
| Wajib Ganti  | Pemakaian sudah melewati 100% interval |

#### 5.4.1 Sistem Notifikasi Pengingat Layar (Auto Alert)

Ketika setiap pengguna login atau membuka dashboard:
- **Pop-up Modal Pengingat Otomatis**: Jika terdeteksi minimal 1 komponen berstatus *Wajib Ganti* atau *Perhatian*, sistem akan memunculkan modal interaktif dengan ringkasan status part, KM terlambat / sisa KM, dan tombol langsung "Ganti Part".
- **Pita Banner Pemberitahuan di Dashboard**: Banner beranimasi pulsing di bagian atas layar untuk mengingatkan pengguna akan part yang mendekati atau melewati interval servis.
- **Badge Lonceng Notifikasi di Header**: Ikon lonceng dengan counter badge angka part kritis yang dapat diklik kapan saja untuk meninjau rincian komponen.

#### 5.4.2 Visual Ilustrasi Sparepart (High-End Vector Showcase)

Setiap sparepart motor dilengkapi dengan gambar ilustrasi visual vektor SVG modern dengan efek glassmorphic glow:
- **Tampilan Visual di Kartu Tracker**: Menampilkan badge gambar 3D interaktif pada sudut kartu yang membesar (*zoom & rotate on hover*).
- **Resolver Otomatis Berdasarkan Nama**: Menyesuaikan gambar secara otomatis untuk 13+ komponen (Oli Mesin, Oli Gardan, Busi, Filter Udara, V-Belt, Roller CVT, Kampas Kopling Ganda, Kampas Rem Depan/Belakang, Minyak Rem DOT 4, Radiator Coolant, Ban Depan/Belakang, Aki MF, Gemuk CVT).
- **Kustomisasi Gambar Part**: Pengguna dapat memilih gambar part kustom saat menambahkan atau mengedit sparepart.
- **Visual Thumbnail pada Modal Pengingat & Servis**: Memudahkan pengguna mengidentifikasi fisik komponen secara instan tanpa perlu membaca teks teknis yang rumit.

### 5.5 Filter dan Pencarian Part

Pengguna dapat menyaring daftar part berdasarkan:

- Status (aman / perhatian / wajib ganti)
- Kategori (mesin, transmisi, kelistrikan, dll.)
- Pencarian teks bebas berdasarkan nama part

### 5.6 Log Servis

Formulir pencatatan servis dengan field:

- Tanggal servis
- KM odometer saat servis
- Nama/merek part yang diganti
- Nama bengkel
- Harga part
- Ongkos mekanik/jasa
- Catatan tambahan

Saat log servis dicatat, nilai `last_replaced_km` pada part terkait otomatis diperbarui.

### 5.7 Riwayat Servis Kronologis

Daftar seluruh log servis ditampilkan secara kronologis (terbaru di atas) dengan kemampuan melihat detail setiap entri. Riwayat dikelompokkan per kendaraan.

### 5.8 Statistik dan Analisis Biaya

Halaman statistik menampilkan:

- Total pengeluaran servis (harga part + ongkos mekanik)
- Rata-rata biaya per servis
- Health score kendaraan (persentase rata-rata kondisi seluruh part)
- Chart pengeluaran per kategori part (menggunakan Chart.js)
- Part yang paling sering diganti

### 5.9 Export dan Import Data JSON

Pengguna dapat mengekspor seluruh data (kendaraan, part, log servis) ke file JSON untuk backup manual, serta mengimpor file JSON untuk mengembalikan data.

### 5.10 Load Demo Data dan Reset Data

Fitur untuk memuat data contoh agar pengguna baru bisa langsung melihat cara kerja aplikasi tanpa harus mengisi data terlebih dahulu. Tersedia juga opsi reset untuk menghapus seluruh data dan kembali ke kondisi awal.

### 5.11 Cetak Rekap Servis

Fungsi cetak yang menghasilkan tampilan print-friendly dari rekap servis kendaraan, siap dicetak atau disimpan sebagai PDF melalui dialog cetak browser.

### 5.12 Integrasi Supabase Cloud (Opsional)

Jika pengguna mengkonfigurasi Supabase URL dan anon key, data akan disinkronkan ke database PostgreSQL di cloud. Mode ini memungkinkan akses data dari beberapa perangkat.

### 5.13 PWA Support

Aplikasi dapat di-install ke home screen perangkat mobile atau desktop melalui manifest dan service worker. Mendukung penggunaan offline dengan caching aset statis.

### 5.14 Toast Notification System

Sistem notifikasi toast di dalam aplikasi untuk memberikan feedback instan kepada pengguna saat melakukan aksi (simpan berhasil, error, peringatan, dll.).

---

## 6. Arsitektur Teknis

### 6.1 Tech Stack

| Komponen        | Teknologi                          |
| --------------- | ---------------------------------- |
| Frontend        | HTML5, CSS3, Vanilla JavaScript    |
| Arsitektur      | Single Page Application (SPA)      |
| Backend/DB      | Supabase (PostgreSQL) -- opsional  |
| Storage Lokal   | localStorage, sessionStorage       |
| Grafik          | Chart.js                           |
| Ikon            | Lucide Icons                       |
| PWA             | Service Worker, Web App Manifest   |

### 6.2 Data Flow

```
User Input
    |
    v
HTML UI (index.html)
    |
    v
app.js (logika aplikasi)
    |
    v
DataStore Abstraction
    |
    +--> localStorage (default / offline mode)
    |
    +--> Supabase Client (cloud mode, jika dikonfigurasi)
    |
    v
Render UI (update DOM)
```

### 6.3 Dual Mode Storage

Aplikasi menerapkan pola abstraksi DataStore yang mendeteksi apakah konfigurasi Supabase tersedia:

- **Mode Lokal (default):** Semua operasi CRUD dilakukan terhadap `localStorage`. Data tersimpan di browser pengguna dan tidak memerlukan koneksi internet. Cocok untuk penggunaan pribadi di satu perangkat.
- **Mode Cloud:** Jika Supabase URL dan anon key dikonfigurasi, DataStore mengarahkan operasi CRUD ke Supabase REST API. Data tersimpan di PostgreSQL cloud dan dapat diakses dari perangkat manapun.

Pergantian mode tidak memerlukan perubahan kode di sisi UI karena seluruh akses data melewati abstraksi DataStore yang sama.

---

## 7. Skema Database

### 7.1 Tabel `vehicles`

| Kolom            | Tipe         | Keterangan                             |
| ---------------- | ------------ | -------------------------------------- |
| id               | UUID         | Primary Key, generated                 |
| name             | TEXT         | Nama/model motor (misal: Beat 2023)    |
| year             | INTEGER      | Tahun pembuatan                        |
| plate            | TEXT         | Nomor plat kendaraan                   |
| current_odometer | INTEGER      | KM odometer terakhir                   |
| preset_type      | TEXT         | Tipe preset part (matic_standard, dll) |
| created_at       | TIMESTAMPTZ  | Waktu data dibuat                      |

### 7.2 Tabel `parts`

| Kolom            | Tipe         | Keterangan                             |
| ---------------- | ------------ | -------------------------------------- |
| id               | UUID         | Primary Key, generated                 |
| vehicle_id       | UUID         | Foreign Key ke vehicles.id             |
| name             | TEXT         | Nama part (misal: Oli Mesin)           |
| category         | TEXT         | Kategori (mesin, transmisi, dll)       |
| interval_km      | INTEGER      | Interval penggantian dalam KM          |
| last_replaced_km | INTEGER      | KM saat terakhir diganti               |
| icon             | TEXT         | Nama ikon Lucide                       |
| est_price        | INTEGER      | Estimasi harga part (Rupiah)           |
| description      | TEXT         | Deskripsi atau catatan part            |
| created_at       | TIMESTAMPTZ  | Waktu data dibuat                      |

### 7.3 Tabel `service_logs`

| Kolom            | Tipe         | Keterangan                             |
| ---------------- | ------------ | -------------------------------------- |
| id               | UUID         | Primary Key, generated                 |
| vehicle_id       | UUID         | Foreign Key ke vehicles.id             |
| part_id          | UUID         | Foreign Key ke parts.id (nullable)     |
| part_name        | TEXT         | Nama part (denormalisasi)              |
| service_date     | DATE         | Tanggal servis dilakukan               |
| odometer_km      | INTEGER      | KM odometer saat servis                |
| part_brand       | TEXT         | Merek part yang digunakan              |
| shop_name        | TEXT         | Nama bengkel                           |
| part_price       | INTEGER      | Harga part (Rupiah)                    |
| labor_fee        | INTEGER      | Ongkos jasa mekanik (Rupiah)           |
| notes            | TEXT         | Catatan tambahan                       |
| created_at       | TIMESTAMPTZ  | Waktu data dibuat                      |

---

## 8. User Flow

```
[Login]
   |
   v
[Dashboard]
   |- Overview kendaraan aktif
   |- Panel odometer (update KM, quick increment)
   |- Ringkasan status part
   |
   v
[Tab Pelacak Part]
   |- Daftar 13+ part dengan status visual
   |- Filter by status / kategori / teks
   |- Aksi: catat servis per part
   |
   v
[Tab Riwayat Servis]
   |- Daftar log servis kronologis
   |- Detail per entri
   |
   v
[Tab Statistik]
   |- Total & rata-rata biaya
   |- Health score
   |- Chart pengeluaran per kategori
   |- Part paling sering diganti
```

---

## 9. Preset 13 Part Motor Matic Standar

| No | Nama Part          | Kategori     | Interval KM |
| -- | ------------------ | ------------ | ----------- |
| 1  | Oli Mesin          | Mesin        | 2.000       |
| 2  | Oli Gear/Transmisi | Transmisi    | 12.000      |
| 3  | V-Belt             | Transmisi    | 25.000      |
| 4  | Roller             | Transmisi    | 25.000      |
| 5  | Busi               | Kelistrikan  | 8.000       |
| 6  | Filter Udara       | Mesin        | 16.000      |
| 7  | Kampas Rem Depan   | Rem          | 20.000      |
| 8  | Kampas Rem Belakang| Rem          | 20.000      |
| 9  | Aki/Baterai        | Kelistrikan  | 30.000      |
| 10 | Ban Depan          | Ban          | 25.000      |
| 11 | Ban Belakang       | Ban          | 20.000      |
| 12 | Coolant/Radiator   | Mesin        | 20.000      |
| 13 | Kampas Kopling     | Transmisi    | 25.000      |

Catatan: Interval KM bersifat estimasi umum dan dapat disesuaikan oleh pengguna sesuai rekomendasi pabrikan masing-masing motor.

---

## 10. Non-Functional Requirements

- **Offline-first:** Aplikasi harus berfungsi penuh tanpa koneksi internet menggunakan localStorage dan service worker caching.
- **Responsif:** Tampilan harus optimal di perangkat mobile (360px ke atas), tablet, dan desktop.
- **Performa ringan:** Tidak menggunakan framework berat. Total ukuran aset awal (tanpa library eksternal) di bawah 500 KB.
- **PWA installable:** Memenuhi kriteria installability (manifest, service worker, HTTPS) sehingga bisa ditambahkan ke home screen.
- **Kompatibilitas browser:** Mendukung Chrome, Edge, Firefox, dan Safari versi terbaru.

---

## 11. Batasan dan Asumsi

- Autentikasi bersifat sederhana (hardcoded) dan tidak ditujukan untuk lingkungan produksi multi-user. Satu instance aplikasi digunakan oleh satu pengguna.
- Data di localStorage terikat pada browser dan perangkat tertentu. Jika browser di-reset atau cache dihapus, data lokal akan hilang kecuali sudah diekspor.
- Integrasi Supabase memerlukan konfigurasi manual (URL dan anon key) oleh pengguna atau developer.
- Interval KM pada preset bersifat estimasi umum untuk motor matic. Angka sebenarnya bisa berbeda tergantung merek, model, dan kondisi pemakaian.
- Aplikasi tidak terhubung ke sensor OBD atau sistem elektronik motor. Input KM dilakukan secara manual oleh pengguna.

---

## 12. Roadmap / Pengembangan Masa Depan

1. **Notifikasi Push dan Reminder:** Integrasi dengan Push API atau layanan notifikasi pihak ketiga untuk mengirimkan pengingat otomatis saat part mendekati batas penggantian, bahkan ketika aplikasi tidak sedang dibuka.
2. **Multi-User dan Autentikasi Supabase Auth:** Mengganti sistem login hardcoded dengan autentikasi berbasis Supabase Auth (email/password atau OAuth) sehingga mendukung penggunaan multi-user dengan data yang terisolasi per akun.
3. **Marketplace dan Rekomendasi Bengkel:** Fitur direktori bengkel terdekat dan perbandingan harga sparepart berdasarkan data servis yang dikumpulkan secara anonim dari seluruh pengguna MOTO-TRACK.
