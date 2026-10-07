"""Validate roster, deduplication, source traceability, and dashboard aggregates."""
import json,re,unicodedata
from pathlib import Path
from urllib.parse import urlparse
p=Path(__file__).resolve().parents[2]/'data/faculty_publications.json'
d=json.loads(p.read_text()); rows=d['publications']; faculty=d['faculty']
expected=set('6089789 6021099 6021005 6014997 6083056 6026564 65044 6084145 6084328 6089665 6084299 6089608 5999022 6014614 6742829 5999023 6028086'.split())
assert len(faculty)==17 and {f['sintaId'] for f in faculty}==expected
assert d['totals']['publications']==len(rows)
assert sum(x['count'] for x in d['years'])==len(rows)
assert d['totals']['facultyPublicationLinks']==sum(len(r['facultyIds']) for r in rows)
topic_ids={c['id'] for c in d['topicClassification']['categories']}
assert len(topic_ids)==len(d['topicClassification']['categories'])
seen=set();urls={};dois={}
for r in rows:
 assert 'Google Scholar' not in r['indexSources']
 assert not r['historicalOnly']
 assert all(e['via']=='SINTA' and e['source']!='Google Scholar' for e in r['evidence'])
 key=(re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',r['title']).encode('ascii','ignore').decode().lower()),r['year'])
 assert key not in seen,('duplicate',key)
 seen.add(key)
 assert 2023<=r['year']<=2026
 assert r['facultyIds'] and set(r['facultyIds'])<=expected
 assert len(r['facultyIds'])==len(r['lecturers'])
 assert r['topicId'] in topic_ids and r['topicBasis']
 assert r['evidence'] and r['title'].strip()
 if '6026564' in r['facultyIds']:
  assert any(v['facultyId']=='6026564' and v['status']=='verified' and v['sourceUrl'].startswith('https://') for v in r.get('identityVerifications',[])),r['title']
 for e in r['evidence']:
  assert e['source'] in r['indexSources']
  for field in ['url','recordUrl']:
   u=urlparse(e[field]);assert u.scheme=='https' and u.netloc,(field,e[field])
 assert r['lastVerifiedAt']==max(e['checkedAt'] for e in r['evidence'])
 if r.get('doi'):
  doi=r['doi'].lower();assert doi not in dois,doi;dois[doi]=r['id']
for f in faculty:
 assert f['publicationsCaptured']==sum(f['sintaId'] in r['facultyIds'] for r in rows)
 assert sum(f['byYear'].values())==f['publicationsCaptured']
 assert len(f['sourceChecks'])==4
 assert all(s['status']!='unavailable' for s in f['sourceChecks']),f['name']
 assert f['metricsCheckedAt']<=d['generatedAt']
 assert f.get('googleScholarId'),f['name']
for source in d['indexSources']:
 assert source['count']==sum(source['name'] in r['indexSources'] for r in rows)
for y in d['years']:
 assert y['count']==sum(y['year']==r['year'] for r in rows)
assert len(d['sourceAudit'])==68
assert len({(s['facultyId'],s['source']) for s in d['sourceAudit']})==68
assert next(f['googleScholarId'] for f in faculty if f['sintaId']=='6084299')=='572z_AIAAAAJ'
print(json.dumps({'status':'PASS','faculty':17,'uniquePublications':len(rows),'sourcePages':68,'duplicateTitleYear':0,'invalidSourceURLs':0,'years':d['years']},indent=2))
