// /models/ShiftConfig.ts
import { Schema, model, models } from 'mongoose';

const ShiftConfigSchema = new Schema(
  {
    locationRef:   { type: Schema.Types.ObjectId, ref: 'Location', index: true },
    effective_from:{ type: Date, required: true, index: true },
    shifts: [
      {
        name: { type: String, required: true }, // A/B/C
        start: { type: String, required: true }, // "06:00"
        end:   { type: String, required: true }, // "14:00"
      }
    ],
  },
  { timestamps: true }
);

export default models.ShiftConfig || model('ShiftConfig', ShiftConfigSchema);
