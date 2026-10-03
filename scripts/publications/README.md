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
