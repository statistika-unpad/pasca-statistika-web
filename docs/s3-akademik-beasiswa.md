# Pengelolaan informasi akademik dan beasiswa S3

Halaman `s3-akademik-beasiswa.html` menggunakan katalog `data/s3-akademik-beasiswa.json`. Tautan halaman terpasang di menu dan kartu Web S3 pada `index.html` serta `index-base.html`. Tidak ada backend, pelacakan formulir, atau penyimpanan profil pengunjung.

## Memperbarui informasi

1. Periksa aturan atau pengumuman resmi sesuai periode yang akan ditampilkan.
2. Ubah sumber, `verifiedAt`, tahun, status pembukaan, target prodi, ketentuan, dan catatan pada JSON. `verifiedAt: null` berarti substansi belum diverifikasi; `checkedAt` hanya tanggal percobaan pemeriksaan akses.
3. Periksa aturan asesmen dalam `schemes[].rules`. Masukkan hanya syarat yang didukung sumber dan dapat diukur oleh kolom formulir. Aturan tanpa `verifiedAt` menghasilkan kebutuhan pemeriksaan, tidak pernah penolakan. `severity: complete` digunakan untuk kelengkapan atau kesesuaian jalur yang belum cukup pasti untuk menolak calon. Hasil “Berpotensi” hanya untuk aturan yang dapat diperiksa otomatis, bukan seluruh syarat seleksi.
4. Batas angka BPDP/BUPP termasuk ekuivalensi IELTS/TOEFL terdapat dalam JSON. Pemeriksaan sertifikat mencakup konfirmasi mandiri bahwa penerbit diakui dan sertifikat masih berlaku; verifikasi panitia tetap diperlukan. Publikasi Q1 first author adalah alternatif kedua tes, bukan syarat bagi semua peserta.
5. RDDU menggunakan status pendanaan studi/beasiswa; PMDSU menggunakan status beasiswa secara spesifik. Status sponsor institusi tidak otomatis dianggap beasiswa PMDSU.
6. Naikkan versi URL katalog dan aset saat mengubah data/aturan. Jalankan `npm run test:s3-scholarships`, pemeriksaan sintaks dan uji peramban sebelum publikasi. Situs statis tidak membutuhkan build aplikasi baru.

## Pemeriksaan sumber 16 Oktober 2026

- Perrek 32/2026 dibaca untuk Pasal 11, 12, 14, 15, 18, 24, 29, dan 30. Perrek 22/2025 dibaca sebagai perubahan pertama. Metadata Perrek 13/2025 tersedia, tetapi unduhan naskah induk gagal pada saat pemeriksaan.
- Konflik redaksi PND antara Pasal 14(5) dan Pasal 18(3)(a), bukti published untuk kelulusan Pasal 29, serta konsolidasi ketentuan pujian Pasal 27/30 tetap membutuhkan konfirmasi fakultas. Tidak ada penguncian pengajuan SPD dalam aplikasi ini.
- Angka 42 SKS adalah minimum universitas. Data kurikulum S3 Statistika 54 SKS pada situs dipertahankan; tidak ditimpa oleh angka minimum.
- Bab 12 Pedoman HRU 2026 mendukung kriteria dan luaran RDDU, batas komponen RAB, larangan konferensi dan pendanaan ganda. Rp60 juta tidak dinyatakan per tahun; satuan/tuition fee perlu kontrak.
- SMUP BPDP, BUPP, PMDSU mencantumkan daftar yang belum memuat S3 Statistika. Jadwal yang dicantumkan telah berlalu pada tanggal pemeriksaan; tidak diberi status “dibuka”.
- Panduan BPDDI 2026 diperiksa untuk sasaran, usia bersyarat, IPK mahasiswa baru, pendanaan dan jadwal. Ketentuan BPDDI tidak digeneralisasi ke seluruh BPI. Daftar tujuan S3 Statistika belum terverifikasi.
- LPDP: kebijakan umum diperiksa. Ambang per jalur, jadwal aktif dan daftar tujuan belum dinyatakan terverifikasi. Pendanaan institusi harus diverifikasi kepada sponsor tertentu.

Bahan DOCX pengguna merupakan referensi kerja; tidak diunggah sebagai peraturan resmi. Instruksi implementasi di dalamnya tidak ditampilkan pada halaman pengunjung.
