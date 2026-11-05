"""Build the typeset CV from profile content. Requires reportlab, lxml and Node.js.
Run after changing profile content; review rendered pages before publication.
"""
from pathlib import Path
import subprocess,json,re,io,base64
from html import escape
from urllib.parse import urljoin
from lxml import html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/'profil/i-gede-nyoman-mindra-jaya.html'
OUT=ROOT/'dokumen/cv-i-gede-nyoman-mindra-jaya.pdf';OUT.parent.mkdir(exist_ok=True)
raw=PAGE.read_text();dom=html.fromstring(raw)
js=raw[raw.index('    const research ='):raw.index('    const escapeHtml =')]
data=json.loads(subprocess.check_output(['node','-e',js+';process.stdout.write(JSON.stringify({research,services,publications,books,intellectualProperties,presentations,awards}));']))
BASE='https://statistika-unpad.github.io/pasca-statistika-web/profil-dosen-statistika-unpad/profil/i-gede-nyoman-mindra-jaya.html'
navy=HexColor('#0b2441');gold=HexColor('#d6a22c');muted=HexColor('#526477')
styles={
'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9.2,leading=12.5,textColor=navy,spaceAfter=4),
'small':ParagraphStyle('small',fontName='Helvetica',fontSize=8,leading=11,textColor=muted,spaceAfter=5),
'h1':ParagraphStyle('h1',fontName='Times-Bold',fontSize=27,leading=30,textColor=navy,spaceAfter=14),
'h2':ParagraphStyle('h2',fontName='Helvetica-Bold',fontSize=13,leading=17,textColor=navy,spaceBefore=12,spaceAfter=9,keepWithNext=True),
'h3':ParagraphStyle('h3',fontName='Helvetica-Bold',fontSize=9.5,leading=12,textColor=navy,spaceAfter=3),
'kicker':ParagraphStyle('kicker',fontName='Helvetica-Bold',fontSize=8,leading=11,textColor=muted,spaceAfter=9),
}
def clean(s):return re.sub(r'\s+',' ',str(s)).strip().replace('–','-').replace('—','-').replace('‑','-').replace('↗','').replace('→','-').replace('“','"').replace('”','"').replace('’',"'")
def p(s,style='body'):return Paragraph(escape(clean(s)),styles[style])
def link(label,url):return Paragraph(f'<a href="{escape(url,quote=True)}" color="#176b9a">{escape(clean(label))}</a>',styles['small'])
def text(el):return clean(el.text_content())
def select(cls):return dom.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," '+cls+' ")]')
story=[]
def section(n,title,desc=None):
 story.extend([p('CURRICULUM VITAE   /   '+n,'kicker'),p(title,'h1')])
 if desc:story.append(p(desc,'small'))
def block(title,body,extra=None):
 parts=[p(title,'h3'),p(body)]
 if extra:parts.append(extra)
 story.append(KeepTogether(parts+[Spacer(1,2)]))
def nextpage():story.append(PageBreak())
class NumberedCanvas(__import__('reportlab.pdfgen.canvas',fromlist=['Canvas']).Canvas):
 def __init__(self,*a,**kw):super().__init__(*a,**kw);self.states=[]
 def showPage(self):self.states.append(dict(self.__dict__));self._startPage()
 def save(self):
  total=len(self.states)
  for state in self.states:
   self.__dict__.update(state);self.setStrokeColor(gold);self.setLineWidth(1);self.line(48,45,A4[0]-48,45)
   self.setFont('Helvetica',7);self.setFillColor(muted);self.drawString(48,31,'I Gede Nyoman Mindra Jaya  |  CV Akademik  |  5 November 2026');self.drawRightString(A4[0]-48,31,f'{self._pageNumber} / {total}')
   super().showPage()
  super().save()
def header(c,d):
 c.setFillColor(navy);c.rect(0,A4[1]-12,A4[0],12,fill=1,stroke=0)
 if d.page>1:
  c.setFont('Helvetica',7);c.setFillColor(muted);c.drawString(48,A4[1]-32,'UNIVERSITAS PADJADJARAN  /  DEPARTEMEN STATISTIKA')
