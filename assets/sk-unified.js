(() => {
  const root = document.querySelector(".sk-unified");
  if (!root) return;
  const byId = id => root.querySelector("#" + id);
  const lecturer = byId('lecturer');
  const search = byId('search');
  const stage = byId('stage');
  const year = byId('academic-year');
  const semester = byId('semester');
  const cards = [...root.querySelectorAll('.document-card')];
  const categories = [...root.querySelectorAll('[data-filter]')];
  let category = 'akademik';
  const normalize = value => value.normalize('NFKD').toLocaleLowerCase('id').replace(/\s+/g, ' ').trim();
  function filter() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const rows = [...card.querySelectorAll('[data-person]')];
      const nameMatch = !lecturer.value || rows.some(row => row.dataset.person === lecturer.value);
      const matches = nameMatch && (!year.value || card.dataset.year === year.value) && (!semester.value || card.dataset.semester === semester.value) && (!category || (category === 'akademik' ? card.dataset.category !== 'pengelola' : card.dataset.category === category)) && (!stage.value || card.dataset.stage === stage.value) && words.every(word => normalize(card.dataset.search).includes(word));
      card.hidden = !matches;
      if (matches) count++;
      rows.forEach(row => { row.hidden = !!lecturer.value && row.dataset.person !== lecturer.value; });
      const assignments = card.querySelector('.assignments');
      if (assignments) assignments.open = !!lecturer.value && matches;
    });
    byId('result-count').textContent = `${count} dokumen ditampilkan${semester.value ? ' · '+semester.value : ''}${year.value ? ' '+year.value : ''}${lecturer.value ? ' · ' + lecturer.value : ''}`;
    byId('empty').hidden = count !== 0;
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  categories.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    if (category === "pengelola") { lecturer.value = ""; year.value = ""; semester.value = ""; }
    if (!['undangan', 'pengujian'].includes(category)) stage.value = '';
    filter();
  }));
  lecturer.addEventListener('change', () => { if (lecturer.value && category === 'pengelola') category = 'akademik'; filter(); });
  search.addEventListener('input', filter);
  stage.addEventListener('change', () => { if (stage.value && !['undangan','pengujian'].includes(category)) category = 'akademik'; filter(); });
  year.addEventListener('change', () => { if(category === 'pengelola') category='akademik'; filter(); });
  semester.addEventListener('change', () => { if(category === 'pengelola') category='akademik'; filter(); });
  byId('reset').addEventListener('click', () => { lecturer.value = ''; search.value = ''; stage.value = ''; year.value = ''; semester.value = ''; category = 'akademik'; filter(); });
  root.querySelectorAll('.pdf-url').forEach(input => input.addEventListener('click', () => input.select()));
  let noticeTimer;
  root.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const status = byId('copy-status');
    const field = button.closest('.document-card').querySelector('.pdf-url');
    let copied = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(button.dataset.copy);
      copied = true;
    } catch (_) {
      field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    }
    button.textContent = copied ? 'Link tersalin ✓' : 'Salin manual';
    status.textContent = copied ? 'Link PDF tersalin. Silakan tempel di kolom tautan dokumen.' : 'Pilih link yang disorot, lalu tekan Ctrl+C atau Command+C untuk menyalin.';
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { status.textContent = ''; }, 7000);
    setTimeout(() => { button.textContent = 'Salin Link'; }, 3500);
  }));
  filter();
})();
