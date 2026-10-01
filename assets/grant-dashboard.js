import { sum, filterGrants, groupGrants } from './grant-dashboard-math.mjs';
const root = document.getElementById('grantDashboard');
if (root) start();
async function start() {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rupiah = v => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(v);
  const juta = v => new Intl.NumberFormat('id-ID', { maximumFractionDigits:3 }).format(v/1e6);
  const colors = {2023:'#174d6d',2024:'#138579',2025:'#b48021',2026:'#8061a8'};
  try {
    const response = await fetch('data/research_grants.json?v=20261001-dashboard');
    if (!response.ok) throw new Error('Data belum tersedia');
    const data = await response.json();
    const all = data.grants;
    const schemeNames = new Map(all.map(r => [r.schemeCode, r.scheme]));
    $('gdYear').innerHTML += [2026,2025,2024,2023].map(y => `<option>${y}</option>`).join('');
    $('gdScheme').innerHTML += [...schemeNames].sort().map(([v,n]) => `<option value="${esc(v)}">${esc(n)}</option>`).join('');
    $('gdPerson').innerHTML += data.lecturers.slice().sort().map(n => `<option>${esc(n)}</option>`).join('');
    $('gdLegend').innerHTML = Object.entries(colors).map(([y,c]) => `<span><i style="background:${c}"></i>${y}${y==='2026'?' (berjalan)':''}</span>`).join('');
    $('gdNotes').innerHTML = `<p>${esc(data.metricDefinition)}</p><p>${esc(data.coverageNote)}</p><p>${esc(data.lecturerAttribution)}</p><p>Hibah pengabdian Rp7.000.000 ditampilkan terpisah dari penelitian dan publikasi pada kartu ringkasan. Pilihan Semua kelompok mencakup keduanya. Salinan PDF dan laporan akhir tidak menambah jumlah atau nilai kontrak.</p><ul>${all.flatMap(r => r.notes.map(n => `<li><strong>${esc(r.researcher)} · ${r.year} · ${esc(r.schemeCode)}:</strong> ${esc(n)} <a href="${esc(r.documentHref)}#page=${r.amountPage}" target="_blank" rel="noopener">Lihat sumber ↗</a></li>`)).join('')}</ul><p><a href="data/research-grant-import-audit.json">Audit 46 PDF awal</a> · <a href="data/research-grant-update-20261001.json">Audit 12 PDF tambahan</a> · <a href="data/research_grants.json">Data & sumber perhitungan</a></p>`;
    $('gdPending').innerHTML = data.pending.map(r => `<p><strong>${esc(r.researcher)} · ${r.year}</strong><br>${esc(r.title)}<br>Nilai catatan lama: ${rupiah(r.reportedAmount)} · kontrak belum ditemukan.</p>`).join('');
    const history = document.createElement('details');
    history.className='gd-method';
    history.innerHTML=`<summary>Arsip sebelum 2023 · tidak masuk statistik</summary>${(data.historical||[]).map(r=>`<p><strong>${esc(r.researcher)} · ${r.year} · ${esc(r.scheme)}</strong><br>${esc(r.title)}<br>${rupiah(r.amount)} · ${esc(r.note)}<br><a href="${esc(r.documentHref)}#page=${r.amountPage}" target="_blank" rel="noopener">Buka kontrak arsip ↗</a></p>`).join('')}`;
    $('gdPending').parentElement.after(history);
    let visible = all;
    function bars(groups, stacked = false) {
      if (!groups.length) return '<p class="gd-empty">Tidak ada kontrak untuk pilihan ini.</p>';
      const max = Math.max(...groups.map(g => g.amount));
      return `<div class="gd-bars">${groups.map(g => {
        const segments = stacked ? [2023,2024,2025,2026].map(y => ({year:y,amount:sum(g.rows.filter(r => r.year === y))})).filter(s => s.amount > 0) : [{amount:g.amount,year:null}];
        return `<div class="gd-bar-row"><div class="gd-bar-label">${esc(g.label)} <small>${g.count} kontrak</small></div><div class="gd-track" role="img" aria-label="${esc(g.label)}: ${rupiah(g.amount)}"><div class="gd-bar-fill" style="width:${100*g.amount/max}%">${segments.map(s => `<span style="width:${100*s.amount/g.amount}%;background:${s.year?colors[s.year]:'#138579'}" title="${s.year||g.label}: ${rupiah(s.amount)}"></span>`).join('')}</div></div><strong>${juta(g.amount)} <small>jt</small></strong></div>`;
      }).join('')}<p class="gd-scale">Skala batang: 0–${juta(max)} juta rupiah.</p></div>`;
    }
    function yearChart(rows) {
      const years = $('gdYear').value ? [Number($('gdYear').value)] : [2023,2024,2025,2026];
      const vals = years.map(y => ({year:y, amount:sum(rows.filter(r => r.year===y)),count:rows.filter(r=>r.year===y).length}));
      const max = Math.max(...vals.map(v=>v.amount),1); const ceiling=Math.max(1000000,Math.ceil(max/100000000)*100000000);
      const W=600,H=330,left=60,bottom=275,top=36,plotH=bottom-top,step=500/years.length;
      let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pendanaan per tahun dalam juta rupiah: ${vals.map(v=>`${v.year} ${juta(v.amount)}`).join('; ')}">`;
      for(let i=0;i<=4;i++){ const y=bottom-i*plotH/4; svg+=`<line x1="${left}" x2="570" y1="${y}" y2="${y}" stroke="#dce5e9"/><text x="50" y="${y+4}" text-anchor="end">${juta(i*ceiling/4)}</text>`; }
      vals.forEach((v,i)=>{const x=left+i*step+step*.22,w=step*.56,h=v.amount/ceiling*plotH;svg+=`<rect x="${x}" y="${bottom-h}" width="${w}" height="${h}" rx="6" fill="${colors[v.year]}"><title>${v.year}: ${rupiah(v.amount)} · ${v.count} kontrak</title></rect><text x="${x+w/2}" y="${bottom-h-10}" text-anchor="middle" class="gd-svg-value">${v.count?juta(v.amount):'—'}</text><text x="${x+w/2}" y="298" text-anchor="middle">${v.year}${v.year===2026?'*':''}</text>`;});
      return svg+'</svg><p class="gd-chart-foot">*2026 sampai berkas yang diperiksa; belum satu tahun penuh.</p>';
    }
    function render() {
      visible = filterGrants(all, {year:$('gdYear').value,scheme:$('gdScheme').value,person:$('gdPerson').value,query:$('gdSearch').value});
      const total=sum(visible), people=new Set(visible.map(r=>r.researcher)).size;
      $('gdStatus').textContent = `${visible.length} dari ${all.length} kontrak · ${people} dosen · ${$('gdYear').value||'2023–2026'}${$('gdPerson').value?' · '+$('gdPerson').value:''}`;
      const kpis=[['Nilai kontrak terverifikasi',rupiah(total),'Sesuai filter aktif'],['Penelitian & publikasi',rupiah(sum(visible.filter(r=>r.group!=='Pengabdian'))),'Termasuk dana luaran yang dinyatakan'],['Pengabdian',rupiah(sum(visible.filter(r=>r.group==='Pengabdian'))),'Terpisah dari hibah penelitian'],['Kontrak / dosen',`${visible.length} / ${people}`,'Satu kontrak dihitung satu kali']];
      $('gdKpis').innerHTML=kpis.map(([label,value,note])=>`<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
      $('gdYears').innerHTML=yearChart(visible);
      $('gdSchemes').innerHTML=bars(groupGrants(visible,'schemeCode'));
      $('gdPeople').innerHTML=bars(groupGrants(visible,'researcher'),true);
      const groups=groupGrants(visible,'schemeCode'); const years=$('gdYear').value?[Number($('gdYear').value)]:[2023,2024,2025,2026];
      $('gdMatrix').innerHTML=groups.length?`<table><caption class="gd-sr">Nilai kontrak per kelompok dan tahun, juta rupiah</caption><thead><tr><th>Kelompok hibah</th>${years.map(y=>`<th>${y}</th>`).join('')}<th>Total</th></tr></thead><tbody>${groups.map(g=>`<tr><th scope="row">${esc(schemeNames.get(g.label))}</th>${years.map(y=>{const a=sum(g.rows.filter(r=>r.year===y));return `<td style="background:rgba(19,133,121,${a?0.06+.23*a/Math.max(...groups.map(g=>g.amount)):0})">${a?juta(a):'—'}</td>`}).join('')}<td><strong>${juta(g.amount)}</strong></td></tr>`).join('')}</tbody><tfoot><tr><th>Total</th>${years.map(y=>`<td>${juta(sum(visible.filter(r=>r.year===y)))}</td>`).join('')}<td>${juta(total)}</td></tr></tfoot></table>`:'<p class="gd-empty">Tidak ada kontrak pada pilihan ini. Berkas yang belum tersedia bukan bukti tidak adanya hibah.</p>';
      $('gdRecords').innerHTML=visible.length?`<table class="gd-record-table"><caption class="gd-sr">Kontrak yang termasuk dalam statistik terpilih</caption><thead><tr><th>Tahun / dosen</th><th>Hibah & sumber</th><th>Nilai kontrak</th><th>Dokumen</th></tr></thead><tbody>${visible.map(r=>`<tr><td><span class="gd-year-badge">${r.year}</span><strong>${esc(r.researcher)}</strong></td><td><strong>${esc(r.title)}</strong><span>${esc(r.scheme)} · ${esc(r.fundingSource)}</span><small>${esc(r.contractNumber)}</small>${r.notes.length?`<details><summary>Catatan verifikasi</summary>${r.notes.map(n=>`<p>${esc(n)}</p>`).join('')}</details>`:''}</td><td class="gd-money">${rupiah(r.amount)}</td><td><a class="gd-pdf" href="${esc(r.documentHref)}#page=${r.amountPage}" target="_blank" rel="noopener">Kontrak · hal. ${r.amountPage} ↗</a>${r.attachments.map(a=>`<a class="gd-attachment" href="${esc(a.href)}" target="_blank" rel="noopener">${esc(a.label)} ↗</a>`).join('')}</td></tr>`).join('')}</tbody></table>`:'<p class="gd-empty">Tidak ada kontrak yang cocok. Ubah pilihan atau reset filter.</p>';
      $('gdExport').disabled=!visible.length;
    }
    ['gdYear','gdScheme','gdPerson'].forEach(id=>$(id).addEventListener('change',render));
    $('gdSearch').addEventListener('input',render);
    $('gdReset').addEventListener('click',()=>{['gdYear','gdScheme','gdPerson','gdSearch'].forEach(id=>$(id).value='');render();});
    $('gdExport').addEventListener('click',()=>{
      const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
      const rows=[['Tahun','Dosen/ketua','Kelompok','Judul','Nomor kontrak','Nilai kontrak IDR','URL kontrak','Catatan'],...visible.map(r=>[r.year,r.researcher,r.scheme,r.title,r.contractNumber,r.amount,new URL(r.documentHref,location.href).href,r.notes.join(' | ')])];
      const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='hibah-dosen-sesuai-filter.csv';a.hidden=true;document.body.append(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},30000);
    });
    $('gdContent').hidden=false;render();
  } catch(error) { $('gdStatus').textContent='Data hibah belum dapat dimuat. Silakan muat ulang halaman atau buka katalog data melalui tautan berikut.'; const a=document.createElement('a');a.href='data/research_grants.json';a.textContent='Buka katalog data';$('gdStatus').append(' ',a); }
}
