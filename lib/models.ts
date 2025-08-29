// lib/models.ts
import { Schema, model, models, Types } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  // IMPORTANT: align with Admin portal -> bcrypt hash stored in "password"
  password: String,
  role: { type: String, enum: ['user','admin','superadmin'], default: 'user' },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  assignedLocations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
}, { timestamps: true });

const ClientSchema = new Schema({
  name: String, code: String, contact: Object, address: String,
  isActive: { type: Boolean, default: true }
},{ timestamps: true });

const LocationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: String, code: String, lat: Number, lon: Number, address: String,
  isActive: { type: Boolean, default: true }
},{ timestamps: true });

const DeviceSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  name: String, code: String, imei: String, type: String,
  isActive: { type: Boolean, default: true }
},{ timestamps: true });

const SensorSchema = new Schema({
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device' },
  type: String, depth: Number, unit: String,
  isActive: { type: Boolean, default: true }
},{ timestamps: true });

const SensorDataSchema = new Schema({
  sensorId: { type: Schema.Types.ObjectId, ref: 'Sensor', index: true },
  timestamp: { type: Date, index: true },
  metrics: Schema.Types.Mixed // e.g., { moisture: 23.5 } or { kwh: 1.2 }
},{ timestamps: true });

export const User = models.User || model('User', UserSchema);
export const Client = models.Client || model('Client', ClientSchema);
export const Location = models.Location || model('Location', LocationSchema);
export const Device = models.Device || model('Device', DeviceSchema);
export const Sensor = models.Sensor || model('Sensor', SensorSchema);
export const SensorData = models.SensorData || model('SensorData', SensorDataSchema);

export type Id = string | Types.ObjectId;
