// /models/ThresholdConfig.ts
import { Schema, model, models } from 'mongoose';

const ThresholdConfigSchema = new Schema(
  {
    locationRef:    { type: Schema.Types.ObjectId, ref: 'Location', index: true },
    effective_from: { type: Date, required: true, index: true },

    min_run_minutes:    { type: Number, default: 10 },
    min_outage_minutes: { type: Number, default: 5 },
    use_kw_logic:       { type: Boolean, default: false }, // advanced toggle
  },
  { timestamps: true }
);

export default models.ThresholdConfig || model('ThresholdConfig', ThresholdConfigSchema);
