// /models/CostConfig.ts
import { Schema, model, models } from 'mongoose';

const CostConfigSchema = new Schema(
  {
    locationRef: { type: Schema.Types.ObjectId, ref: 'Location', index: true },
    effective_from: { type: Date, required: true, index: true },

    // Grid
    grid_rate_per_kwh:      { type: Number, default: 8.0 },
    contract_demand_kva:    { type: Number, default: 0 },
    fixed_per_kva_month:    { type: Number, default: 0 },
    demand_per_kva_month:   { type: Number, default: 0 },
    grid_tax_pct:           { type: Number, default: 0 },

    // Diesel
    diesel_rate_per_l:      { type: Number, default: 90 },
    diesel_tax_pct:         { type: Number, default: 0 },

    // Gas
    gas_rate_per_nm3:       { type: Number, default: 47 },
    gas_tax_pct:            { type: Number, default: 0 },

    note:                   { type: String },
  },
  { timestamps: true }
);

export default models.CostConfig || model('CostConfig', CostConfigSchema);
