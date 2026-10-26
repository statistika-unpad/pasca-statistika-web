'use strict';
const query = document.getElementById('query');
const year = document.getElementById('year');
const results = document.getElementById('results');
const status = document.getElementById('status');
let publications = [];
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function sourceLink(url, label) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return element('span', label);
    const a = element('a', label);
    a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  } catch { return element('span', label); }
}
function render() {
  const term = query.value.trim().toLocaleLowerCase('id');
  const filtered = publications.filter(p => (!year.value || String(p.year) === year.value) &&
    [p.title, p.venue, p.doi, ...(p.lecturers || [])].join(' ').toLocaleLowerCase('id').includes(term));
  results.replaceChildren();
  status.textContent = `Menampilkan ${filtered.length} dari ${publications.length} publikasi.`;
  for (const p of filtered) {
    const card = element('article', '', 'publication');
    const title = element('h2'); title.append(sourceLink(p.href, p.title));
    card.append(title, element('p', `${p.year} · ${p.venue || ''}`, 'meta'),
      element('p', `Dosen: ${(p.lecturers || []).join(', ') || p.lecturer || 'Belum tercatat'}`),
      element('p', `Kategori pada data: ${p.category || 'Belum tercatat'}`, 'meta'));
    if (p.doi) card.append(sourceLink(`https://doi.org/${p.doi}`, `DOI: ${p.doi}`));
    const details = element('details'); details.append(element('summary', 'Lihat jejak sumber'));
    const list = element('ul');
    for (const e of p.evidence || []) {
      const item = element('li');
      item.append(sourceLink(e.url || e.recordUrl, `${e.source || 'Sumber'}${e.via ? ` melalui ${e.via}` : ''}`),
        document.createTextNode(` · Diperiksa: ${e.checkedAt || 'Belum tercatat'}`));
      list.append(item);
    }
    details.append(list.children.length ? list : element('p', 'Jejak sumber belum tersedia pada data ini.'));
    card.append(details); results.append(card);
  }
}
query.addEventListener('input', render); year.addEventListener('change', render);
fetch('data/faculty_publications.json').then(response => {
  if (!response.ok) throw new Error('Data tidak tersedia');
  return response.json();
}).then(data => {
  if (!Array.isArray(data.publications)) throw new Error('Format data tidak sesuai');
  publications = data.publications;
  document.getElementById('policy').textContent = `${data.inclusionPolicy || ''} Cakupan data masih parsial; kategori indeks mengikuti snapshot sumber, bukan pemeriksaan indeks terbaru.`;
  document.getElementById('snapshot').textContent = `Pembaruan katalog: ${data.catalogRevisedAt || data.generatedAt || 'Belum tercatat'}`;
  [...new Set(publications.map(p => p.year))].sort((a,b) => b-a).forEach(value => {
    const option = element('option', String(value)); option.value = value; year.append(option);
  });
  render();
}).catch(() => {
  document.getElementById('policy').textContent = 'Data publikasi belum dapat dimuat. Silakan muat ulang halaman.';
  status.textContent = 'Gagal memuat data publikasi.';
});