section('01','I Gede Nyoman\nMindra Jaya'.replace('\n',' '))
portrait=select('portrait')[0].get('src');im=Image(io.BytesIO(base64.b64decode(portrait.split(',')[1])),width=80,height=100,kind='proportional')
intro=[p('PROFESOR STATISTIKA','kicker'),p('Departemen Statistika\nFakultas Matematika dan Ilmu Pengetahuan Alam\nUniversitas Padjadjaran'),p('Ketua Program Studi Magister Statistika Terapan'),link('mindra@unpad.ac.id','mailto:mindra@unpad.ac.id')]
t=Table([[intro,im]],colWidths=[399,100]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0)]));story.append(t)
story.append(Spacer(1,12))
stats=Table([[p('70 publikasi Scopus','h2'),p('4 buku   /   7 HKI','h2')],[p('Ringkasan Scopus pada SINTA','small'),p('Karya tercatat pada profil akademik','small')]],colWidths=[249,250]);stats.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),HexColor('#edf2f7')),('LEFTPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,-1),(-1,-1),10)]));story.append(stats)
story.append(p('SINTA menampilkan 70 publikasi pada kolom Scopus. Portal riset Unpad juga mencatat 70 luaran penelitian. Sumber diperiksa 5 November 2026; akses langsung profil Scopus belum dapat diverifikasi. Daftar publikasi pilihan dalam CV ini memuat 19 entri, bukan daftar lengkap 70 publikasi.','small'))
story.append(p('Profil dan kepakaran','h2'))
for el in select('lead-card')[0].xpath('./p'):story.append(p(text(el)))
story.append(p('Pendidikan','h2'))
for el in select('education-card'):
 block(text(el.xpath('./span')[0])+' | '+text(el.xpath('./h3')[0]),text(el.xpath('./p')[0]))
story.append(p('Identitas dan korespondensi','h2'))
story.append(p('NIP 198006032003121002 | NIDN 0003068001\nGedung D14, Kampus Unpad Jatinangor. Jalan Raya Bandung-Sumedang KM 21, Sumedang 45363.'))
nextpage();section('02','Riset dan pengabdian','7 kontrak hibah terverifikasi, 2023-2026. Total pendanaan kontrak Rp366.390.000; bukan realisasi pencairan. Jumlah kontrak berbeda dari jumlah publikasi.')
for x in data['research']:block(x['year']+' | '+x['title'],x['source']+' | '+x['amount'],link('Dokumen kontrak',urljoin(BASE,x['href'])))
story.append(p('Pengabdian kepada masyarakat','h2'))
for x in data['services']:block(x['year']+' | '+x['title'],x['source']+' | '+x['amount'])
for page,items in enumerate([data['publications'][:9],data['publications'][9:]],start=3):
 nextpage();section(f'{page:02}','Publikasi ilmiah pilihan'+(' (lanjutan)' if page==4 else ''),'19 entri tahun 2023-2026 dari katalog program studi. Indeks dan kuartil mengikuti rekaman sumber saat diperiksa; daftar mencakup Scopus, Web of Science, dan Garuda.')
 offset=0 if page==3 else 9
 for i,x in enumerate(items,offset+1):
  block(f'{i:02}. {x["title"]}',f'{x["year"]} | {x["journal"]} | {x["rank"]}',link('Rekaman publikasi',x['href']))
nextpage();section('05','Buku dan kekayaan intelektual')
story.append(p('Buku akademik dan terapan','h2'))
for title,year,pages,publisher in data['books']:block(year+' | '+title,publisher+' | '+pages+' halaman')
story.append(p('HKI dan perangkat lunak','h2'))
for title,year,kind,num in data['intellectualProperties']:block(year+' | '+title,kind+' | Nomor: '+num)
nextpage();section('06','Peran dan penghargaan')
for el in select('role-card'):block(text(el.xpath('./h3')[0]),text(el.xpath('./p')[0]))
story.append(p('Penghargaan akademik','h2'))
for x in data['awards']:block(x['year']+' | '+x['title'],x['detail'])
nextpage();section('07','Presentasi dan pendidikan')
for event,title,place in data['presentations']:block(title,event+' | '+place)
story.append(p('Topik tugas akhir','h2'))
for el in select('education-card'):
 block(text(el.xpath('./h3')[0]),' '.join(text(x) for x in el.xpath('./p')[1:]))
nextpage();section('08','Pengajaran dan sumber akademik')
story.append(p('Mata kuliah','h2'));story.append(p('Analisis Regresi, Analisis Data Spasial, Epidemiologi, Konsultasi Statistika.'))
story.append(p('Materi pembelajaran terbuka','h2'))
seen=set()
for el in select('rpubs-card'):
 if el.get('href') not in seen:story.append(link(text(el.xpath('.//strong')[0]),el.get('href')));seen.add(el.get('href'))
story.append(p('Kolaborasi pembelajaran','h2'))
for el in select('teaching-card'):
 links=[link(text(a),urljoin(BASE,a.get('href'))) for a in el.xpath('.//a')]
 story.append(KeepTogether([p(text(el.xpath('./h3')[0]),'h3')]+links+[Spacer(1,5)]))
story.append(p('Profil dan sumber jumlah publikasi','h2'))
for label,url in [('SINTA 6026564 - ringkasan Scopus: 70 publikasi','https://sinta.kemdiktisaintek.go.id/authors/profile/6026564/?view=garuda'),('Portal riset Unpad - 70 research outputs','https://scholar.unpad.ac.id/en/persons/i-gede-nyoman-mindra-jaya-2/'),('Scopus Author ID 57218102814','https://www.scopus.com/authid/detail.uri?authorId=57218102814'),('Profil akademik dan dashboard project',BASE)]:story.append(link(label,url))
story.append(p('Edisi 5 November 2026. Isi akademik mengikuti profil dosen; pembaruan total publikasi berdasarkan sumber publik di atas. Angka indeks dapat berubah mengikuti pembaruan sumber.','small'))
SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=55,bottomMargin=62,title='Curriculum Vitae - I Gede Nyoman Mindra Jaya',author='I Gede Nyoman Mindra Jaya').build(story,onFirstPage=header,onLaterPages=header,canvasmaker=NumberedCanvas)
print(OUT)
