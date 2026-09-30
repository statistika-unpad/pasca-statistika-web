import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { sum, groupGrants, filterGrants } from '../assets/grant-dashboard-math.mjs';
const data = JSON.parse(fs.readFileSync('data/research_grants.json'));
const rows=data.grants;
const expected={2023:449975000,2024:455500000,2025:631000000,2026:225780000};
assert.equal(rows.length,36);assert.equal(sum(rows),1762255000);assert.equal(data.totalAmount,sum(rows));
const keys=new Set();let links=0;
for(const r of rows){
 assert(data.lecturers.includes(r.researcher)); assert(r.year>=2023 && r.year<=2026);assert(Number.isSafeInteger(r.amount)&&r.amount>0);
 const key=[r.year,r.researcher,r.schemeCode,r.contractNumber,r.title].join('|');assert(!keys.has(key));keys.add(key);
 for(const source of [{href:r.documentHref,sha256:r.sha256},...r.attachments]){assert(fs.existsSync(source.href));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source.href)).digest('hex'),source.sha256);links++;}
 assert(r.amountPage>0);
}
for(const [y,total] of Object.entries(expected)){assert.equal(sum(filterGrants(rows,{year:y})),total);assert.equal(data.years[y].amount,total);}
for(const key of ['year','schemeCode','researcher']) assert.equal(groupGrants(rows,key).reduce((s,g)=>s+g.amount,0),sum(rows));
assert.equal(sum(filterGrants(rows,{year:'2026',person:'I Gede Nyoman Mindra Jaya'})),86490000);
assert.equal(sum(filterGrants(rows,{scheme:'PPM'})),7000000);
assert.equal(filterGrants(rows,{person:'Hasna Afifah Rusyda'}).length,0);
assert.equal(filterGrants(rows,{query:'tidak-ada-123456789'}).length,0);
assert.equal(filterGrants(rows,{year:'2025',scheme:'RKDU',person:'Sri Winarni'}).length,0);
assert.equal(data.pending.length,2); assert(data.pending.every(r=>!('amount' in r)));
const audit=JSON.parse(fs.readFileSync('data/research-grant-import-audit.json'));assert.equal(audit.length,46);
console.log(JSON.stringify({status:'PASS',contracts:rows.length,totalAmount:sum(rows),years:expected,localDocumentsChecked:links,brokenLinks:0,pendingExcluded:2,filters:'year, scheme, lecturer, combined, empty',reconciled:'year, scheme, lecturer'},null,2));
