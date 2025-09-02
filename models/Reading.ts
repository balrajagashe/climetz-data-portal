// /models/Reading.ts
import { Schema, model, models } from 'mongoose';

const ReadingSchema = new Schema(
  {
    locationRef: { type: Schema.Types.ObjectId, ref: 'Location', index: true },
    deviceRef:   { type: Schema.Types.ObjectId, ref: 'Device', index: true },
    sensorRef:   { type: Schema.Types.ObjectId, ref: 'Sensor', index: true }, // optional; not required for energy imports
    timestamp:   { type: Date, required: true, index: true },

    // energy fields
    meter_kwh_cum:     { type: Number },    // cumulative kWh
    kw_inst:           { type: Number },    // instantaneous kW if present
    diesel_liters_cum: { type: Number },    // cumulative liters (fuel flow totalizer)
    diesel_liters_inst:{ type: Number },    // computed delta
    gas_nm3_est:       { type: Number },    // computed per device gas_nm3_per_kwh * kWh delta
    run_flag:          { type: Number },    // optional 0/1 run flag if available

    source:            { type: String, default: 'import' }, // import | backfill | manual
    raw:               { type: Schema.Types.Mixed },         // preserve any extra columns
  },
  { timestamps: true }
);

// idempotent upsert key
ReadingSchema.index({ locationRef:1, deviceRef:1, timestamp:1 }, { unique: true });

export default models.Reading || model('Reading', ReadingSchema);
