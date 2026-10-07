"""Build the publication snapshot from saved public SINTA markdown responses.
Usage: python3 scripts/publications/build-publications.py SOURCE_DIR BASELINE_JSON
Raw responses stay outside the published site; provenance is retained per record.
"""
import json,re,sys,unicodedata,hashlib
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[2];source=Path(sys.argv[1]);old=json.loads(Path(sys.argv[2]).read_text());date='2026-10-07'
roster=[('6089789','Budhi Handoko'),('6021099','Anindya Apriliyanti Pravitasari'),('6021005','Bertho Tantular'),('6014997','Defi Yusti Faidah'),('6083056','Gumgum Darmawan'),('6026564','I Gede Nyoman Mindra Jaya'),('65044','Irlandia Ginanjar'),('6084145','Lienda Noviyanti'),('6084328','Restu Arisanti'),('6089665','Sri Winarni'),('6084299','Triyani Hendrawati'),('6089608','Yusep Suparman'),('5999022','Budi Nurani Ruchjana'),('6014614','Yuyun Hidayat'),('6742829','Hasna Afifah Rusyda'),('5999023','Atje Setiawan Abdullah'),('6028086','Yudhie Andriyana')]
newids={'5999022':'25229331100','5999023':'55872557900'}
identities={'5999022':['https://jurnal.unpad.ac.id/jmi/about/editorialTeamBio/87102'],'5999023':['https://fmipa.unpad.ac.id/staff-dosen-departemen-ilmu-komputer-fmipa-unpad/']}
labels={'scopus':'Scopus','wos':'Web of Science','googlescholar':'Google Scholar','garuda':'Garuda'}
links=re.compile(r'\[([^\]\n]+)\]\((https?://[^\s]+?)\)')
def clean(s):
 s=s.replace('\\_','_').replace('\\','').strip()
 try:
  if any(mark in s for mark in ('Ã','Â','â','ã')):s=s.encode('latin1').decode('utf8')
 except (UnicodeError,ValueError):pass
 return s
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',clean(s)).encode('ascii','ignore').decode().lower())
def read(id,view):
 p=source/f'{id}-{view}.json'
 if not p.exists():return None
 d=json.loads(p.read_text());return d if d.get('markdown') and 'SINTA ID' in d['markdown'] else None
