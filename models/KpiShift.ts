// /models/KpiShift.ts
import { Schema, model, models } from 'mongoose';
const KpiShiftSchema = new Schema({
  locationRef: { type: Schema.Types.ObjectId, ref: 'Location', index: true },
  deviceRef:   { type: Schema.Types.ObjectId, ref: 'Device', index: true },
  date:        { type: String, index: true },  // YYYY-MM-DD
  shift:       { type: String, index: true },  // A, B, C
  kwh_aseb:    { type: Number, default: 0 },
  kwh_diesel:  { type: Number, default: 0 },
  kwh_gas:     { type: Number, default: 0 },
  diesel_l:    { type: Number, default: 0 },
  gas_nm3:     { type: Number, default: 0 },
  sfc_diesel:  { type: Number, default: 0 },
  sfc_gas:     { type: Number, default: 0 },
  minutes_outage:  { type: Number, default: 0 },
  minutes_overlap: { type: Number, default: 0 },
  peak_kw:         { type: Number, default: 0 },
  cost_total:      { type: Number, default: 0 },
  cost_grid:       { type: Number, default: 0 },
  cost_diesel:     { type: Number, default: 0 },
  cost_gas:        { type: Number, default: 0 },
}, { timestamps: true });
KpiShiftSchema.index({ locationRef:1, deviceRef:1, date:1, shift:1 }, { unique:true });
export default models.KpiShift || model('KpiShift', KpiShiftSchema);
