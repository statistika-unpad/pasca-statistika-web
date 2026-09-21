/* Isolated enhancement: follows the site's language attribute without changing its router. */
(() => {
  'use strict';
  const root = document.querySelector('#obe26-dashboard');
  const data = window.OBE26_DATA;
  if (!root || !data) return;
  const mount = root.querySelector('[data-obe26-content]');
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const categories = [
    ['curriculum', '01', 'Kurikulum, Profil Lulusan & Standar', 'Curriculum, Graduate Profiles & Standards', 'Kurikulum'],
    ['outcomes', '02', 'CPL, CPMK, SubCPMK & PEO', 'CPL, CPMK, SubCPMK & PEO', 'CPL/CPMK'],
    ['learning', '03', 'RPS & Implementasi Pembelajaran OBE', 'RPS & Learning Implementation', 'RPS'],
    ['monitoring', '04', 'Monitoring Proses Pembelajaran', 'Learning Process Monitoring', 'PBM'],
    ['graduates', '05', 'Outcome & Tracer Lulusan', 'Graduate Outcomes & Tracer Studies', 'Lulusan'],
    ['portfolio', '06', 'Portofolio Mata Kuliah & Academic Evidence', 'Course Portfolios & Academic Evidence', 'Portofolio']
  ];
  const descriptions = {
    curriculum: ['Rujukan kurikulum, profil lulusan, dan standar akademik program studi.', 'Reference documents for curriculum, graduate profiles, and academic standards.'],
    outcomes: ['Dokumentasi pemetaan serta evaluasi capaian dan tujuan pendidikan.', 'Documentation of learning outcome mapping and educational objective evaluation.'],
    learning: ['Evidence perencanaan, pelaksanaan, dan pembaruan pembelajaran OBE.', 'Evidence of OBE learning design, implementation, and revision.'],
    monitoring: ['Dokumentasi pemantauan proses dan pelaksanaan perkuliahan.', 'Documentation of teaching processes and learning implementation monitoring.'],
    graduates: ['Laporan penelusuran, capaian, serta umpan balik mengenai lulusan.', 'Reports on graduate tracking, outcomes, and feedback.'],
    portfolio: ['Panduan dan dokumentasi evidence akademik pada level mata kuliah.', 'Guidance and documentation of academic evidence at course level.']
  };
  let lang = document.documentElement.lang === 'en' ? 'en' : 'id';
  const tr = (id, en) => lang === 'en' ? en : id;
  let query = '', filter = 'all', format = 'all', courseQuery = '', expanded = false;
  const normalize = value => value.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const courses = data.documents.filter(d => d.portfolio);
  const categoryName = key => categories.find(c => c[0] === key)[lang === 'en' ? 3 : 2];
  function actions(doc) {
    return `<div class="obe26-actions">${['html', 'pdf'].filter(f => doc[f]).map(f => `<a class="obe26-document-link obe26-${f}" href="${esc(doc[f])}" target="_blank" rel="noopener noreferrer" aria-label="${esc(`${f === 'html' ? tr('Lihat HTML', 'View HTML') : tr('Buka PDF', 'Open PDF')}: ${doc.title}`)}">${f === 'html' ? tr('Lihat HTML', 'View HTML') : tr('Buka PDF', 'Open PDF')} <span aria-hidden="true">↗</span></a>`).join('')}</div>`;
  }
  function badges(doc) {
    return `<span class="obe26-formats">${['html', 'pdf'].filter(f => doc[f]).map(f => `<span class="obe26-badge">${f.toUpperCase()}</span>`).join('')}</span>`;
  }
  function documentCard(doc) {
    return `<article class="obe26-evidence-card"><div class="obe26-card-meta"><span class="obe26-icon" aria-hidden="true">${categories.find(c => c[0] === doc.category)[1]}</span>${badges(doc)}</div><p class="obe26-eyebrow">${categoryName(doc.category)}</p><h4>${esc(doc.title)}</h4><p class="obe26-description">${descriptions[doc.category][lang === 'en' ? 1 : 0]}</p>${actions(doc)}</article>`;
  }
  function matches(doc) {
    const text = normalize(`${doc.title} ${doc.keywords} ${categoryName(doc.category)}`);
    const terms = normalize(query).split(' ').filter(Boolean);
    const categoryMatch = filter === 'all' || (filter === 'PEO' ? /\bPEO\b/.test(doc.keywords) : doc.category === filter);
    return categoryMatch && (format === 'all' || Boolean(doc[format])) && terms.every(word => text.includes(word));
  }
  function renderResults() {
    const results = data.documents.filter(matches);
    root.querySelector('#obe26-result-count').textContent = tr(`Menampilkan ${results.length} dari ${data.counts.logical} evidence`, `Showing ${results.length} of ${data.counts.logical} evidence`);
    root.querySelector('#obe26-results').innerHTML = results.length ? categories.map(([key]) => {
      const items = results.filter(d => d.category === key);
      if (!items.length) return '';
      return `<details class="obe26-result-group" ${query || filter !== 'all' || format !== 'all' ? 'open' : ''}><summary><span>${categoryName(key)}</span><span class="obe26-group-count">${items.length} <span aria-hidden="true">＋</span></span></summary><div class="obe26-result-list">${items.map(d => `<article class="obe26-result-row"><div><h4>${esc(d.title)}</h4>${badges(d)}</div>${actions(d)}</article>`).join('')}</div></details>`;
    }).join('') : `<p class="obe26-empty">${tr('Dokumen tidak ditemukan. Coba kata kunci lain.', 'No documents found. Try another keyword.')}</p>`;
    root.querySelectorAll('[data-obe26-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.obe26Filter === filter)));
  }
  function renderCourses() {
    const terms = normalize(courseQuery).split(' ').filter(Boolean);
    const found = courses.filter(d => terms.every(word => normalize(d.title).includes(word)));
    const visible = expanded || terms.length ? found : found.slice(0, 8);
    root.querySelector('#obe26-course-count').textContent = tr(`${visible.length} dari ${found.length} mata kuliah`, `${visible.length} of ${found.length} courses`);
    root.querySelector('#obe26-courses').innerHTML = visible.length ? visible.map(d => `<article class="obe26-portfolio-card"><div class="obe26-card-meta"><span class="obe26-course-index">${String(courses.indexOf(d) + 1).padStart(2, '0')}</span><span class="obe26-badge">Portofolio OBE</span></div><h4>${esc(d.title)}</h4>${actions(d)}</article>`).join('') : `<p class="obe26-empty">${tr('Mata kuliah tidak ditemukan. Coba kata kunci lain.', 'No courses found. Try another keyword.')}</p>`;
    const toggle = root.querySelector('#obe26-expand');
    toggle.hidden = Boolean(terms.length) || courses.length <= 8;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? tr('Tampilkan Lebih Sedikit', 'Show Fewer') : tr(`Lihat Semua ${courses.length} Portofolio`, `View All ${courses.length} Portfolios`);
  }
  function render() {
    root.querySelector('#obe26-title').textContent = tr('Monitoring dan Evaluasi OBE 2026', 'Monitoring & Evaluation OBE 2026');
    root.querySelector('#obe26-introduction').textContent = tr('Sistem bukti pelaksanaan, monitoring, evaluasi, dan perbaikan berkelanjutan Kurikulum Outcome-Based Education Program Studi S2 Statistika Terapan FMIPA Universitas Padjadjaran.', 'Evidence of implementation, monitoring, evaluation, and continuous improvement of the Outcome-Based Education curriculum at the Master of Applied Statistics, FMIPA, Universitas Padjadjaran.');
    document.querySelectorAll('[data-obe26-nav]').forEach(el => { el.textContent = tr('Monitoring & Evaluasi OBE 2026', 'Monitoring & Evaluation OBE 2026'); });
    const stats = [[data.counts.files, tr('Total Evidence', 'Total Evidence'), tr('file dalam repository', 'files in the repository')], [data.counts.reports, tr('Laporan & Panduan', 'Reports & Guides'), tr('file evidence utama', 'primary evidence files')], [data.counts.portfolios, tr('Portofolio Mata Kuliah', 'Course Portfolios'), tr('pasangan HTML + PDF', 'HTML + PDF pairs')], [['HTML', 'PDF'].filter(f => data.counts[f.toLowerCase()]).join(' + '), tr('Format Evidence', 'Evidence Formats'), tr('baca web atau dokumen', 'read online or as a document')]];
    const cycle = [['DESIGN', 'Perencanaan', 'Planning', 'CPL → CPMK → SubCPMK → RPS'], ['IMPLEMENT', 'Implementasi', 'Implementation', 'SCL • LIVE Unpad • Tugas • Asesmen'], ['MONITOR', 'Monitoring', 'Monitoring', 'PBM • Kehadiran • Dashboard Real-Time'], ['EVALUATE', 'Evaluasi', 'Evaluation', 'CPL • PEO • Tracer • Kepuasan Pengguna'], ['IMPROVE', 'Improvement', 'Improvement', 'Pembaruan RPS • AI • Kurikulum • CQI']];
    mount.innerHTML = `
      <div class="obe26-hero">
        <div class="obe26-hero-copy"><span class="obe26-year">Academic Year 2026/2027</span><h3>${tr('Monitoring & Evaluasi', 'Monitoring & Evaluation')}<span>OBE <em>2026</em></span></h3><p>${tr('Evidence-based monitoring untuk memastikan keselarasan CPL–CPMK–SubCPMK, implementasi pembelajaran, asesmen, ketercapaian lulusan, serta continuous quality improvement.', 'Evidence-based monitoring of CPL–CPMK–SubCPMK alignment, learning implementation, assessment, graduate outcomes, and continuous quality improvement.')}</p><div class="obe26-hero-actions"><button type="button" class="obe26-button obe26-button-gold" data-obe26-scroll="obe26-explorer">${tr('Jelajahi Evidence', 'Explore Evidence')} <span aria-hidden="true">↗</span></button><button type="button" class="obe26-button obe26-button-ghost" data-obe26-scroll="obe26-portfolio">${tr('Portofolio Mata Kuliah', 'Course Portfolios')} <span aria-hidden="true">↓</span></button></div></div>
        <div class="obe26-orbit" aria-hidden="true"><div class="obe26-orbit-ring"></div><span class="obe26-orbit-core">OBE<small>QUALITY CYCLE</small></span><span class="obe26-orbit-node obe26-node-top">CPL</span><span class="obe26-orbit-node obe26-node-right">CPMK</span><span class="obe26-orbit-node obe26-node-bottom">CQI</span><span class="obe26-orbit-node obe26-node-left">RPS</span></div>
        <div class="obe26-kpis">${stats.map(([number, label, note], i) => `<div class="obe26-kpi"><span class="obe26-kpi-label"><span aria-hidden="true">${['▦', '▤', '◈', '↗'][i]}</span> ${label}</span><strong class="${i === 3 ? 'obe26-format-number' : 'obe26-number'}">${number}</strong><small>${note}</small></div>`).join('')}</div>
      </div>
      <div class="obe26-block obe26-cycle-block"><div class="obe26-section-heading"><div><p class="obe26-eyebrow">CONTINUOUS QUALITY IMPROVEMENT</p><h3>${tr('Satu siklus, perbaikan berkelanjutan.', 'One cycle, continuous improvement.')}</h3></div><span class="obe26-cycle-return">↺ ${tr('Kembali ke perencanaan', 'Back to planning')}</span></div><ol class="obe26-cycle">${cycle.map(([label, id, en, note], i) => `<li class="obe26-cycle-step"><span class="obe26-cycle-number">0${i + 1}</span><span class="obe26-eyebrow">${label}</span><h4>${tr(id, en)}</h4><p>${note}</p></li>`).join('')}</ol></div>
      <div class="obe26-block"><div class="obe26-section-heading"><div><p class="obe26-eyebrow">FEATURED EVIDENCE</p><h3>${tr('Titik awal penelusuran mutu.', 'Start exploring quality evidence.')}</h3></div><span class="obe26-heading-note">${tr('Pilihan laporan utama', 'Selected key reports')}</span></div><div class="obe26-featured-grid">${data.documents.filter(d => d.featured).map(documentCard).join('')}</div></div>
      <div class="obe26-block"><div class="obe26-section-heading"><div><p class="obe26-eyebrow">${tr('PETA EVIDENCE', 'EVIDENCE MAP')}</p><h3>${tr('Temukan bukti sesuai kebutuhan.', 'Find the evidence you need.')}</h3></div></div><div class="obe26-category-grid">${categories.map(([key, index]) => `<button type="button" class="obe26-category" data-obe26-category="${key}"><span class="obe26-category-index">${index}</span><strong>${categoryName(key)}</strong><span>${data.documents.filter(d => d.category === key).length} ${tr('dokumen', 'documents')} <span aria-hidden="true">↗</span></span></button>`).join('')}</div></div>
      <div class="obe26-block obe26-explorer" id="obe26-explorer"><div class="obe26-section-heading"><div><p class="obe26-eyebrow">${tr('KATALOG TERINTEGRASI', 'INTEGRATED CATALOGUE')}</p><h3>OBE Evidence Explorer</h3><p>${tr('Satu entri per dokumen. Pilih versi HTML atau PDF yang tersedia.', 'One entry per document. Choose the available HTML or PDF version.')}</p></div><span class="obe26-badge">${data.counts.logical} ${tr('dokumen', 'documents')} · ${data.counts.files} ${tr('file', 'files')}</span></div>
      <div class="obe26-toolbar"><div class="obe26-search-field"><label for="obe26-search">${tr('Cari evidence', 'Search evidence')}</label><input id="obe26-search" type="search" placeholder="${tr('Cari laporan, CPL, RPS, tracer, portofolio...', 'Search reports, CPL, RPS, tracer, portfolios...')}" value="${esc(query)}" aria-controls="obe26-results"></div><div class="obe26-format-field"><label for="obe26-format">${tr('Format dokumen', 'Document format')}</label><select id="obe26-format"><option value="all">${tr('Semua format', 'All formats')}</option><option value="html">HTML</option><option value="pdf">PDF</option></select></div></div>
      <div class="obe26-filters" role="group" aria-label="${tr('Filter kategori evidence', 'Evidence category filters')}">${[['all', tr('Semua', 'All')], ['curriculum', tr('Kurikulum', 'Curriculum')], ['outcomes', 'CPL/CPMK'], ['PEO', 'PEO'], ['learning', 'RPS'], ['monitoring', 'PBM'], ['graduates', tr('Lulusan', 'Graduate Outcomes')], ['portfolio', tr('Portofolio', 'Course Portfolios')]].map(([key, label]) => `<button type="button" class="obe26-filter" data-obe26-filter="${key}" aria-pressed="false">${label}</button>`).join('')}</div><div class="obe26-results-toolbar"><p id="obe26-result-count" role="status" aria-live="polite"></p><button type="button" class="obe26-reset" data-obe26-reset>${tr('Reset Filter', 'Reset Filters')}</button></div><div id="obe26-results"></div></div>
      <div class="obe26-block obe26-portfolio" id="obe26-portfolio"><div class="obe26-section-heading"><div><p class="obe26-eyebrow">COURSE-LEVEL EVIDENCE</p><h3>${tr(`Portofolio ${courses.length} Mata Kuliah`, `${courses.length} Course Portfolios`)}</h3><p>${tr('Evidence implementasi OBE pada level mata kuliah: RPS, rancangan tugas, rubrik, asesmen, contoh hasil belajar, dan evaluasi CPL.', 'Evidence of OBE implementation at course level: syllabi, assignments, rubrics, assessment, learning examples, and CPL evaluation.')}</p></div><span class="obe26-portfolio-seal" aria-hidden="true">${courses.length}<small>HTML + PDF</small></span></div><div class="obe26-course-toolbar"><div class="obe26-search-field"><label for="obe26-course-search">${tr('Cari mata kuliah', 'Search courses')}</label><input type="search" id="obe26-course-search" placeholder="${tr('Ketik nama mata kuliah...', 'Enter a course name...')}" value="${esc(courseQuery)}" aria-controls="obe26-courses"></div><p id="obe26-course-count" role="status" aria-live="polite"></p></div><div class="obe26-portfolio-grid" id="obe26-courses"></div><button type="button" class="obe26-button obe26-expand" id="obe26-expand" aria-controls="obe26-courses" aria-expanded="false"></button></div>
      <div class="obe26-block obe26-history"><p class="obe26-eyebrow">${tr('ARSIP & KEBERLANJUTAN', 'ARCHIVE & CONTINUITY')}</p><h3>${tr('Riwayat Monitoring dan Evaluasi', 'Monitoring & Evaluation History')}</h3><ol class="obe26-timeline"><li><span class="obe26-timeline-year">2025</span><div><span class="obe26-badge">${tr('Arsip', 'Archive')}</span>${data.archive.map(a => `<h4>${esc(a.title)}</h4>${actions(a)}`).join('')}</div></li><li class="obe26-current"><span class="obe26-timeline-year">2026</span><div><span class="obe26-badge">${tr('Siklus aktif', 'Current cycle')}</span><h4>${tr('Monev OBE 2026 — S2 Statistika Terapan', 'OBE Monitoring 2026 — Master of Applied Statistics')}</h4><p>${data.counts.files} ${tr('file evidence', 'evidence files')} · ${data.counts.logical} ${tr('dokumen', 'documents')} · ${courses.length} ${tr('mata kuliah', 'courses')}</p><button type="button" class="obe26-reset" data-obe26-scroll="obe26-explorer">${tr('Telusuri evidence 2026', 'Explore 2026 evidence')} ↑</button></div></li></ol></div>`;
    root.querySelector('#obe26-format').value = format;
    renderResults();
    renderCourses();
  }
  function scrollTo(id) {
    const target = root.querySelector(`#${id}`);
    if (!target) return;
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    const panel = root.closest('.active-panel');
    if (panel && panel.scrollHeight > panel.clientHeight) {
      // The host uses a scrollable workspace; keep its sticky menu in place.
      const top = panel.scrollTop + target.getBoundingClientRect().top - panel.getBoundingClientRect().top - 14;
      panel.scrollTo({ top: Math.max(0, top), behavior });
    } else target.scrollIntoView({ behavior, block: 'start' });
  }
  root.addEventListener('input', event => {
    if (event.target.id === 'obe26-search') { query = event.target.value; renderResults(); }
    if (event.target.id === 'obe26-course-search') { courseQuery = event.target.value; renderCourses(); }
  });
  root.addEventListener('change', event => {
    if (event.target.id === 'obe26-format') { format = event.target.value; renderResults(); }
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-obe26-filter')) { filter = button.dataset.obe26Filter; renderResults(); }
    if (button.hasAttribute('data-obe26-category')) {
      filter = button.dataset.obe26Category; query = ''; format = 'all';
      root.querySelector('#obe26-search').value = ''; root.querySelector('#obe26-format').value = 'all';
      renderResults(); scrollTo('obe26-explorer'); root.querySelector('#obe26-search').focus({ preventScroll: true });
    }
    if (button.hasAttribute('data-obe26-reset')) {
      query = ''; filter = 'all'; format = 'all';
      root.querySelector('#obe26-search').value = ''; root.querySelector('#obe26-format').value = 'all'; renderResults();
    }
    if (button.dataset.obe26Scroll) scrollTo(button.dataset.obe26Scroll);
    if (button.id === 'obe26-expand') { expanded = !expanded; renderCourses(); if (!expanded) scrollTo('obe26-portfolio'); }
  });
  render();
  new MutationObserver(() => {
    const next = document.documentElement.lang === 'en' ? 'en' : 'id';
    if (next !== lang) { lang = next; render(); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
