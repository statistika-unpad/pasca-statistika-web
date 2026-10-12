import React from 'react';
import {createRoot} from 'react-dom/client';
import {ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList} from 'recharts';
const pct=(n,d)=>d?new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(n/d*100):'0';
const short=n=>n.replace(/^(Prof\.\s*)?(Dr\.\s*)?/,'').split(',')[0];
const num=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(n);
function Tip({active,payload,label}){if(!active||!payload?.length)return null;const p=payload[0];return <div className="chart-tooltip"><strong>{p.payload.label||label||p.name}</strong><span>{p.value} publikasi</span>{p.payload.percent!==undefined&&<span>{p.payload.percent}% dari hasil filter</span>}</div>;}
function Detail({headers,rows}){return <details className="chart-data"><summary>Lihat angka</summary><div><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div></details>;}
function Empty(){return <div className="chart-empty">Tidak ada publikasi untuk pilihan ini.<br/>Kurangi filter untuk melihat statistik.</div>;}
function ChartCard({id,kicker,title,children,foot,wide=false}){return <section id={id} className={'analytics-card'+(wide?' wide':'')}><header><span>{kicker}</span><h3>{title}</h3></header>{children}<div className="chart-foot">{foot}</div></section>;}
function Analytics({rows,topics,years,onTopic,onYear,onFaculty}){
 const total=rows.length;
 const topicRows=topics.map(t=>({...t,count:rows.filter(r=>r.topicId===t.id).length})).filter(t=>t.count).sort((a,b)=>b.count-a.count).map(t=>({...t,percent:pct(t.count,total)}));
 const annual=years.map(y=>({year:String(y),count:rows.filter(r=>r.year===y).length,label:String(y)+(y===2026?' · belum setahun penuh':'')}));
 const ranked=[...new Set(rows.flatMap(r=>r.faculty))].map(name=>({name,label:short(name),count:rows.filter(r=>r.faculty.includes(name)).length,students:new Set(rows.filter(r=>r.faculty.includes(name)).flatMap(r=>r.students)).size})).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'id'));
 const teams=[{label:'1 dosen · 1 mahasiswa',key:'single',color:'#137d92'},{label:'≥2 dosen · 1 mahasiswa',key:'faculty',color:'#7060aa'},{label:'1 dosen · ≥2 mahasiswa',key:'student',color:'#31937b'},{label:'≥2 dosen · ≥2 mahasiswa',key:'both',color:'#bf8a31'}].map(t=>({...t,count:rows.filter(r=>(r.faculty.length>1?(r.students.length>1?'both':'faculty'):(r.students.length>1?'student':'single'))===t.key).length}));
 const pairs=new Set(rows.flatMap(r=>r.faculty.flatMap(f=>r.students.map(s=>JSON.stringify([f,s]))))).size;
 const pairInstances=rows.reduce((s,r)=>s+r.faculty.length*r.students.length,0);
 const peak=annual.length?Math.max(...annual.map(r=>r.count)):0;
 const peakYears=annual.filter(r=>r.count===peak).map(r=>r.year).join(', ');
 const y24=annual.find(r=>r.year==='2024'),y25=annual.find(r=>r.year==='2025');
 const delta=y24?.count&&y25?((y25.count-y24.count)/y24.count*100):null;
 return <><div className="analytics-title"><div><p>STATISTIK KOLABORASI</p><h2>Peta riset dan jejak pertumbuhannya</h2></div><span className="scope-badge">{total} publikasi · mengikuti filter aktif</span></div>
 <div className="analytics-grid">
 <ChartCard id="topic-chart" kicker="01 / FOKUS PENELITIAN" title="Kolaborasi pada topik apa?" foot="Satu publikasi, satu topik utama. Klasifikasi editorial berdasarkan judul; bidang penerapan didahulukan. Klik topik untuk menelusuri karyanya.">
 {total?<div className="topic-layout"><div className="pie-wrap"><ResponsiveContainer width="100%" height={245}><PieChart><Pie data={topicRows} dataKey="count" nameKey="label" innerRadius="56%" outerRadius="85%" paddingAngle={2} stroke="#fff" strokeWidth={2} isAnimationActive={false} onClick={d=>onTopic(d.id)}>{topicRows.map(t=><Cell key={t.id} fill={t.color}/>)}</Pie><Tooltip content={<Tip/>}/></PieChart></ResponsiveContainer><div className="pie-center"><strong>{total}</strong><span>publikasi</span></div></div><div className="topic-legend">{topicRows.map(t=><button key={t.id} onClick={()=>onTopic(t.id)} aria-label={`Filter topik ${t.label}: ${t.count} publikasi (${t.percent}%)`}><i style={{background:t.color}}/><span>{t.label}</span><strong>{t.count}<small>{t.percent}%</small></strong></button>)}</div></div>:<Empty/>}
 <Detail headers={['Topik','Publikasi','Persentase']} rows={topicRows.map(t=>[t.label,t.count,t.percent+'%'])}/>
 </ChartCard>
 <ChartCard id="trend-chart" kicker="02 / PERJALANAN PUBLIKASI" title="Tren publikasi tahunan" foot="2026 belum setahun penuh. Angka adalah publikasi dalam katalog, bukan seluruh keluaran program studi. Tahun yang tidak dipilih tidak dihitung.">
 {total?<><div className="trend-plot"><ResponsiveContainer width="100%" height={260}><BarChart data={annual} margin={{top:28,right:20,left:-22,bottom:8}}><CartesianGrid vertical={false} stroke="#e5edf1" strokeDasharray="3 5"/><XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fill:'#547080',fontSize:13}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'#7c929d',fontSize:11}}/><Tooltip content={<Tip/>} cursor={{fill:'#f1f6f8'}}/><Bar dataKey="count" maxBarSize={58} radius={[6,6,0,0]} isAnimationActive={false} onClick={d=>onYear(String(d.year))}>{annual.map(t=><Cell key={t.year} fill={t.year==='2026'?'#b99855':'#147d87'}/>)}<LabelList dataKey="count" position="top" fill="#173c53" fontSize={14} fontWeight={700}/></Bar></BarChart></ResponsiveContainer></div><p className="chart-reading">{delta!==null?<><strong>{delta>0?'+':''}{num(delta)}%</strong> perubahan jumlah entri 2024 → 2025 dalam hasil filter.</>:<>Jumlah tertinggi pada <strong>{peakYears}</strong>: {peak} publikasi dalam hasil filter.</>}</p></>:<Empty/>}
 <Detail headers={['Tahun','Publikasi']} rows={annual.map(t=>[t.label,t.count])}/>
 </ChartCard>
 <ChartCard id="faculty-chart" kicker="03 / KONTRIBUSI DOSEN" title="Dosen dan jangkauan kolaborasi" foot="Enam dosen dengan karya terbanyak pada hasil filter. Publikasi bersama dihitung pada setiap dosen terkait; angka antardosen tidak boleh dijumlahkan sebagai total publikasi.">
 {total?<div className="faculty-ranking">{ranked.slice(0,6).map((r,i)=><button className="faculty-rank" key={r.name} onClick={()=>onFaculty(r.name)}><span className="rank-no">{String(i+1).padStart(2,'0')}</span><span className="rank-main"><strong>{r.label}</strong><span className="rank-track"><i style={{width:`${r.count/ranked[0].count*100}%`}}/></span><small>{r.students} mahasiswa dalam karya terkait</small></span><span className="rank-count">{r.count}<small>karya</small></span></button>)}</div>:<Empty/>}
 <Detail headers={['Dosen','Publikasi','Mahasiswa unik']} rows={ranked.map(r=>[r.label,r.count,r.students])}/>
 </ChartCard>
 <ChartCard id="team-chart" kicker="04 / POLA KERJA BERSAMA" title="Komposisi tim kolaborasi" foot="Ukuran tim hanya menghitung dosen dan mahasiswa yang dipetakan dalam katalog, bukan seluruh penulis artikel. Satu karya masuk satu kelompok.">
 {total?<><div className="team-summary"><strong>{pairs}</strong><span>pasangan unik<br/>dosen–mahasiswa</span><div><strong>{num(pairInstances/total)}</strong><span>relasi per karya</span></div></div><div className="team-bars">{teams.map(t=><div key={t.key}><div><span>{t.label}</span><strong>{t.count} <small>({pct(t.count,total)}%)</small></strong></div><div className="team-track"><i style={{width:`${t.count/total*100}%`,background:t.color}}/></div></div>)}</div><p className="team-definition">Pasangan unik dihitung sekali meski muncul pada beberapa karya. Relasi per karya = total pasangan pada setiap karya ÷ jumlah publikasi.</p></>:<Empty/>}
 <Detail headers={['Komposisi tim','Publikasi']} rows={teams.map(t=>[t.label,t.count])}/>
 </ChartCard>
 </div></>;
}
const host=document.getElementById('collaborationAnalytics');const root=host?createRoot(host):null;
window.renderCollaborationAnalytics=props=>root?.render(<Analytics {...props}/>);
window.dispatchEvent(new Event('collaboration-charts-ready'));
