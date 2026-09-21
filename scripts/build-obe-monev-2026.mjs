import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const source = '@OBE 2026';
export function scan(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const name = `${dir}/${entry.name}`;
    return entry.isDirectory() ? scan(name) : [name];
  }).sort();
}
export const encodePath = value => value.split('/').map(encodeURIComponent).join('/');

// Explicit editorial metadata; names and formats are always discovered from the repository.
// PEO is the same report (confirmed by the PDF title and printed HTML source).
// Copy suffixes and TTD_PRINT are export variants, not separate reports.
const metadata = [
  ['Buku Panduan Akademik', 'Buku Panduan Akademik 2026/2027', 'curriculum'],
  ['Buku_Panduan_Penyusunan_Portofolio', 'Panduan Penyusunan Portofolio Mata Kuliah', 'portfolio'],
  ['Laporan_Analisis_Survei_PEO', 'Analisis Survei PEO 2026', 'outcomes', 'PEO', true],
  ['Laporan_100_Persen_OBE_SCL', 'Implementasi 100% OBE–SCL', 'learning', 'RPS SCL', true],
  ['Laporan_100_Persen_RPS', '100% RPS & Kontrak Pembelajaran LIVE Unpad', 'learning', 'RPS LIVE', true],
  ['Laporan_Berita_Acara', 'Berita Acara Perkuliahan 2022–2026', 'monitoring', 'PBM'],
  ['Laporan_Cakupan_Portofolio', 'Cakupan Portofolio Mata Kuliah', 'portfolio', '', true],
  ['Laporan_Evaluasi_CPL', 'Evaluasi CPL & Kompetensi Lulusan', 'outcomes', 'CPL CPMK', true],
  ['Laporan_Evaluasi_Pembaruan_RPS', 'Evaluasi & Pembaruan RPS: Project dan AI', 'learning', 'RPS CQI AI'],
  ['Laporan_Gabungan_RPS', 'Pemenuhan RPS Kurikulum 2023 & 2025', 'learning', 'RPS'],
  ['Laporan_Indeks_Prestasi', 'Indeks Prestasi Lulusan 2022–2024', 'graduates', 'IPK'],
  ['Laporan_Kepuasan_Pengguna', 'Kepuasan Pengguna Lulusan 2025–2026', 'graduates'],
  ['Laporan_Kesesuaian_Kurikulum', 'Kesesuaian Kurikulum OBE dengan FORSTAT', 'curriculum'],
  ['Laporan_Kesesuaian_OBE', 'Kesesuaian OBE–FORSTAT dengan Lampiran SK', 'curriculum'],
  ['Laporan_Ketepatan_Waktu', 'Ketepatan Waktu Kelulusan 2022–2024', 'graduates'],
  ['Laporan_Komprehensif_Tracer', 'Tracer Study Komprehensif 2024–2026', 'graduates', 'tracer'],
  ['Laporan_Lengkap_Integrasi', 'Integrasi Penelitian & PkM DTPS', 'portfolio', 'penelitian pengabdian academic evidence'],
  ['Laporan_Monitoring_Real_Time', 'Monitoring Real-Time OBE & Evaluasi PBM', 'monitoring', 'PBM', true],
  ['Laporan_Pemenuhan_Kriteria_Profil_Lulusan_KKNI', 'Profil Lulusan: KKNI & FORSTAT', 'curriculum'],
  ['Laporan_Pemenuhan_Kriteria_Profil_Lulusan_dengan', 'Profil Lulusan dengan Lampiran FORSTAT', 'curriculum'],
  ['Laporan_Pemetaan_CPL', 'Pemetaan CPL–CPMK–SubCPMK & Evaluasi Berkala', 'outcomes', 'CPL CPMK SubCPMK RPS', true],
  ['Laporan_Pengakuan_Apresiasi', 'Pengakuan & Apresiasi Kompetensi Lulusan 2024–2026', 'graduates'],
  ['Laporan_Rekap_Kehadiran', 'Rekap Kehadiran Dosen 2022–2026', 'monitoring', 'PBM'],
  ['Laporan_Tracer_Study', 'Tracer Study & Graduate User Survey 2026', 'graduates', 'tracer', true],
  ['Updated3-Draft-SK', 'Draft SK CPL dan Kurikulum Minimal S2 Statistika', 'curriculum', 'CPL SK']
];
export function buildData() {
  const files = scan(source);
  const groups = new Map();
  for (const file of files) {
    const format = path.extname(file).slice(1).toLowerCase();
    if (!['html', 'pdf'].includes(format)) throw Error(`Unmapped format: ${file}`);
    const portfolio = path.dirname(file) !== source;
    const stem = path.basename(file, path.extname(file));
    const match = portfolio ? null : metadata.find(([prefix]) => stem.startsWith(prefix) || (prefix === 'Laporan_Analisis_Survei_PEO' && stem.startsWith('Laporan Formal Analisis Survei PEO')));
    if (!portfolio && !match) throw Error(`Add metadata for ${file}`);
    const key = portfolio ? `course:${stem}` : match[0];
    if (!groups.has(key)) {
      const title = portfolio ? stem.replace(/^Portofolio_/, '').replaceAll('_', ' ') : match[1];
      const category = portfolio ? 'portfolio' : match[2];
      groups.set(key, { id: key, title, category, html: null, pdf: null, keywords: portfolio ? 'portofolio mata kuliah RPS asesmen CPL' : `${match[3] || ''} ${stem.replaceAll('_', ' ')}`, featured: Boolean(match?.[4]), portfolio });
    }
    const doc = groups.get(key);
    if (doc[format]) throw Error(`Ambiguous ${format} pair: ${file}`);
    doc[format] = encodePath(file);
  }
  const documents = [...groups.values()].sort((a, b) => a.title.localeCompare(b.title, 'id'));
  const portfolios = documents.filter(d => d.portfolio);
  for (const d of portfolios) if (!d.html || !d.pdf) throw Error(`Incomplete portfolio: ${d.title}`);
  return { source, counts: { files: files.length, html: files.filter(f => f.endsWith('.html')).length, pdf: files.filter(f => f.endsWith('.pdf')).length, reports: files.filter(f => path.dirname(f) === source).length, portfolios: portfolios.length, logical: documents.length, pairs: documents.filter(d => d.html && d.pdf).length }, documents,
    archive: scan('@Monev Kurikulum OBE').filter(f => /\.pdf$/i.test(f)).map(f => ({ title: 'Monev OBE 2025 — Fakultas MIPA', pdf: encodePath(f) })) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = buildData();
  fs.writeFileSync(path.join(root, 'assets/obe-monev-2026-data.js'), `// Generated by scripts/build-obe-monev-2026.mjs. Do not edit manually.\nwindow.OBE26_DATA = ${JSON.stringify(data, null, 2)};\n`);
  console.log(JSON.stringify(data.counts, null, 2));
}
