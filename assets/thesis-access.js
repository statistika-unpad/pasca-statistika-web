(() => {
 const byId=id=>document.getElementById(id),recipient='kaprodi.statistikaterapan.s2@unpad.ac.id';
 let records=[];
 fetch('data/alumni.json?v=20261102-thesis-access').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
  records=data.records.filter(r=>r.thesisArchive?.access==='request-email');
  byId('thesis').replaceChildren(new Option('Pilih nama penulis dan judul tesis',''));
  records.forEach(r=>byId('thesis').add(new Option(`${r.nama} — ${r.judul}`,r.npm)));
  const npm=new URLSearchParams(location.search).get('npm');
  if(records.some(r=>r.npm===npm))byId('thesis').value=npm;
  byId('thesis').disabled=false;byId('prepare').disabled=false;
 }).catch(()=>{byId('load-status').textContent='Daftar tesis belum dapat dimuat. Muat ulang halaman atau kirim email manual ke '+recipient+'.';});
 byId('request-form').addEventListener('submit',event=>{
  event.preventDefault();if(!event.target.reportValidity())return;
  const r=records.find(r=>r.npm===byId('thesis').value);if(!r)return;
  const v=id=>byId(id).value.trim();
  const body=`Yth. Kaprodi Magister Statistika Terapan FMIPA Unpad,\n\nSaya mengajukan permintaan akses tesis berikut:\nPenulis: ${r.nama}\nJudul: ${r.judul}\nTahun: ${r.tahun_lulus}\nKode katalog: ${r.npm}\n\nNama pemohon: ${v('requester')}\nAfiliasi: ${v('affiliation')}\nEmail balasan: ${v('reply')}\n\nMaksud dan tujuan:\n${v('purpose')}\n\nBagian yang diperlukan: ${v('scope')}\nJangka waktu penggunaan: ${v('duration')}\n\nSaya bersedia menggunakan berkas sesuai tujuan yang disetujui, mencantumkan sumber secara tepat, menjaga data pribadi, serta tidak menyebarkan ulang berkas/tautan atau menggunakannya secara komersial tanpa izin yang sesuai. Saya memahami bahwa akses memerlukan peninjauan dan persetujuan Kaprodi.\n\nTerima kasih.\n${v('requester')}`;
  byId('email-text').value=body;
  byId('send-email').href=`mailto:${recipient}?subject=${encodeURIComponent('Permintaan Akses Tesis — '+r.nama)}&body=${encodeURIComponent(body)}`;
  byId('draft').hidden=false;byId('draft').scrollIntoView({behavior:'smooth'});
 });
 byId('copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(byId('email-text').value);byId('copy-status').textContent='Isi email disalin. Silakan tempelkan di aplikasi email.';}catch{byId('email-text').select();byId('copy-status').textContent='Silakan salin teks yang dipilih secara manual.';}});
})();
