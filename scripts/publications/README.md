# Snapshot publikasi, 3 Oktober 2026

Daftar berisi 17 dosen yang ditentukan pengelola. Periode katalog tetap 2022–2026. Afiliasi ditampilkan sebagaimana tercantum pada sumber; keanggotaan daftar ini bukan kesimpulan tentang afiliasi atau homebase SINTA.

68 halaman publik diperiksa: empat tab SINTA untuk masing-masing dosen, yaitu Scopus, Web of Science, Google Scholar, dan Garuda. Setiap artikel menyimpan URL sumber, URL rekaman, indeks, tanggal pemeriksaan, serta sitasi bila ditampilkan. `sourceAudit` menyimpan hash SHA-256 markdown sumber. Halaman publik hanya menyajikan pilihan rekaman terbaru. Jumlah yang dihimpun bukan jumlah seluruh karya dosen.

Revisi kebijakan 4 Oktober 2026: katalog hanya memakai rekaman pada tab Scopus, WoS, dan Garuda yang terbaca dari snapshot SINTA 3 Oktober 2026. Entri Google Scholar tidak dimasukkan ke artikel, hubungan dosen–artikel, kategori, atau statistik tahunan. Profil Google Scholar tetap menjadi referensi eksternal; audit pembacaan tabnya dipertahankan, bukan bukti inklusi katalog.

Koreksi dari 323 menjadi 221 publikasi unik: 60 entri khusus Google Scholar dikeluarkan, bersama 42 entri arsip lama yang belum terkonfirmasi pada snapshot terbaru. Ini bukan penilaian bahwa semua entri tersebut tidak valid; keduanya tidak memenuhi batas bukti katalog ini. Rekaman asli tetap tersedia dalam riwayat Git. Daftar ini tetap bersifat parsial, bukan seluruh publikasi SINTA dosen.

Penyaringan dilakukan sebelum deduplikasi, sehingga hubungan dosen–artikel yang hanya didukung Google Scholar juga tidak terbawa ke artikel yang sama. Dedup memakai judul dan tahun, DOI, atau ID rekaman. Artikel bersama tetap dihitung sekali.
Metrik profil berasal dari tabel ringkasan SINTA dan tidak dijumlahkan antarindeks atau diperlakukan sebagai metrik khusus 2022–2026. Nilai nol dari sumber dipertahankan; nilai yang tidak tersedia ditampilkan sebagai kosong. Identitas Google Scholar diambil dari foto profil SINTA. ID Triyani yang pada arsip lama sama dengan Gumgum telah diperbaiki menjadi `572z_AIAAAAJ`, sesuai sumber.

Pemeriksaan langsung tambahan pada profil Mindra Jaya:
- Scopus: https://www.scopus.com/authid/detail.uri?authorId=57218102814 — identitas dan ringkasan profil terbaca; daftar dokumen penuh tidak tersedia pada pratinjau.
- Google Scholar: https://scholar.google.com/citations?user=6I4tsAwAAAAJ&hl=en — sebagian halaman publik terbaca.
- Web of Science: https://www.webofscience.com/wos/author/record/ABH-2005-2021 — respons publik hanya memuat kerangka profil, tidak cukup untuk memvalidasi bibliografi langsung.

Pemeriksaan langsung ini bukan bukti seluruh profil pada platform tersebut sudah diekspor. Dashboard secara eksplisit menyebut data indeks diperoleh melalui SINTA. Tidak ada klaim kelengkapan atau sinkronisasi langsung otomatis.

## Membangun ulang

Simpan respons markdown Firecrawl per halaman sebagai `{SINTA_ID}-{view}.json`, dengan view `scopus`, `wos`, `googlescholar`, `garuda`. Input memuat `markdown` dan metadata sumber. Gunakan snapshot JSON dari commit sebelum pembaruan sebagai baseline, bukan hasil build baru.

```sh
python3 scripts/publications/build-publications.py /path/to/responses /path/to/baseline.json
python3 scripts/publications/validate-publications.py
node --check assets/publications-refresh.js
node scripts/validate-obe-monev-2026.mjs
```

Respons mentah tidak dipublikasikan sebagai halaman website. Jejak sumber dan hasil normalisasi tersedia dalam `data/faculty_publications.json`.


Koreksi DTPS, 4 Oktober 2026: atas arahan pengelola, tahun 2022 dan Aceng Komarudin Mutaqin (bukan DTPS) dikeluarkan dari katalog aktif. Build kini memakai 16 dosen, periode 2023–2026, serta 64 halaman sumber. Publikasi bersama tetap dapat muncul hanya jika tercatat pada sumber dosen DTPS yang dipertahankan. Angka pada uraian sebelumnya merupakan riwayat perubahan, bukan angka katalog saat ini.


Audit identitas Mindra Jaya: seluruh 19 atribusi aktif diperiksa terhadap nama lengkap pada metadata Crossref, naskah penerbit, atau rekaman institusi. Bukti dicatat dalam `mindra-author-verification.json` dan ditampilkan pada Jejak sumber. Tidak ditemukan bukti salah identitas pada 19 entri aktif ini. Build memerlukan judul dan URL rekaman yang sudah ditinjau; atribusi baru tanpa bukti masuk `withheldAttributions` dan tidak dihitung untuk Mindra. Ini tidak menyatakan bahwa semua penulis bernama Jaya adalah Mindra, dan bukan audit identitas seluruh dosen.


Ringkasan topik dan pie chart: `topic-classification.json` memuat tinjauan judul untuk delapan topik utama. Kategori merupakan interpretasi editorial judul, bukan klasifikasi SINTA dan bukan analisis abstrak. Satu publikasi masuk satu topik, dengan bidang aplikasi didahulukan dari metodenya. Judul baru tanpa pemetaan masuk Perlu tinjauan. Grafik menghitung publikasi unik setelah filter dosen/tahun/indeks/pencarian; memilih legenda menyaring daftar artikel tanpa mengubah penyebut pie chart. Persentase = jumlah topik / seluruh publikasi sesuai filter × 100, ditampilkan satu desimal. Grafik kosong tidak menggambar pie. Profil dosen menyembunyikan chart karena metrik profil berbeda cakupan.

Dua duplikat akibat mojibake pada apostrof (judul kesejahteraan dan produksi minyak) digabung setelah perbaikan encoding. Total katalog menjadi 186. Varian judul berbeda substantif, misalnya PM2.5 versus PM5.5 pada dua sumber, tidak otomatis digabung tanpa bukti identitas rekaman yang cukup.
