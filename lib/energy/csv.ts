// /lib/energy/csv.ts
import { PRESETS, Mapping, headerIdx, normalizeKey } from './presets';

export type ParsedRow = {
  timestamp: Date;
  meter_kwh_cum?: number;
  kw_inst?: number;
  diesel_liters_cum?: number;
  diesel_liters_inst?: number;
  raw?: Record<string, any>;
};

function detectDelimiter(firstLine: string): string {
  const candidates = [',', ';', '\t', '|'];
  let best = ',', bestCount = 0;
  for (const d of candidates) {
    const c = firstLine.split(d).length - 1;
    if (c > bestCount) { best = d; bestCount = c; }
  }
  return best;
}

export function parseCsv(text: string, mapping: Mapping): ParsedRow[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(Boolean);
  if (!lines.length) return [];
  const delim = detectDelimiter(lines[0]);
  const headers = lines[0].split(delim).map(h => h.trim());
  const idx = headerIdx(headers);
  const get = (name?: string) => {
    if (!name) return -1;
    const i = idx[normalizeKey(name)];
    return Number.isInteger(i) ? i : -1;
  };

  const iTs   = get(mapping.timestamp);
  const iKwh  = get(mapping.meter_kwh_cum);
  const iKw   = get(mapping.kw_inst);
  const iDiesCum = get(mapping.diesel_liters_cum);
  const iDiesInst= get(mapping.diesel_liters_inst);
  const preserveIdx = (mapping.preserve || []).map(get).filter(i => i >= 0);

  const out: ParsedRow[] = [];
  for (let li = 1; li < lines.length; li++) {
    const parts = lines[li].split(delim);
    if (!parts.length) continue;

    const tsRaw = parts[iTs]?.trim();
    if (!tsRaw) continue;
    // Normalize to IST
    const ts = new Date(tsRaw);
    if (isNaN(+ts)) continue;

    const row: ParsedRow = { timestamp: ts };
    if (iKwh >= 0) row.meter_kwh_cum = toNum(parts[iKwh]);
    if (iKw  >= 0) row.kw_inst       = toNum(parts[iKw]);
    if (iDiesCum  >=0) row.diesel_liters_cum  = toNum(parts[iDiesCum]);
    if (iDiesInst >=0) row.diesel_liters_inst = toNum(parts[iDiesInst]);

    if (preserveIdx.length) {
      row.raw = {};
      preserveIdx.forEach((pi, k) => {
        const key = (mapping.preserve || [])[k];
        row.raw![key] = toNum(parts[pi]) ?? parts[pi];
      });
    }

    out.push(row);
  }
  return out;
}

function toNum(v: any): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(String(v).replace(/[, ]/g, ''));
  return isFinite(n) ? n : undefined;
}

export function applyMonotonicDelta(series: (number|undefined)[]): number[] {
  // Convert cumulative series to non-negative deltas; handle resets
  const out: number[] = [];
  let prev: number|undefined = undefined;
  for (const v of series) {
    if (v === undefined) { out.push(0); continue; }
    if (prev === undefined) { out.push(0); prev = v; continue; }
    const d = v - prev;
    if (d >= 0 && d < 1e8) out.push(d); // sane positive delta
    else out.push(0); // reset or bad jump
    prev = v;
  }
  return out;
}

export { PRESETS };
