# Grafik kolaborasi publikasi

Komponen React/Recharts dibundel lokal, tanpa CDN dan tanpa permintaan data tambahan. Dataset berasal dari `data/collaborative_publications.json`, melalui state filter katalog yang sama. Jangan mengubah bibliografi atau bukti sumber ketika memperbarui grafik.

Build:

```sh
cd scripts/collaborative-charts
npm ci
npm run build
```

`assets/collaborative-charts.bundle.js` adalah artefak build yang dipublikasikan GitHub Pages. `charts.jsx` merupakan source yang diedit.

Definisi:
- Publikasi dihitung unik berdasarkan baris katalog yang sudah dideduplikasi.
- Satu `topicId` per publikasi; pemetaan berdasarkan penelaahan judul, bukan klasifikasi resmi indeks. Metadata `topicClassification` mencatat definisinya.
- Semua grafik menerima hasil filter dosen, mahasiswa, tahun, jenis, sumber, topik, dan pencarian yang sama.
- Tren menampilkan tahun terpilih, bukan menempatkan tahun yang dikeluarkan sebagai nol. Tahun 2026 masih berjalan dan tidak diekstrapolasi.
- Kontribusi dosen saling tumpang tindih; jangan dijumlahkan sebagai total publikasi.
- Pasangan unik memakai kombinasi nama dosen–mahasiswa pada setiap karya, lalu dideduplikasi lintas karya.
- Ukuran tim hanya mencakup penulis dosen/mahasiswa yang dipetakan dalam katalog; bukan seluruh coauthor artikel.
- Semua grafik memiliki tabel angka aksesibel. Legenda topik dan peringkat dosen memakai tombol keyboard-accessible; tahun/topik juga dapat dipilih melalui panel filter.
