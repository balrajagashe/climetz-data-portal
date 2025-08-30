// lib/models.ts
import { Schema, model, models, Types } from 'mongoose';

/** USERS */
const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, index: true },
  // IMPORTANT: aligned with Admin portal (bcrypt hash)
  passwordHash: { type: String },
  role: { type: String, enum: ['user','admin','superadmin'], default: 'user', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  // Data Portal uses this to filter what a user can see
  assignedLocations: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

/** CLIENTS */
const ClientSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, index: true },
  contact: { type: Object },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/** LOCATIONS */
const LocationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true, required: true },
  name: { type: String, required: true },
  code: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/** DEVICES */
const DeviceSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true, required: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', index: true, required: true },
  name: { type: String, required: true },
  code: { type: String },
  imei: { type: String, index: true },
  type: { type: String },   // optional: logger/gateway/etc
  status: { type: String, enum: ['active','inactive','maintenance'], default: 'active' },
  model: { type: String },
  serialNo: { type: String },
  installDate: { type: Date },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/** SENSORS */
const SensorSchema = new Schema({
  deviceId: { type: Schema.Types.ObjectId, ref: 'Device', index: true, required: true },
  name: { type: String, required: true },         // <-- added
  type: { type: String, required: true },         // e.g., radar_level, aws, raingauge, soil_moisture
  unit: { type: String },                         // e.g., m, mm, °C, %
  depth: { type: Number },                        // optional for soil sensors
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/** SENSOR DATA (optional for later) */
const SensorDataSchema = new Schema({
  sensorId: { type: Schema.Types.ObjectId, ref: 'Sensor', index: true },
  timestamp: { type: Date, index: true },
  metrics: Schema.Types.Mixed, // e.g., { level_m: 2.31 } or { rain_mm: 1.2 }
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
export const Client = models.Client || model('Client', ClientSchema);
export const Location = models.Location || model('Location', LocationSchema);
export const Device = models.Device || model('Device', DeviceSchema);
export const Sensor = models.Sensor || model('Sensor', SensorSchema);
export const SensorData = models.SensorData || model('SensorData', SensorDataSchema);

export type Id = string | Types.ObjectId;
