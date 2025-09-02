// /models/ImportJob.ts
import { Schema, model, models } from 'mongoose';

const ImportJobSchema = new Schema(
  {
    userRef:      { type: Schema.Types.ObjectId, ref: 'User' },
    locationRef:  { type: Schema.Types.ObjectId, ref: 'Location' },
    deviceRef:    { type: Schema.Types.ObjectId, ref: 'Device' },
    presetName:   { type: String },
    fileNames:    [{ type: String }],
    rowsIn:       { type: Number, default: 0 },
    rowsOk:       { type: Number, default: 0 },
    rowsDup:      { type: Number, default: 0 },
    rowsBad:      { type: Number, default: 0 },
    fromTs:       { type: Date },
    toTs:         { type: Date },
    configVersion:{ type: String }, // optional tag
    status:       { type: String, enum:['queued','done','error'], default:'done' },
    error:        { type: String },
  },
  { timestamps: true }
);

export default models.ImportJob || model('ImportJob', ImportJobSchema);
