// /models/EventOverlap.ts
import { Schema, model, models } from 'mongoose';
const EventOverlapSchema = new Schema({
  locationRef: { type: Schema.Types.ObjectId, ref: 'Location', index: true },
  start:       { type: Date, index: true },
  end:         { type: Date, index: true },
  minutes:     { type: Number, default: 0 },
}, { timestamps: true });
export default models.EventOverlap || model('EventOverlap', EventOverlapSchema);
