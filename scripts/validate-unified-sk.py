from pathlib import Path
import re,html,hashlib
s=Path('index.html').read_text();cards=re.findall(r'<article class="document-card".*?</article>',s,re.S)
assert len(cards)==116
seen=set();numbers=set()
for c in cards:
 path=html.unescape(re.search(r'<a class="open" href="([^"]+)"',c)[1]);p=Path(path);assert p.is_file(),path
 sha=hashlib.sha256(p.read_bytes()).hexdigest();assert sha not in seen,path;seen.add(sha)
 matches=re.findall(r'<dd>([^<]*?/UN6[^<]*?)</dd>',c,re.I)
 if matches:
  number=re.sub('[^a-z0-9]','',html.unescape(matches[0]).lower()).lstrip('0');assert number not in numbers,number;numbers.add(number)
assert s.count('id="documents"')==1
assert 'data-document-archive' not in s
assert s.count('id="grantDashboard"')==1
assert 'id="grantRows"' not in s
print('PASS: 116 SK/undangan; unique PDF hashes and indexed document numbers; one SK catalog and one grant dashboard.')

import json
from collections import Counter
audit=json.loads(Path('data/sk-activity-audit.json').read_text())
assert len(audit)==len(cards)
activities=Counter()
for c in cards:
 href=html.unescape(re.search(r'<a class="open" href="([^"]+)"',c)[1])
 activity=html.unescape(re.search(r'data-stage="([^"]+)"',c)[1])
 row=next(r for r in audit if r['href']==href)
 assert row['activity']==activity and row['basis'] and row['sourcePage']>0
 assert row['sha256']==hashlib.sha256(Path(href).read_bytes()).hexdigest()
 activities[activity]+=1
options=html.unescape(re.search(r'<select id="stage">(.*?)</select>',s,re.S)[1])
assert all(f'value="{a}"' in options for a in activities)
assert len(activities)==21
print('PASS: all 116 documents classified into 21 source-backed activity types; no blank activity.')
