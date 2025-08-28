export function toCsv(rows: any[], headerOrder?: string[]) {
  if (!rows.length) return '';
  const headers = headerOrder || Object.keys(rows[0]);
  const escape = (v:any)=> `"${String(v ?? '').replace(/"/g,'""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h=>escape(r[h])).join(','))
  ];
  return lines.join('\n');
}