faculty=[];records=[];audit=[]
for i,(sid,name) in enumerate(roster):
 source_date='2026-10-07' if sid=='6028086' else '2026-10-03'
 prev=next((f for f in old['faculty'] if str(f['sintaId'])==sid),{})
 f=dict(prev,id=i+1,name=name,sintaId=sid,education='S-3',sintaProfile=f'https://sinta.kemdiktisaintek.go.id/authors/profile/{sid}',scopusId=newids.get(sid,prev.get('scopusId')),identitySources=identities.get(sid,prev.get('identitySources',[])))
 f['sourceChecks']=[]
 for view,label in labels.items():
  d=read(sid,view);url=f'{f["sintaProfile"]}/?view={view}'
  check=dict(source=label,url=url,checkedAt=source_date,status='available' if d else 'unavailable',recordsInPeriod=0)
  f['sourceChecks'].append(check)
  if not d:continue
  text=d['markdown'];check['status']='empty' if 'Publication Not Found' in text else 'partial';check['via']='SINTA';
  if view=='scopus':
   m=re.search(r'user=([A-Za-z0-9_-]+)',text);f['googleScholarId']=m[1] if m else None
   if sid=='6084299':f['googleScholarId']='572z_AIAAAAJ';f['identitySources']=list(set(f['identitySources']+['https://statistics.unpad.ac.id/dosen-triyani-hendrawati/']))
   m=re.search(r'\[([^\]]+)\]\(https://sinta[^\s]+/affiliations/',text);f['affiliation']=m[1] if m else ''
   for key,label2 in [('sintaScoreOverall','SINTA Score Overall'),('sintaScore3Yr','SINTA Score 3Yr')]:
    m=re.search(r'([\d.,]+)\s+\n'+label2,text);f[key]=int(re.sub(r'\D','',m[1])) if m else None
   stats={}
   for line in text.splitlines():
    if line.startswith('|'):
     cells=[c.strip() for c in line.strip('|').split('|')]
     if cells[0] in ('Article','Citation','H-Index'):stats[cells[0]]=[int(c.replace('.','').replace(',','')) if c.replace('.','').replace(',','').isdigit() else None for c in cells[1:]]
   f['profileMetrics']=stats;f['metricsSource']=url;f['metricsCheckedAt']=source_date;f['hIndexScopus']=stats.get('H-Index',[None])[0]
  domain={'scopus':'www.scopus.com/record/','wos':'www.webofscience.com/wos/','googlescholar':'scholar.google.com/scholar?','garuda':'garuda.kemdiktisaintek.go.id/documents/'}[view]
  starts=[m for m in links.finditer(text) if domain in m[2]]
  for j,m in enumerate(starts):
   block=text[m.end():starts[j+1].start() if j+1<len(starts) else text.find('#### Summary') if '#### Summary' in text else len(text)]
   ym=re.search(r'\[(?:[A-Z]+\s+)?(20\d{2})\]\(',block)
   if not ym:continue
   year=int(ym[1])
   if not 2023<=year<=2026:continue
   ls=list(links.finditer(block));venue='';category=label
   if view=='scopus':
    venue=next((x[1] for x in ls if '/sourceid/' in x[2]),'');q=re.search(r'\[(Q[1-4]) as ',block);category='Scopus '+q[1] if q else 'Scopus'
   elif view=='garuda':
    venue=next((x[1] for x in ls if '/journal/view/' in x[2]),'');q=re.search(r'Accred : (Sinta \d)',block);category=q[1] if q else 'Garuda'
   elif view=='googlescholar':
    authorpos=next((k for k,x in enumerate(ls) if x[1].startswith('Authors')),None)
    if authorpos is not None and len(ls)>authorpos+1:venue=ls[authorpos+1][1]
   else:venue=ls[2][1] if len(ls)>2 else ''
   doi=re.search(r'DOI\s*:\s*(10\.[^\]\s]+)',block);cit=re.search(r'\[(\d+) cited\]',block)
   records.append(dict(title=clean(m[1]),year=year,venue=clean(venue),lecturers=[name],facultyIds=[sid],category=category,indexSources=[label],href=m[2],doi=doi[1] if doi else None,evidence=[dict(source=label,via='SINTA',url=url,recordUrl=m[2],checkedAt=source_date,citations=int(cit[1]) if cit else None)]))
   check['recordsInPeriod']+=1
  audit.append(dict(facultyId=sid,name=name,contentSha256=hashlib.sha256(text.encode()).hexdigest(),**check))
 f['googleScholarProfile']='https://scholar.google.com/citations?user='+f['googleScholarId'] if f.get('googleScholarId') else None
 f['scopusProfile']='https://www.scopus.com/authid/detail.uri?authorId='+f['scopusId'] if f.get('scopusId') else None
 f['wosProfile']='https://www.webofscience.com/wos/author/record/'+f['wosId'] if re.fullmatch(r'[A-Z]+-\d+-\d+',f.get('wosId','')) else None
 faculty.append(f)
# Only current SINTA Scopus/WoS/Garuda records may enter the final catalog.
# Google Scholar pages remain in the inspection audit, never publication evidence.
records=[r for r in records if 'Google Scholar' not in r['indexSources']]
# Review each Mindra attribution against an explicit identity audit, never surname matching.
identity_reviews=json.loads((root/'scripts/publications/mindra-author-verification.json').read_text())['entries']
reviewed_records=[];withheld=[]
for r in records:
 r['identityVerifications']=[]
 if '6026564' in r['facultyIds']:
  review=next((x for x in identity_reviews if x['title']==r['title'] and r['href'] in x['recordUrls'] and x['status']=='verified'),None)
  if not review:
   withheld.append(dict(title=r['title'],facultyId='6026564',recordUrl=r['href'],reason='Author identity requires review'))
   continue
  r['identityVerifications']=[{k:v for k,v in review.items() if k not in ('title','recordUrls')}]
 reviewed_records.append(r)
