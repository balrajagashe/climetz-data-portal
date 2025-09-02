// /lib/energy/costs.ts
import CostConfig from '@/models/CostConfig';

export type CostParts = { total:number, grid:number, diesel:number, gas:number };

export async function getActiveCost(locationRef: any, at: Date) {
  const cfg = await CostConfig.findOne({ locationRef, effective_from: { $lte: at } })
    .sort({ effective_from: -1 }).lean();
  return cfg;
}

export function applyCostsPerDay(params: {
  cfg: any,
  kwh_aseb: number, kwh_diesel: number, kwh_gas: number,
  diesel_l: number, gas_nm3: number
}): CostParts {
  const { cfg, kwh_aseb, kwh_diesel, kwh_gas, diesel_l, gas_nm3 } = params;
  if (!cfg) return { total:0, grid:0, diesel:0, gas:0 };

  const grid = (kwh_aseb * (cfg.grid_rate_per_kwh || 0));
  const diesel = diesel_l * (cfg.diesel_rate_per_l || 0);
  const gas = gas_nm3 * (cfg.gas_rate_per_nm3 || 0);

  // simple tax application
  const gridTax = grid * (cfg.grid_tax_pct || 0) / 100;
  const dieselTax = diesel * (cfg.diesel_tax_pct || 0) / 100;
  const gasTax = gas * (cfg.gas_tax_pct || 0) / 100;

  const total = grid + diesel + gas + gridTax + dieselTax + gasTax;
  return { total, grid: grid + gridTax, diesel: diesel + dieselTax, gas: gas + gasTax };
}
