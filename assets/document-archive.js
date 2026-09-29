(() => {
  document.querySelectorAll('[data-document-archive]').forEach(root => {
    const search = root.querySelector('[data-archive-search]');
    const year = root.querySelector('[data-archive-year]');
    const person = root.querySelector('[data-archive-person]');
    const cards = [...root.querySelectorAll('.archive-card')];
    const normalize = s => s.toLocaleLowerCase('id').normalize('NFKD');
    function filter() {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      let count = 0;
      cards.forEach(card => {
        const people = [...card.querySelectorAll('[data-person]')];
        card.hidden = !((!year.value || year.value === card.dataset.year) && (!person.value || people.some(p => p.dataset.person === person.value)) && words.every(w => normalize(card.dataset.search).includes(w)));
        if (!card.hidden) count++;
        people.forEach(p => { p.hidden = !!person.value && p.dataset.person !== person.value; });
        card.querySelector('details').open = !!person.value && !card.hidden;
      });
      root.querySelector('[data-archive-count]').textContent = `${count} dari ${cards.length} dokumen ditampilkan`;
      root.querySelector('[data-archive-empty]').hidden = count !== 0;
    }
    search.addEventListener('input', filter);
    [year, person].forEach(el => el.addEventListener('change', filter));
    root.querySelector('[data-archive-reset]').addEventListener('click', () => { search.value = year.value = person.value = ''; filter(); });
    filter();
  });
})();