records=reviewed_records
# Union by normalized title+year, DOI, or source record identifier; shared faculty stay on one record.
groups=[];keymap={}
for r in records:
 keys=[('title',norm(r['title']),r['year'])]
 if r.get('doi'):keys.append(('doi',r['doi'].lower()))
 if '/record/' in r['href'] or '/documents/detail/' in r['href'] or '/full-record/' in r['href']:keys.append(('url',r['href']))
 matches={keymap[k] for k in keys if k in keymap}
 if matches:
  idx=min(matches);g=groups[idx]
  for other in sorted(matches-{idx}):
   if groups[other]:
    o=groups[other]
    for field in ('lecturers','facultyIds','indexSources','evidence','identityVerifications'):g[field]+= [x for x in o[field] if x not in g[field]]
    groups[other]=None
    for k,v in list(keymap.items()):
     if v==other:keymap[k]=idx
  for field in ('lecturers','facultyIds','indexSources','evidence','identityVerifications'):g[field]+=[x for x in r[field] if x not in g[field]]
  if not g.get('doi'):g['doi']=r.get('doi')
  if r['category'].startswith('Scopus') and not g['category'].startswith('Scopus'):
   g['category']=r['category'];g['href']=r['href'];g['venue']=r['venue'] or g['venue']
 else:idx=len(groups);groups.append(r)
 for k in keys:keymap[k]=idx
pubs=[g for g in groups if g]
topic_map=json.loads((root/'scripts/publications/topic-classification.json').read_text())
topic_keys={(norm(e['title']),e['year']):e for e in topic_map['entries']}
for i,g in enumerate(pubs):
 t=topic_keys.get((norm(g['title']),g['year']))
 g['topicId']=t['topicId'] if t else 'review'
 g['topicBasis']=t['basis'] if t else 'Judul belum memiliki pemetaan topik yang ditinjau.'
 g['topicReviewStatus']=t['reviewStatus'] if t else 'needs-review'
 g['id']=i+1;g['lecturer']='; '.join(g['lecturers']);g['indexSource']=' · '.join(g['indexSources']);g['lastVerifiedAt']=max(e['checkedAt'] for e in g['evidence']);g['historicalOnly']=False
for f in faculty:
 subset=[r for r in pubs if f['sintaId'] in r['facultyIds']];f['publicationsCaptured']=len(subset);f['byYear']={str(y):sum(r['year']==y for r in subset) for y in range(2023,2027)}
years=[dict(year=y,count=sum(r['year']==y for r in pubs)) for y in range(2023,2027)]
indices=[dict(name=s,count=sum(s in r['indexSources'] for r in pubs)) for s in labels.values() if s!='Google Scholar']
result=dict(source='SINTA public Scopus, Web of Science and Garuda tabs only',generatedAt=date,period=[2023,2026],partialPublicData=True,catalogRevisedAt=date,inclusionPolicy='Current SINTA Scopus/WoS/Garuda records only; Google Scholar and historical-only records excluded',totals=dict(publications=len(pubs),lecturers=len(faculty),facultyPublicationLinks=sum(f['publicationsCaptured'] for f in faculty)),years=years,indexSources=indices,categories=[dict(name=k,count=v) for k,v in Counter(r['category'] for r in pubs).items()],publications=pubs,faculty=faculty,topicClassification=dict(method=topic_map['method'],categories=topic_map['categories']+[dict(id='review',label='Perlu tinjauan',color='#939393',description='Judul yang belum dapat ditempatkan pada topik utama.')]),sourceAudit=audit,withheldAttributions=withheld,notes=['Public profiles expose a limited selection; this is not an exhaustive bibliography.','Source totals overlap; one article can appear in multiple indexes.','Profile metrics are all-time snapshots reported by SINTA and are not totals for 2023–2026.','Quartiles reflect the source snapshot, not a verified historical quartile for the publication year.','Google Scholar and historical-only records are excluded from the catalog and all publication counts.'])
(root/'data/faculty_publications.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(unique=len(pubs),faculty=len(faculty),sources=indices,pages=len(audit),legacyOnly=sum(r['historicalOnly'] for r in pubs)),indent=2))
