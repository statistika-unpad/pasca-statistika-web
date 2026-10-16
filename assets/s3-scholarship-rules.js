// Pure assessment engine: rules and thresholds live in the JSON catalog.
export const labels = {potential:'Berpotensi Memenuhi Syarat', incomplete:'Perlu Melengkapi Persyaratan', unmet:'Belum Memenuhi Persyaratan'};
const missing = v => v === '' || v === undefined || v === null || v === 'unknown';
const numeric = v => !missing(v) && Number.isFinite(Number(v));
function testRule(rule, p) {
  const v = p[rule.field];
  if (rule.operator === 'tests') {
    const q1 = rule.value.q1Waiver && p.publication === 'q1first';
    if (q1) return true;
    // Unknown alternative certificates are routed for review, never rejected.
    const tkaOK = numeric(p.tka) && Number(p.tka) >= rule.value.tka;
    const languageOK = (numeric(p.tkbi) && Number(p.tkbi) >= rule.value.tkbi) ||
      (p.languageAlt === 'ielts' && numeric(p.languageScore) && Number(p.languageScore) >= rule.value.ielts) ||
      (p.languageAlt === 'toefl' && numeric(p.languageScore) && Number(p.languageScore) >= rule.value.toefl);
    if (tkaOK && languageOK && p.certificatesValid === 'yes') return true;
    return null;
  }
  if (rule.operator === 'gpaOrigin') {
    if (!numeric(v) || !['domestic','foreign'].includes(p.degreeOrigin)) return null;
    return Number(v) >= rule.value[p.degreeOrigin];
  }
  if (missing(v)) return null;
  if (rule.operator === 'eq') return v === rule.value;
  if (rule.operator === 'in') return rule.value.includes(v);
  if (!numeric(v)) return null;
  if (rule.operator === 'gte') return Number(v) >= rule.value;
  if (rule.operator === 'lte') return Number(v) <= rule.value;
  return null;
}
export function assessScheme(scheme, profile) {
  const reasons = [], failures = [], gaps = [];
  const rules = scheme.rules || [];
  let checked = 0;
  for (const rule of rules) {
    // Unverified rules cannot produce any eligibility decision.
    if (!rule.verifiedAt) { gaps.push({text:`Belum diverifikasi: ${rule.label}`,source:rule.source}); continue; }
    checked++;
    const result = testRule(rule, profile);
    const item = {text:rule.label, source:rule.source};
    if (result === true) reasons.push({...item,text:`Sesuai isian: ${item.text}.`});
    else if (result === false && rule.severity === 'hard') failures.push({...item,text:`Belum sesuai isian: ${item.text}.`});
    else gaps.push({...item,text:`Perlu diperiksa/dilengkapi: ${item.text}.`});
  }
  if (!checked) gaps.push({text:'Belum ada aturan terverifikasi yang cukup untuk asesmen otomatis skema ini.',source:scheme.sources[0]});
  const status = failures.length ? 'unmet' : gaps.length ? 'incomplete' : 'potential';
  return {id:scheme.id,status,label:labels[status],reasons:[...failures,...gaps,...reasons],manualChecks:scheme.manualChecks || [],targetProgram:scheme.targetProgram,opening:scheme.opening};
}
