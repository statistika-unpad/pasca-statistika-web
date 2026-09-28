(() => {
  const root = document.getElementById('buku-pedoman');
  if (!root) return;
  const search = root.querySelector('#handbook-search');
  const category = root.querySelector('#handbook-category');
  const cards = [...root.querySelectorAll('.handbook-card')];
  function filter() {
    const words = search.value.toLocaleLowerCase('id').trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const matches = (!category.value || card.dataset.category === category.value) && words.every(word => card.textContent.toLocaleLowerCase('id').split(/[^\p{L}\p{N}]+/u).some(token => token.startsWith(word)));
      card.hidden = !matches;
      if (matches) count++;
    }
    root.querySelector('#handbook-count').textContent = `${count} dari ${cards.length} panduan ditampilkan`;
    root.querySelector('#handbook-empty').hidden = count !== 0;
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  filter();
})();
