"""Enrich the existing snapshot from publisher-deposited Crossref metadata.
Usage: python3 scripts/publications/enrich-collaborations.py CACHE_DIR
Cache files contain Crossref /works/{doi} message objects, one JSON per DOI.
Preserves SINTA evidence. Publisher-only additions carry a separate source label.
"""
import json,re,sys,unicodedata
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[2];path=root/'data/faculty_publications.json';d=json.loads(path.read_text());c=json.loads((root/'data/collaborative_publications.json').read_text())['publications'];date='2026-10-14'
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
metadata=[json.loads(p.read_text()) for p in Path(sys.argv[1]).glob('*.json')]
bydoi={m['DOI'].lower():m for m in metadata};bytitle={norm(m['title'][0]):m for m in metadata if m.get('title')};collab={norm(r['title']):r for r in c};added=list(d.get('collaborationReview',{}).get('newPublisherPublicationIds',[]))
for r in c:
 if r['year']!=2026 or r.get('reviewStatus')!='verified' or any(norm(r['title'])==norm(x['title']) or (r.get('doi') and r['doi'].lower()==(x.get('doi') or '').lower()) for x in d['publications']):continue
 people=[f for f in d['faculty'] if any(norm(f['name']) in norm(n) for n in r['faculty'])]
 if not people:continue
 ev=r['authorEvidence'];ids=[f['sintaId'] for f in people]
 x=dict(id=max(x['id'] for x in d['publications'])+1,title=r['title'],year=r['year'],venue=r['venue'],lecturers=[f['name'] for f in people],facultyIds=ids,category='Penerbit · indeks belum dikonfirmasi',indexSources=['Penerbit'],indexSource='Penerbit',href=r['url'],doi=r.get('doi'),evidence=[dict(source='Penerbit',via=ev['source'],url=ev['url'],recordUrl=r['url'],checkedAt=ev['checkedAt'])],identityVerifications=[],topicId={'digital':'technology'}.get(r['topicId'],r['topicId']),topicBasis='Interpretasi judul publikasi yang telah ditinjau pada katalog kolaborasi.',topicReviewStatus='title-reviewed',lecturer='; '.join(f['name'] for f in people),lastVerifiedAt=ev['checkedAt'],historicalOnly=False)
 if '6026564' in ids:x['identityVerifications']=[dict(facultyId='6026564',status='verified',authorName='I Gede Nyoman Mindra Jaya',sourceUrl=ev['url'],checkedAt=ev['checkedAt'])]
 d['publications'].append(x);added.append(x['id'])
# Explicit institution aliases reviewed against the affiliation strings (not email/domain guesses).
inst=[('parahyangan','Universitas Katolik Parahyangan (Unpar)','Indonesia'),('institut teknologi bandung','Institut Teknologi Bandung (ITB)','Indonesia'),('sepuluh nopember','Institut Teknologi Sepuluh Nopember (ITS)','Indonesia'),('bina nusantara','Bina Nusantara University','Indonesia'),('sumatera utara','Universitas Sumatera Utara','Indonesia'),('matana','Matana University','Indonesia'),('national research and innovation','BRIN','Indonesia'),('badan pusat statistik','Badan Pusat Statistik','Indonesia'),('bureau of statistics','Badan Pusat Statistik','Indonesia'),('ministry of communication','Kementerian Komunikasi dan Digital','Indonesia'),('monash','Monash University','Australia'),('chaoyang','Chaoyang University of Technology','Taiwan'),('university of malaya','University of Malaya','Malaysia'),('malaysia terengganu','Universiti Malaysia Terengganu','Malaysia'),('teknologi malaysia','Universiti Teknologi Malaysia','Malaysia'),('ulsan','Ulsan National Institute of Science and Technology','Korea Selatan'),('hasselt','Hasselt University','Belgia'),('groningen','University of Groningen','Belanda'),('msu-iligan','MSU-Iligan Institute of Technology','Filipina'),('al-baha','Al-Baha University','Arab Saudi'),('akenten','Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development','Ghana'),('azerbaijan','Azerbaijan University of Architecture and Construction','Azerbaijan')]
units=[('computer science','Ilmu Komputer'),('mathematics','Matematika'),('anthropology','Antropologi'),('environmental science','Ilmu Lingkungan'),('environment and sustainability','Pusat Lingkungan dan Keberlanjutan'),('agro-industrial','Teknologi Industri Pertanian'),('marine science','Ilmu Kelautan'),('medicine','Kedokteran'),('sociology','Sosiologi'),('biology','Biologi')]
# Prefer department/programme scope over generic faculty names containing Mathematics.
def affiliation(raw):
 low=raw.lower()
 if 'padjadjaran' in low:
  if re.search(r'(department|departemen|programme|program|study).*?statistic|statistika',low):return dict(institution='Universitas Padjadjaran',country='Indonesia',unit='Statistika',kind='statistics')
  prefix=low.split('faculty of mathematics')[0]
  for key,unit in units:
   if key in prefix:return dict(institution='Universitas Padjadjaran',country='Indonesia',unit=unit,kind='cross-unit')
  return dict(institution='Universitas Padjadjaran',country='Indonesia',unit='Unit belum diketahui',kind='unknown')
 for key,name,country in inst:
  if key in low:return dict(institution=name,country=country,unit='',kind='national' if country=='Indonesia' else 'international')
 return dict(institution='Belum dipetakan',country=None,unit='',kind='unknown')
