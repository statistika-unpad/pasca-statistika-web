"""Validate the collaboration catalog data and its local navigation/assets."""
import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'publikasi-mahasiswa-dosen/laporan-kolaborasi-dosen-mahasiswa.html'
data = json.loads((ROOT / 'data/collaborative_publications.json').read_text())
rows = data['publications']
assert len(rows) + data['metadata']['excludedBefore2023'] == data['metadata']['sourceRows']
for key in ('id', 'sourceRow', 'title'):
    assert len({str(r[key]).lower() for r in rows}) == len(rows), f'Duplicate {key}'
for row in rows:
    assert row['year'] >= 2023
    assert row['faculty'] and row['students'] and row['venue'] and row['title']
    assert len(row['faculty']) == len(set(row['faculty']))
    assert len(row['students']) == len(set(row['students']))
    url = urlparse(row['url'])
    assert url.scheme == 'https' and url.netloc and not url.username
    assert row['linkKind'] in ('publication', 'venue')

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ('href', 'src'):
                continue
            url = urlparse(value)
            if not url.scheme and url.path:
                assert (PAGE.parent / unquote(url.path)).exists(), value

Links().feed(PAGE.read_text())
assert (ROOT / 'data/collaborative_publications.json').exists()
print(f'PASS: {len(rows)} unique publications, years >= 2023, complete author lists, valid URL structure, zero broken local links.')
