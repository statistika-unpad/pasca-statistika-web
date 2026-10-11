(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {faculty: new Set(), students: new Set(), year: new Set(), type: new Set()};
  let rows = [], visible = [];
  const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id').trim();
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const unique = (items, key) => [...new Set(items.flatMap(r => r[key]))];
  const selected = (key, values) => !state[key].size || values.some(v => state[key].has(String(v)));
  const label = name => name.replace(/^(Prof\.\s*)?(Dr\.\s*)?/, '').replace(/,.*$/, '');
  function setupPeople(key, container) {
    const names = unique(rows, key).sort((a,b) => label(a).localeCompare(label(b),'id'));
    $(container).innerHTML = names.map((name,i) => `<label class="choice"><input type="checkbox" data-key="${key}" value="${escape(name)}"><span>${escape(name)}</span><small>${rows.filter(r=>r[key].includes(name)).length}</small></label>`).join('');
    $(container).addEventListener('change', e => {const input=e.target;if(input.type!=='checkbox')return;input.checked?state[key].add(input.value):state[key].delete(input.value);render();});
  }
  function setupPills(key, container) {
    const values = [...new Set(rows.map(r=>String(r[key])))].sort(key==='year'?(a,b)=>b-a:(a,b)=>a.localeCompare(b,'id'));
    $(container).innerHTML = `<button type="button" data-value="" aria-pressed="true">Semua</button>`+values.map(v=>`<button type="button" data-value="${escape(v)}" aria-pressed="false">${escape(v)}</button>`).join('');
    $(container).addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=b.dataset.value;if(!v)state[key].clear();else state[key].has(v)?state[key].delete(v):state[key].add(v);render();});
  }
  function authorButtons(r,key){return r[key].map(n=>`<button type="button" class="${key==='students'?'student':''}" data-person="${escape(n)}" data-key="${key}" title="Tampilkan publikasi ${escape(n)}">${escape(label(n))}</button>`).join('');}
  function render() {
    const q=normalize($('query').value);
    visible=rows.filter(r=>selected('faculty',r.faculty)&&selected('students',r.students)&&selected('year',[r.year])&&selected('type',[r.type])&&normalize([r.title,...r.faculty,...r.students,r.venue,r.doi,r.year].join(' ')).includes(q));
    visible.sort($('sort').value==='title'?(a,b)=>a.title.localeCompare(b.title,'id'):(a,b)=>($('sort').value==='old'?a.year-b.year:b.year-a.year)||a.title.localeCompare(b.title,'id'));
    $('total').textContent=visible.length;$('facultyTotal').textContent=unique(visible,'faculty').length;$('studentTotal').textContent=unique(visible,'students').length;
    const years=visible.map(r=>r.year);$('yearSpan').textContent=years.length?(Math.min(...years)===Math.max(...years)?years[0]:`${Math.min(...years)}–${Math.max(...years)}`):'—';
    $('resultCount').textContent=`${visible.length} dari ${rows.length} publikasi · sesuai filter aktif`;
    for(const [key,container] of [['faculty','facultyChoices'],['students','studentChoices']])$(container).querySelectorAll('input').forEach(i=>i.checked=state[key].has(i.value));
    $('facultySelected').textContent=state.faculty.size?`(${state.faculty.size} dipilih)`:'';$('studentSelected').textContent=state.students.size?`(${state.students.size} dipilih)`:'';
    for(const [key,container] of [['year','yearChoices'],['type','typeChoices']])$(container).querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value?state[key].has(b.dataset.value):!state[key].size)));
    $('activeFilters').innerHTML=Object.entries(state).flatMap(([key,values])=>[...values].map(v=>`<button type="button" data-key="${key}" data-value="${escape(v)}" aria-label="Hapus filter ${escape(v)}">${escape(key==='faculty'||key==='students'?label(v):v)} ×</button>`)).join('');
    $('empty').hidden=visible.length>0;$('export').disabled=!visible.length;
    $('cards').innerHTML=visible.map(r=>`<article class="publication" id="${escape(r.id)}"><div class="pub-meta"><span class="year">${r.year}</span><span class="kind">${escape(r.type)}</span>${r.sinta?`<span class="index-badge">SINTA ${escape(r.sinta.replace(/^SINTA\s*/i,''))}</span>`:''}${r.scopus?`<span class="index-badge">Scopus ${escape(r.scopus)}</span>`:''}</div><h3>${escape(r.title)}</h3><p class="venue">${escape(r.venue)}</p><div class="authors"><div><span class="author-label">Dosen</span><div class="author-buttons">${authorButtons(r,'faculty')}</div></div><div><span class="author-label">Mahasiswa</span><div class="author-buttons">${authorButtons(r,'students')}</div></div></div><div class="pub-bottom"><span class="doi">${r.doi?`DOI: ${escape(r.doi)}`:'DOI: belum tercatat'}${!r.sinta&&!r.scopus?'<br>Indeksasi: belum tercatat':''}</span><a class="pub-link" href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${r.linkKind==='venue'?'Buka laman jurnal/prosiding':'Buka publikasi'} ↗</a></div></article>`).join('');
  }
  function reset(){Object.values(state).forEach(s=>s.clear());$('query').value='';$('sort').value='new';for(const id of ['facultySearch','studentSearch']){$(id).value='';$(id).dispatchEvent(new Event('input'));}render();}
  function exportCSV(){
    const fields=['Judul','Tahun','Jenis','Dosen','Mahasiswa','Jurnal / Penerbit','SINTA','Scopus','DOI','Tautan','Jenis tautan'];
    const csv=[fields,...visible.map(r=>[r.title,r.year,r.type,r.faculty.join('; '),r.students.join('; '),r.venue,r.sinta||'',r.scopus||'',r.doi||'',r.url,r.linkKind==='venue'?'Laman jurnal/prosiding':'Publikasi'])].map(r=>r.map(v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='publikasi-bersama-hasil-filter.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function init(){try{
    const response=await fetch('../data/collaborative_publications.json');if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();rows=data.publications;
    if(!Array.isArray(rows)||!rows.length)throw Error('Data tidak tersedia');
    rows.forEach(r=>{const u=new URL(r.url);if(!['https:','http:'].includes(u.protocol))throw Error('Tautan tidak valid');});
    setupPeople('faculty','facultyChoices');setupPeople('students','studentChoices');setupPills('year','yearChoices');setupPills('type','typeChoices');
    for(const [input,container] of [['facultySearch','facultyChoices'],['studentSearch','studentChoices']])$(input).addEventListener('input',()=>$(container).querySelectorAll('.choice').forEach(c=>c.hidden=!normalize(c.textContent).includes(normalize($(input).value))));
    $('query').addEventListener('input',render);$('sort').addEventListener('change',render);$('reset').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);$('export').addEventListener('click',exportCSV);
    $('activeFilters').addEventListener('click',e=>{const b=e.target.closest('button');if(b){state[b.dataset.key].delete(b.dataset.value);render();}});
    $('cards').addEventListener('click',e=>{const b=e.target.closest('button[data-person]');if(!b)return;state[b.dataset.key].clear();state[b.dataset.key].add(b.dataset.person);render();$('catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('query').focus({preventScroll:true});});
    $('loadState').hidden=true;$('dashboard').hidden=false;render();
  }catch(e){$('loadState').className='load-error';$('loadState').textContent='Data publikasi belum dapat dimuat. Silakan muat ulang halaman atau buka arsip PDF.';const a=document.createElement('a');a.href='laporan-kolaborasi-dosen-mahasiswa.pdf';a.textContent=' Buka arsip PDF';$('loadState').append(a);console.error(e);}}
  init();
})();
