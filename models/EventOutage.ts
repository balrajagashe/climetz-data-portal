// /models/EventOutage.ts
import { Schema, model, models } from 'mongoose';
const EventOutageSchema = new Schema({
  locationRef: { type: Schema.Types.ObjectId, ref: 'Location', index: true },
  start:       { type: Date, index: true },
  end:         { type: Date, index: true },
  minutes:     { type: Number, default: 0 },
}, { timestamps: true });
export default models.EventOutage || model('EventOutage', EventOutageSchema);
