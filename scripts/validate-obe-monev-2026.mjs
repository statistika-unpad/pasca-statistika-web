import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { buildData, scan, root, source } from './build-obe-monev-2026.mjs';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/obe-monev-2026-data.js'), 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.OBE26_DATA));
assert.deepEqual(data, buildData(), 'Generated manifest is stale; rerun the builder.');
const files = scan(source);
const links = data.documents.flatMap(d => [d.html, d.pdf].filter(Boolean));
assert.equal(new Set(links).size, links.length, 'Duplicate file mapping');
assert.deepEqual(links.map(decodeURIComponent).sort(), files, 'Missing or unexpected evidence');
assert.equal(new Set(data.documents.map(d => d.id)).size, data.documents.length);
const courses = data.documents.filter(d => d.portfolio);
for (const course of courses) {
  assert(course.html && course.pdf, `Incomplete portfolio: ${course.title}`);
  assert.equal(course.html.replace(/\.html$/, ''), course.pdf.replace(/\.pdf$/, ''));
}
const allLinks = [...links, ...data.archive.map(a => a.pdf)];
for (const href of allLinks) {
  assert(!/undefined|null|^\/|^https?:/.test(href), `Invalid relative link ${href}`);
  assert.equal(href.split('/').map(p => encodeURIComponent(decodeURIComponent(p))).join('/'), href, 'Unsafe encoding');
  assert(fs.statSync(path.join(root, decodeURIComponent(href))).isFile(), `Missing target: ${href}`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate DOM id in source');
const start = html.indexOf('id="kurikulum"');
const end = html.indexOf('</section>', start);
assert(html.slice(start, end).includes('id="obe26-dashboard"'), 'Dashboard must stay inside curriculum');
assert(html.includes('id="curriculum-structure-overview"'), 'Existing curriculum structure missing');
for (const asset of ['css', 'js', 'data.js']) {
  const name = asset === 'data.js' ? 'assets/obe-monev-2026-data.js' : `assets/obe-monev-2026.${asset}`;
  assert(html.includes(`${name}?v=${asset === 'data.js' ? '20260921' : '20260921-2'}"`), `Missing versioned asset: ${name}`);
}
// Audit every static local href in the host page as well as the generated catalogue.
let localHrefs = 0;
for (const [, raw] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(raw)) continue;
  const pathname = decodeURIComponent(raw.split(/[?#]/)[0]);
  if (!pathname) continue;
  assert(fs.existsSync(path.join(root, pathname)), `Missing page href: ${raw}`);
  localHrefs += 1;
}
const base = process.env.OBE26_BASE_URL;
if (base) {
  // HEAD checks do not preload document contents into the dashboard.
  for (const href of allLinks) {
    const response = await fetch(new URL(href, base), { method: 'HEAD' });
    assert(response.ok, `HTTP ${response.status}: ${href}`);
  }
}
console.log(JSON.stringify({ status: 'PASS', ...data.counts, mappedFiles: links.length, archiveFiles: data.archive.length, brokenLinks: 0, staticLocalHrefs: localHrefs, httpChecked: base ? allLinks.length : 0, unpaired: data.documents.filter(d => !d.html || !d.pdf).map(d => d.title) }, null, 2));
