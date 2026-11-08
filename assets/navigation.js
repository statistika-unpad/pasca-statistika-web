/* Progressive enhancement: every link remains usable without this script. */
(() => {
  const root = document.getElementById('program-workspace');
  const input = document.getElementById('portal-menu-search');
  if (!root || !input) return;
  const status = document.getElementById('portal-search-status');
  const expand = document.getElementById('portal-expand-menus');
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const menu = () => root.querySelector(root.dataset.program === 's3' ? '.workspace-menu-s3' : '.workspace-menu-s2');
  const aliases = {pmb:'pendaftaran penerimaan calon mahasiswa admissions',lulusan:'tesis abstrak alumni thesis graduates', 'pusat-survei':'survey survei kepuasan tracer evaluasi', 'penjaminan-mutu':'ami rtm rtl mutu audit quality',lamsama:'akreditasi accreditation','dokumen-sk':'surat keputusan dokumen sk',pkm:'pengabdian masyarakat'};
  let previousProgram = root.dataset.program;
  let savedOpen = null;
  function updateExpandLabel() {
    const groups = [...menu().querySelectorAll('.portal-menu-group:not([hidden])')];
    expand.textContent = groups.every(group => group.open) ? 'Tutup semua kelompok' : 'Buka semua kelompok';
  }
  function filter() {
    const query = normalize(input.value.trim());
    const groups = [...menu().querySelectorAll('.portal-menu-group')];
    if (query && !savedOpen) savedOpen = new Map(groups.map(group => [group,group.open]));
    let count = 0;
    groups.forEach(group => {
      let matches = 0;
      group.querySelectorAll('a').forEach(link => {
        const words = normalize(link.textContent+' '+(aliases[link.dataset.workspaceTarget] || '')+' '+group.querySelector('summary').textContent);
        const show = query.split(/\s+/).every(word => words.includes(word));
        link.hidden = !show;
        if (show) { matches++; count++; }
      });
      group.hidden = matches === 0;
      if (query && matches) group.open = true;
      if (!query && savedOpen?.has(group)) group.open = savedOpen.get(group);
    });
    if (!query) savedOpen = null;
    status.textContent = query ? (count ? `${count} menu ditemukan. Pilih hasil di bawah.` : 'Menu tidak ditemukan. Coba kata lain atau ganti program S2/S3.') : 'Pilih kelompok menu di bawah.';
    updateExpandLabel();
  }
  function sync() {
    if (previousProgram !== root.dataset.program) {
      input.value = ''; savedOpen = null; previousProgram = root.dataset.program;
      root.querySelectorAll('.portal-menu-group').forEach(group => group.open = false);
    }
    filter();
    menu().querySelectorAll('a[aria-current="page"]').forEach(link => { link.closest('details').open = true; });
    updateExpandLabel();
  }
  root.querySelectorAll('.portal-menu-group').forEach(group => {
    group.open = false;
    group.addEventListener('toggle',updateExpandLabel);
  });
  input.addEventListener('input',filter);
  document.getElementById('portal-search-clear').addEventListener('click',()=>{input.value='';filter();input.focus();});
  expand.addEventListener('click',()=>{
    const groups = [...menu().querySelectorAll('.portal-menu-group:not([hidden])')];
    const open = !groups.every(group=>group.open);
    groups.forEach(group=>group.open=open);updateExpandLabel();
  });
  const mobileToggle = root.querySelector('.portal-nav-mobile');
  function mobileMenu(open) { root.classList.toggle('portal-mobile-closed',!open); mobileToggle.setAttribute('aria-expanded',String(open)); mobileToggle.querySelector('span').textContent=open?'−':'+'; }
  mobileToggle.addEventListener('click',()=>mobileMenu(mobileToggle.getAttribute('aria-expanded')!=='true'));
  mobileMenu(false);
  window.addEventListener('hashchange',()=>{
    const restoreFocus = matchMedia('(max-width:900px)').matches && root.querySelector('.workspace-sidebar')?.contains(document.activeElement);
    mobileMenu(false);
    if (restoreFocus) mobileToggle.focus({preventScroll:true});
    setTimeout(sync,0);
  });
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-program']});
  const dock = document.querySelector('.contact-action-dock');
  const toggle = document.querySelector('.portal-contact-toggle');
  const links = document.getElementById('portal-contact-links');
  function contact(open) { links.hidden=!open;toggle.setAttribute('aria-expanded',String(open));dock.classList.toggle('portal-contact-compact',!open);toggle.querySelector('span').textContent=open?'−':'+'; }
  toggle.addEventListener('click',()=>contact(toggle.getAttribute('aria-expanded')!=='true'));
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'){contact(false);toggle.focus();}});
  contact(false);
  sync();
})();
