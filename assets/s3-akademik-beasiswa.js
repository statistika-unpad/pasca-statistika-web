import { assessScheme } from './s3-scholarship-rules.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url,label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const dateText = date => date ? new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(new Date(`${date}T12:00:00`)) : 'Belum terverifikasi';
const list = values => `<ul>${values.map(v=>`<li>${escape(v)}</li>`).join('')}</ul>`;
let data;
const sourceLine = ids => `<div class="source-line">${ids.map(id=>{const s=data.sources[id];return `${link(s.url,s.title)}<span>${s.verifiedAt?'Diperiksa':'Cek akses'}: ${dateText(s.verifiedAt||s.checkedAt)}</span>`;}).join('')}</div>`;
const table = (caption,headers,rows) => `<div class="table-scroll" role="region" aria-label="${escape(caption)}" tabindex="0"><table><caption>${escape(caption)}</caption><thead><tr>${headers.map(x=>`<th scope="col">${escape(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i?`<td>${escape(v)}</td>`:`<th scope="row">${escape(v)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const select = (name,label,options,hint='') => `<label>${escape(label)}<select name="${name}"><option value="">Belum diisi</option>${options.map(([v,l])=>`<option value="${v}">${escape(l)}</option>`).join('')}</select>${hint?`<small>${escape(hint)}</small>`:''}</label>`;
const number = (name,label,min,max,step='1',hint='') => `<label>${escape(label)}<input type="number" name="${name}" min="${min}" max="${max}" step="${step}" inputmode="decimal" autocomplete="off">${hint?`<small>${escape(hint)}</small>`:''}</label>`;
const yesno=[['yes','Ya'],['no','Tidak']];
function form() {
 return `<form id="scholarship-form" autocomplete="off">
 <fieldset><legend>Profil pendidikan dan pekerjaan</legend><div class="form-grid">
 ${select('education','Pendidikan terakhir',[['s1','S1'],['d4','D4 / sarjana terapan'],['s2','S2'],['s3','S3'],['other','Lainnya']])}
 ${number('age','Usia saat mendaftar',0,120)}
 ${number('gpaS2','IPK S2 (skala 4)',0,4,'0.01','Kosongkan jika belum menempuh S2.')}
 ${number('gpaS1','IPK S1 / D4 (skala 4)',0,4,'0.01','Digunakan untuk asesmen BUPP.')}
 ${select('degreeOrigin','Asal perguruan tinggi S1',[['domestic','Indonesia'],['foreign','Luar negeri']])}
 ${select('institution','Jenis institusi tempat bekerja',[['unpad','Universitas Padjadjaran'],['university','Perguruan tinggi lain'],['government','Instansi pemerintah / BPS'],['company','BUMN / swasta'],['other','Lainnya'],['none','Belum bekerja']],'Tidak perlu mengisi nama tempat kerja.')}
 ${select('lecturer','Berstatus dosen',yesno)}
 ${select('unpadLecturer','Berstatus dosen Unpad',yesno)}
 ${select('employee','ASN atau pegawai instansi',yesno)}
 ${select('doctoralStatus','Status studi doktor',[['prospective','Calon mahasiswa'],['unpad1','Doktor Unpad tahun 1'],['unpad2','Doktor Unpad tahun 2'],['unpad3','Doktor Unpad tahun 3'],['other','Lainnya']])}
 </div></fieldset>
 <fieldset><legend>Tes, publikasi dan kesiapan studi</legend><div class="form-grid">
 ${number('tka','Nilai TKA / TPA',0,1000,'1','Isikan skor dari penyelenggara yang diakui; jangan mengonversi sendiri.')}
 ${number('tkbi','Nilai ELT / TKBI',0,1000,'1','Kosongkan jika memakai IELTS / TOEFL iBT.')}
 ${select('languageAlt','Sertifikat bahasa alternatif',[['none','Tidak ada'],['ielts','IELTS'],['toefl','TOEFL iBT'],['other','Sertifikat lain']])}
 ${number('languageScore','Skor sertifikat alternatif',0,1000,'0.1','Gunakan skala asli; IELTS 0–9, TOEFL iBT 0–120.')}
 ${select('certificatesValid','Sertifikat masih berlaku dan diakui',yesno,'Penerbit dan masa berlaku tetap diperiksa panitia.')}
 ${select('publication','Publikasi internasional',[['q1first','Scopus Q1, sebagai first author'],['other','Publikasi lainnya'],['none','Belum ada']])}
 ${select('funding','Sedang menerima pendanaan studi / beasiswa',yesno)}
 ${select('scholarship','Pendanaan aktif tersebut berupa beasiswa',yesno,'Bedakan beasiswa dengan sponsor atau bantuan riset lain.')}
 ${select('promoter','Sudah ada calon promotor dan surat kesediaan',yesno)}
 </div></fieldset>
 <p class="info-note">Data hanya diproses pada halaman ini, tidak dikirim dan tidak disimpan. Isian boleh dikosongkan. Jenis institusi dan status pegawai membantu mengarahkan langkah lanjut; keduanya bukan dasar penolakan otomatis.</p>
 <p id="form-error" role="alert" hidden></p>
 <div class="form-actions"><button class="primary" type="submit">Lihat hasil asesmen</button><button class="secondary" type="reset">Bersihkan isian</button></div>
 </form><div id="assessment-results" class="results" aria-live="polite" tabindex="-1"></div>`;
}
function card(s) {
 const fields=[['Penyelenggara',s.provider],['Sasaran',s.target],['Usia',s.age],['IPK',s.gpa],['Tes akademik dan bahasa',s.tests],['Persyaratan lain',s.requirements],['Promotor',s.supervisor],['Luaran / publikasi',s.outputs]];
 return `<article class="guide-card scheme-card" id="skema-${s.id}" data-scheme="${s.id}"><span class="tag">${escape(s.type)}</span><h3>${escape(s.name)}</h3><p>${escape(s.target)}</p><p><strong>Fasilitas:</strong> ${escape(s.funding)}</p><p><strong>Durasi:</strong> ${escape(s.duration)}</p><div class="scheme-status"><strong>Penawaran S3 Statistika</strong><br>${escape(s.targetProgram)}</div><p><strong>Pendaftaran:</strong> ${escape(s.opening)}</p><details><summary>Persyaratan dan catatan</summary><dl>${fields.map(([k,v])=>`<dt>${escape(k)}</dt><dd>${escape(v)}</dd>`).join('')}</dl>${list(s.notes)}<p class="guide-status">${escape(s.informationStatus)} · ${dateText(s.verifiedAt)}</p></details>${sourceLine(s.sources)}</article>`;
}
function render() {
 const a=data.academic, r=data.schemes.find(x=>x.id==='rddu');
 document.querySelector('#guide-content').innerHTML=`
 <section class="guide-section" id="program-doktor"><p class="section-label">01 · Program Doktor</p><h2>Dua bentuk disertasi, satu tuntutan kontribusi ilmiah.</h2><p class="section-intro">${escape(a.overview)}</p><p>${link(data.sources.smup.url,'Persyaratan dan pendaftaran doktor di SMUP')} · <a href="index.html#web-s3">Profil, CPL dan kurikulum S3 Statistika</a></p><div class="info-note">${escape(a.loadNote)}</div>
 <h3>Konvensional dan kumpulan artikel ilmiah</h3>${table('Perbandingan bentuk disertasi',['Aspek','Konvensional','Kumpulan artikel','Rujukan Perrek 32/2026'],a.comparison)}${sourceLine(['perrek32'])}
 <h3 id="jalur-artikel">Publikasi untuk pengajuan SPD jalur artikel</h3><p class="notice">${escape(a.spdNotice)}</p><div class="publication-grid">${a.publication.map(([k,v])=>`<div class="pub-item"><small>${escape(k)}</small><strong>${escape(v)}</strong></div>`).join('')}</div>${sourceLine(['perrek32'])}
 <h3>Telusuri tahapan studi</h3><p>Pilih bentuk disertasi, lalu buka tiap tahap untuk melihat penjelasannya.</p><div class="route-picker" role="group" aria-label="Pilih bentuk disertasi"><button type="button" data-route="konvensional" aria-pressed="false" aria-controls="study-timeline">Konvensional</button><button type="button" data-route="artikel" aria-pressed="true" aria-controls="study-timeline">Kumpulan artikel</button></div><ol id="study-timeline" class="timeline"></ol>
 <details><summary>Ketentuan yang masih memerlukan klarifikasi fakultas</summary>${list(a.clarifications)}<p>Peraturan 32/2026 dibaca bersama aturan induk 13/2025 dan perubahan 22/2025. Metadata aturan induk ditemukan, tetapi naskah unduhannya belum berhasil dibaca pada pemeriksaan ini.</p>${sourceLine(['perrek13','perrek22','perrek32'])}</details>
 <h3>Pertanyaan yang sering diajukan</h3>${a.faq.map(([q,v])=>`<details><summary>${escape(q)}</summary><p>${escape(v)}</p></details>`).join('')}
 </section>
 <section class="guide-section" id="beasiswa"><p class="section-label">02 · Beasiswa & Pendanaan</p><h2>Pilih skema yang sesuai dengan latar belakang Anda.</h2><p class="section-intro">Keberadaan beasiswa di universitas tidak menjamin tersedianya kuota S3 Statistika. Periksa kecocokan pribadi, penawaran program studi, dan periode pendaftaran secara terpisah.</p><div class="catalog-toolbar"><label for="scheme-filter">Tampilkan</label><select id="scheme-filter"><option value="all">Semua skema</option><option value="doctoral">Beasiswa doktor</option><option value="integrated">Magister menuju doktor</option><option value="research">Hibah riset</option><option value="sponsor">Sponsor / tugas belajar</option></select><span id="scheme-count" role="status"></span></div><div class="scheme-grid">${data.schemes.map(card).join('')}</div>
 <details><summary>Bandingkan sasaran, manfaat dan penawaran</summary>${table('Perbandingan pendanaan',['Skema','Sasaran','Fasilitas','Penawaran S3 Statistika'],data.schemes.map(s=>[s.name,s.target,s.funding,s.targetProgram]))}</details></section>
 <section class="guide-section" id="rddu"><p class="section-label">03 · Hibah riset disertasi</p><h2>Riset Disertasi Doktor Unpad (RDDU)</h2><p class="section-intro">Dukungan kompetitif untuk penelitian disertasi dosen Unpad. Pengajuan dilakukan oleh ketua promotor melalui mekanisme DRHPM.</p><div class="columns"><article class="guide-card"><span class="tag">Operasional riset</span><p class="rddu-amount">${escape(data.rddu.amountLabel)}</p><p>Sesuai SK Rektor dalam pedoman 2026. Satuan periode alokasi mengikuti SK/kontrak; tidak otomatis dinyatakan per tahun atau per mahasiswa.</p><p>Bantuan tuition fee diproses DRHPM; nominalnya tidak dirinci pada Bab 12. Tidak ada dana output.</p></article><article class="guide-card"><span class="tag">Luaran hibah</span><h3>${escape(data.rddu.outputsHeadline)}</h3><p>${escape(r.outputs)}</p><p><strong>Terpisah dari persyaratan SPD.</strong> Syarat hibah ini tetap menjadi kewajiban penerima sesuai kontraknya.</p></article></div>
 <h3>Tim dan kelayakan pengusulan</h3><p>${escape(r.requirements)}</p><p>${escape(r.supervisor)}</p><p class="notice">${escape(r.notes[0])}</p>
 <h3>Penggunaan dana</h3>${table('Batas komponen anggaran RDDU',['Komponen','Batas pada pedoman'],data.rddu.budget)}${list(data.rddu.notes)}
 <h3>Dokumen pengajuan</h3>${list(data.rddu.documents)}${sourceLine(['hru','drhpm'])}<p>${link('https://staffs.unpad.ac.id/','Portal pengajuan Staffs Unpad')}</p></section>
 <section class="guide-section" id="cek-peluang"><p class="section-label">04 · Asesmen awal</p><h2>Cek peluang beasiswa</h2><p class="section-intro">Gunakan profil Anda untuk melihat persyaratan yang sudah sesuai dan yang perlu dilengkapi. Hasil bersifat informatif, bukan keputusan penerimaan. Aturan yang belum terverifikasi tidak dipakai untuk menyatakan Anda tidak memenuhi syarat.</p><p class="notice">Asesmen memakai ketentuan yang diperiksa pada ${dateText(data.updatedAt)}. Hasil kecocokan profil tidak menyatakan pendaftaran sedang dibuka atau S3 Statistika tersedia dalam skema tersebut.</p>${form()}</section>
 <section class="guide-section" id="dokumen-regulasi"><p class="section-label">05 · Sumber resmi</p><h2>Dokumen dan regulasi</h2><p class="section-intro">Gunakan dokumen asli untuk keputusan akademik dan pengajuan pendanaan. Periksa kembali pengumuman terbaru pada saat mendaftar.</p><div class="library">${Object.values(data.sources).map(s=>`<article class="guide-card"><h3>${link(s.url,s.title)}</h3><p>${escape(s.locator)}</p><p>${escape(s.status)}</p><small>${s.verifiedAt?'Diperiksa':'Cek akses'}: ${dateText(s.verifiedAt||s.checkedAt)}</small></article>`).join('')}</div></section>`;
 renderTimeline('artikel');
 const status=document.querySelector('#guide-status');status.textContent=`Diperbarui ${dateText(data.updatedAt)} · Ringkasan berbasis sumber resmi; ketentuan operasional dan penawaran prodi mengikuti konfirmasi penyelenggara.`;
 setupEvents();
 filterSchemes('all');
 if(location.hash) requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
}
function renderTimeline(route) {
 document.querySelector('#study-timeline').innerHTML=data.academic.routes[route].map(([title,body,source],i)=>`<li><details${i===0?' open':''}><summary>${escape(title)}</summary><p>${escape(body)}</p><small>${escape(source)} · ${link(data.sources.perrek32.url,'Perrek 32/2026')}</small></details></li>`).join('');
 document.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.route===route)));
}
function filterSchemes(value) {
 const groups={doctoral:['bpdp','lpdp','pddi'],integrated:['bupp','pmdsu'],research:['rddu'],sponsor:['institusi']};let count=0;
 document.querySelectorAll('[data-scheme]').forEach(card=>{card.hidden=value!=='all'&&!groups[value].includes(card.dataset.scheme);if(!card.hidden)count++;});
 document.querySelector('#scheme-count').textContent=`${count} skema ditampilkan`;
}
function showResults(p) {
 const extra = p.employee === 'yes' || (p.institution && p.institution !== 'none') ? '<p class="info-note">Anda juga dapat menanyakan tugas belajar atau sponsor kepada institusi asal. Status pegawai tidak otomatis berarti tersedia pembiayaan.</p>' : '';
 document.querySelector('#assessment-results').innerHTML=`<h3>Hasil asesmen awal</h3>${extra}<p>“Berpotensi” berarti isian sesuai dengan aturan yang dapat diperiksa otomatis. Dokumen, kelayakan prodi dan keputusan penyelenggara tetap harus diverifikasi.</p>`+data.schemes.map(s=>{
 const result=assessScheme(s,p);return `<article class="result" data-result="${s.id}" data-status="${result.status}"><span class="tag ${result.status}">${escape(result.label)}</span><h3>${escape(s.name)}</h3><ul>${result.reasons.map(r=>`<li>${escape(r.text)} ${r.source?link(data.sources[r.source].url,'Dasar persyaratan'):''}</li>`).join('')}</ul><p><strong>Masih perlu pemeriksaan:</strong> ${escape(result.manualChecks.join(' '))}</p><p class="scheme-status"><strong>Penawaran S3 Statistika:</strong> ${escape(s.targetProgram)}</p><p><strong>Pendaftaran:</strong> ${escape(s.opening)}</p>${sourceLine(s.sources)}</article>`;
 }).join('');
 document.querySelector('#assessment-results').focus();
}
function setupEvents() {
 document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>renderTimeline(b.dataset.route)));
 document.querySelector('#scheme-filter').addEventListener('change',e=>filterSchemes(e.target.value));
 const form=document.querySelector('#scholarship-form'),error=document.querySelector('#form-error');
 form.addEventListener('submit',e=>{
  e.preventDefault();const p=Object.fromEntries(new FormData(form));error.hidden=true;
  const badLanguage=(p.languageAlt==='ielts'&&Number(p.languageScore)>9)||(p.languageAlt==='toefl'&&Number(p.languageScore)>120);
  const contradiction=(p.unpadLecturer==='yes'&&(p.lecturer==='no'||(p.institution&&p.institution!=='unpad')))||(p.scholarship==='yes'&&p.funding==='no');
  if(badLanguage||contradiction){error.textContent=badLanguage?'Periksa skala sertifikat: IELTS maksimal 9; TOEFL iBT maksimal 120.':'Ada isian yang belum konsisten pada status dosen/institusi atau beasiswa/pendanaan aktif. Mohon periksa kembali.';error.hidden=false;document.querySelector('#assessment-results').innerHTML='';return;}
  if(p.funding==='no'&&!p.scholarship)p.scholarship='no';
  showResults(p);
 });
 form.addEventListener('reset',()=>{document.querySelector('#assessment-results').innerHTML='';error.hidden=true;});
}
async function init() {
 try {const response=await fetch('data/s3-akademik-beasiswa.json?v=20261016',{cache:'no-cache'});if(!response.ok)throw new Error('data unavailable');data=await response.json();render();}
 catch {document.querySelector('#guide-status').innerHTML='Panduan belum dapat dimuat. <button type="button" id="retry-guide">Coba lagi</button> atau baca <a href="https://smup.unpad.ac.id/program-doktor/">sumber SMUP</a>.';document.querySelector('#retry-guide').addEventListener('click',init);}
}
init();
