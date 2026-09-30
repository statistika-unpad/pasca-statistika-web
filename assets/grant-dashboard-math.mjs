export const sum = rows => rows.reduce((total, row) => total + row.amount, 0);
export const filterGrants = (rows, { year = '', scheme = '', person = '', query = '' } = {}) => {
  const words = query.toLocaleLowerCase('id').trim().split(/\s+/).filter(Boolean);
  return rows.filter(r => (!year || String(r.year) === year) && (!scheme || r.schemeCode === scheme) && (!person || r.researcher === person) && words.every(w => `${r.title} ${r.contractNumber} ${r.researcher} ${r.scheme}`.toLocaleLowerCase('id').includes(w)));
};
export function groupGrants(rows, key) {
  const groups = new Map();
  rows.forEach(r => { const v = groups.get(r[key]) || { label: r[key], amount: 0, count: 0, rows: [] }; v.amount += r.amount; v.count++; v.rows.push(r); groups.set(r[key], v); });
  return [...groups.values()].sort((a, b) => b.amount - a.amount || String(a.label).localeCompare(String(b.label)));
}
