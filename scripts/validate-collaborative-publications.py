"""Validate the collaboration catalog data and its local navigation/assets."""
import json
import re
import unicodedata
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'publikasi-mahasiswa-dosen/laporan-kolaborasi-dosen-mahasiswa.html'
data = json.loads((ROOT / 'data/collaborative_publications.json').read_text())
rows = data['publications']
assert len(rows) == data['metadata']['baselinePublications'] + data['metadata']['addedFromResearch'] + data['metadata'].get('addedFromUserConfirmedPublisher', 0)
assert data['metadata']['baselinePublications'] + data['metadata']['excludedBefore2023'] == data['metadata']['sourceRows']
for key in ('id', 'title'):
    assert len({str(r[key]).lower() for r in rows}) == len(rows), f'Duplicate {key}'
for row in rows:
    assert row['year'] >= 2023
    assert row['faculty'] and row['students'] and row['venue'] and row['title']
    assert len(row['faculty']) == len(set(row['faculty']))
    assert len(row['students']) == len(set(row['students']))
    url = urlparse(row['url'])
    assert url.scheme == 'https' and url.netloc and not url.username
    assert row['linkKind'] in ('publication', 'venue')

topics = data['topicClassification']['categories']
topic_ids = {t['id'] for t in topics}
assert len(topic_ids) == len(topics), 'Duplicate topic'
assert all(r.get('topicId') in topic_ids for r in rows), 'Missing or invalid topic'
assert sum(sum(r['topicId'] == t for r in rows) for t in topic_ids) == len(rows)
assert data['topicClassification']['reviewedAt']

dois = [r['doi'].lower() for r in rows if r.get('doi')]
assert len(dois) == len(set(dois)), 'Duplicate DOI'
for row in rows:
    if row.get('origin') == 'source-research':
        assert row['indexEvidence'] and row['authorEvidence'] and row['authors']
        assert row['verificationStatus'] == 'author-and-index-evidence'
    for evidence in row.get('indexEvidence', []):
        assert evidence['source'] in ('Scopus', 'Web of Science', 'Garuda')
        assert evidence['via'] == 'SINTA'
        assert urlparse(evidence['url']).hostname == 'sinta.kemdiktisaintek.go.id'
        assert evidence['checkedAt']

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

# Detect equivalent titles even if case, punctuation, or formatting differ.
def normalize_title(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", value).lower())
assert len({normalize_title(r['title']) for r in rows}) == len(rows), 'Normalized title duplicate'
if 'batchReview' in data:
    assert data['batchReview']['verified2026'] == sum(r['year'] == 2026 and r.get('reviewStatus') == 'verified' for r in rows)
    for r in rows:
        if r.get('reviewStatus') == 'verified':
            assert r.get('authorEvidence') and r.get('authors'), r['id']
    for candidate in data.get('candidates', []):
        assert candidate['status'] == 'perlu_verifikasi'
        assert candidate['doi'].lower() not in dois
print('PASS: normalized titles unique, verification totals match, candidates excluded.')
