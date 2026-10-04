/* Editorial topic review of SINTA catalog titles. Each publication has one primary topic. */
window.publicationTopicFilter = '';
window.renderPublicationTopics = function(rows, data, scope) {
  const host=document.getElementById('publicationTopicPanel');
  if(!host)return;
  host.hidden=scope.view==='faculty';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories=data.topicClassification?.categories||[];
  const buckets=categories.map(c=>({...c,count:rows.filter(r=>r.topicId===c.id).length})).filter(c=>c.count).sort((a,b)=>b.count-a.count);
  const total=rows.length, fmt=n=>n.toLocaleString('id-ID',{minimumFractionDigits:1,maximumFractionDigits:1});
  let angle=-Math.PI/2;
  const wedges=buckets.map(c=>{
    const share=c.count/total, end=angle+share*Math.PI*2;
    const x=a=>160+146*Math.cos(a),y=a=>160+146*Math.sin(a);
    const label=`${c.label}: ${c.count} publikasi (${fmt(share*100)}%)`;
    const shape=share===1?`<circle cx="160" cy="160" r="146" fill="${c.color}"><title>${esc(label)}</title></circle>`:`<path d="M 160 160 L ${x(angle)} ${y(angle)} A 146 146 0 ${share>.5?1:0} 1 ${x(end)} ${y(end)} Z" fill="${c.color}" stroke="white" stroke-width="2"><title>${esc(label)}</title></path>`;
    const mid=(angle+end)/2;angle=end;
    return shape+(share>=.045?`<text x="${160+103*Math.cos(mid)}" y="${164+103*Math.sin(mid)}" text-anchor="middle" class="pub-topic-percent">${fmt(share*100)}%</text>`:'');
  }).join('');
  const top=buckets.slice(0,3);
  document.getElementById('publicationTopicScope').textContent=`${total} publikasi · ${scope.people} dosen terpilih · ${scope.years.join(', ')||'tanpa tahun'} · ${scope.source||'semua indeks'}${scope.query?' · pencarian: '+scope.query:''}`;
  document.getElementById('publicationTopicChart').innerHTML=total?`<svg viewBox="0 0 320 320" role="img" aria-labelledby="publicationTopicSvgTitle publicationTopicSvgDesc"><title id="publicationTopicSvgTitle">Proporsi topik ${total} publikasi</title><desc id="publicationTopicSvgDesc">${esc(buckets.map(c=>`${c.label}: ${c.count}, ${fmt(c.count/total*100)} persen`).join('; '))}</desc>${wedges}</svg>`:'<p class="pub-topic-empty">Tidak ada publikasi untuk kombinasi filter ini.</p>';
  document.getElementById('publicationTopicSummary').textContent=total?`Topik terbanyak pada pilihan ini: ${top.map(c=>`${c.label} (${c.count})`).join('; ')}. Persentase dihitung dari ${total} publikasi, bukan jumlah penulis atau jumlah indeks.`:'Ubah pilihan dosen, tahun, indeks, atau pencarian untuk menampilkan ringkasan.';
  document.getElementById('publicationTopicLegend').innerHTML=buckets.map(c=>`<button type="button" data-publication-topic="${esc(c.id)}" aria-pressed="${window.publicationTopicFilter===c.id}" class="pub-topic-item"><span class="pub-topic-dot" style="background:${c.color}" aria-hidden="true"></span><span><strong>${esc(c.label)}</strong><small>${esc(c.description)}</small></span><span class="pub-topic-value"><b>${c.count}</b><small>${fmt(c.count/total*100)}%</small></span></button>`).join('');
  document.getElementById('publicationTopicReset').hidden=!window.publicationTopicFilter;
  document.getElementById('publicationTopicSelection').textContent=window.publicationTopicFilter?'Daftar artikel: '+(categories.find(c=>c.id===window.publicationTopicFilter)?.label||'topik terpilih'):'Daftar artikel: semua topik';
};
document.getElementById('publicationTopicLegend')?.addEventListener('click',event=>{
  const button=event.target.closest('[data-publication-topic]');if(!button)return;
  window.publicationTopicFilter=window.publicationTopicFilter===button.dataset.publicationTopic?'':button.dataset.publicationTopic;
  renderFacultyPublications();
});
document.getElementById('publicationTopicReset')?.addEventListener('click',()=>{window.publicationTopicFilter='';renderFacultyPublications();});
