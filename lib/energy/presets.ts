// /lib/energy/presets.ts
export type PresetName = 'ASEB_T1_T2' | 'DG_ENERGY' | 'DG_FUEL';

export type Mapping = {
  timestamp: string;
  meter_kwh_cum?: string;
  kw_inst?: string;
  diesel_liters_cum?: string;
  diesel_liters_inst?: string;
  preserve?: string[]; // extra columns to keep in raw
};

export const PRESETS: Record<PresetName, Mapping> = {
  ASEB_T1_T2: {
    // ASEB Transformer 1/2 (energy meter)
    timestamp: 'Logged-Time',
    meter_kwh_cum: 'kWH',
    kw_inst: 'Watts Total',
    preserve: ['PF', 'Voltage', 'Current'],
  },
  DG_ENERGY: {
    // DG 380/500 energy meter
    timestamp: 'Logged-Time',
    meter_kwh_cum: 'kWH',
    kw_inst: 'Watts Total',
    preserve: [],
  },
  DG_FUEL: {
    // DG 380/500 fuel sensor
    timestamp: 'Logged-Time',
    diesel_liters_cum: 'USE FLOW',
    preserve: ['USE FLOW RATE'],
  },
};

// normalize header (case/space-insensitive) map
export function headerIdx(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => (map[normalizeKey(h)] = i));
  return map;
}
export function normalizeKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}
