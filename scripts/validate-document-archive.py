import json, subprocess, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'data/document-archive.json').read_text())
allowed=json.loads((root/'data/document-archive-audit.json').read_text())['lecturers']
seen=set()
for d in rows:
 p=root/d['href']; assert p.is_file(),d['href']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==d['sha256']
 assert d['sha256'] not in seen;seen.add(d['sha256'])
 assert 2023<=d['year']<=2026
 info=subprocess.check_output(['pdfinfo',str(p)],text=True)
 pages=int(next(l.split(':')[1] for l in info.splitlines() if l.startswith('Pages:')))
 assert all(n['name'] in allowed and 1<=n['page']<=pages for n in d['people'])
 assert d['href'] in (root/'index.html').read_text()
print(f'PASS: {len(rows)} PDF unik; hash, tahun, nama, halaman, dan tautan valid. Broken link: 0.')