roster={norm(f['name']) for f in d['faculty']}
for r in d['publications']:
 cr=collab.get(norm(r['title']))
 if not r.get('doi') and cr and cr.get('doi'):r['doi']=cr['doi']
 m=bydoi.get((r.get('doi') or '').lower()) or bytitle.get(norm(r['title']))
 if m and not r.get('doi'):r['doi']=m['DOI']
 authors=[];source='https://api.crossref.org/works/'+m['DOI'] if m else None
 for a in (m or {}).get('author',[]):authors.append(dict(name=(a.get('given','')+' '+a.get('family','')).strip(),affiliations=[x['name'] for x in a.get('affiliation',[]) if x.get('name')]))
 if r.get('doi')=='10.1371/journal.pone.0346790':
  source='https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0346790'
  for a in authors:
   n=a['name']
   if norm(n) in roster:a['affiliations']=['Department of Statistics, Universitas Padjadjaran, Sumedang, Indonesia']
   elif n=='Sapto Wahyu Indratno':a['affiliations']=['Statistics Research Group, Institut Teknologi Bandung, Bandung, Indonesia']
   elif n=='Ebenezer Bonyah':a['affiliations']=['Department of Mathematics Education, Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development, Kumasi, Ghana','Azerbaijan University of Architecture and Construction, Baku, Azerbaijan']
   else:a['affiliations']=['Faculty of Computing, Universiti Teknologi Malaysia, Johor Bahru, Malaysia']
 partners=[];kinds=set();complete=bool(authors) and all(a['affiliations'] for a in authors)
 for a in authors:
  a['institutions']=[dict(raw=raw,**affiliation(raw)) for raw in a['affiliations']]
  complete=complete and all(x['kind']!='unknown' for x in a['institutions'])
  # A roster member's own second affiliation is not by itself an external coauthor.
  if norm(a['name']) in roster:continue
  for x in a['institutions']:
   if x['kind'] in ['national','international','cross-unit']:
    kinds.add(x['kind']);partner=dict(name=x['institution']+(' · '+x['unit'] if x['kind']=='cross-unit' else ''),country=x['country'],kind=x['kind'],author=a['name'])
    if partner not in partners:partners.append(partner)
 group=next((k for k in ['international','national','cross-unit'] if k in kinds),'statistics' if complete and len(authors)>1 else 'unknown')
 r['collaboration']=dict(group=group,kinds=sorted(kinds),completeAffiliations=complete,partners=partners,authors=authors,sourceUrl=source,checkedAt=date,status='affiliation-evidence' if group!='unknown' else 'incomplete-affiliations')
d['generatedAt']=date;d['catalogRevisedAt']=date
rs=d['publications'];d['totals']={'publications':len(rs),'lecturers':len(d['faculty']),'facultyPublicationLinks':sum(len(r['facultyIds']) for r in rs)}
d['years']=[dict(year=y,count=sum(r['year']==y for r in rs)) for y in range(2023,2027)]
d['categories']=[dict(name=k,count=v) for k,v in Counter(r['category'] for r in rs).items()]
d['indexSources']=[dict(name=k,count=sum(k in r['indexSources'] for r in rs)) for k in ['Scopus','Web of Science','Garuda','Penerbit']]
for f in d['faculty']:
 f['publicationsCaptured']=sum(f['sintaId'] in r['facultyIds'] for r in rs);f['byYear']={str(y):sum(f['sintaId'] in r['facultyIds'] and r['year']==y for r in rs) for y in range(2023,2027)}
d['collaborationReview']=dict(checkedAt=date,metadataRecordsRead=len(metadata),newPublisherPublicationIds=added,groups=dict(Counter(r['collaboration']['group'] for r in rs)),method='Afiliasi pada metadata artikel. Mitra merupakan penulis di luar roster dosen. Kelompok utama eksklusif: internasional, nasional, lintas unit Unpad, Statistika Unpad, belum terpetakan. Kelompok mitra dapat beririsan. Afiliasi Statistika tidak membuktikan keanggotaan prodi S2.',limitations='Tidak semua penerbit mendepositkan afiliasi; metadata yang kosong tidak dianggap internal. SINTA publik membatasi cakupan. ITS belum ditemukan dalam afiliasi artikel yang berhasil diverifikasi, bukan bukti tidak ada kolaborasi. Tanggal profil SINTA tetap sesuai snapshot asal.')
d['inclusionPolicy']='Snapshot SINTA Scopus/WoS/Garuda dipertahankan. Tambahan 2026 dari penerbit terverifikasi diberi sumber Penerbit tanpa klaim indeks. Google Scholar tetap tidak dipakai.'
path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(json.dumps(d['collaborationReview'],indent=2,ensure_ascii=False))
