(() => {
  const lecturer = document.getElementById('lecturer');
  const search = document.getElementById('search');
  const stage = document.getElementById('stage');
  const cards = [...document.querySelectorAll('.document-card')];
  const categories = [...document.querySelectorAll('[data-filter]')];
  let category = '';
  const normalize = value => value.normalize('NFKD').toLocaleLowerCase('id').replace(/\s+/g, ' ').trim();
  function filter() {
    const words = normalize(search.value).split(' ').filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const rows = [...card.querySelectorAll('[data-person]')];
      const nameMatch = !lecturer.value || rows.some(row => row.dataset.person === lecturer.value);
      const matches = nameMatch && (!category || card.dataset.category === category) && (!stage.value || card.dataset.stage === stage.value) && words.every(word => normalize(card.dataset.search).includes(word));
      card.hidden = !matches;
      if (matches) count++;
      rows.forEach(row => { row.hidden = !!lecturer.value && row.dataset.person !== lecturer.value; });
      card.querySelector('.assignments').open = !!lecturer.value && matches;
    });
    document.getElementById('result-count').textContent = `${count} dokumen ditampilkan${lecturer.value ? ' · ' + lecturer.value : ''}`;
    document.getElementById('empty').hidden = count !== 0;
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  categories.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    if (category !== 'undangan') stage.value = '';
    filter();
  }));
  lecturer.addEventListener('change', filter);
  search.addEventListener('input', filter);
  stage.addEventListener('change', () => { if (stage.value) category = 'undangan'; filter(); });
  document.getElementById('reset').addEventListener('click', () => { lecturer.value = ''; search.value = ''; stage.value = ''; category = ''; filter(); });
  document.querySelectorAll('.pdf-url').forEach(input => input.addEventListener('click', () => input.select()));
  let noticeTimer;
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
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
