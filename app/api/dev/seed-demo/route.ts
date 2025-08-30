// app/api/dev/seed-demo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Client, Device, Location, Sensor, User } from '@/lib/models';
import bcrypt from 'bcryptjs';

const DISABLE = process.env.DISABLE_SEED === 'true';

const sensorTypes = ['radar_level', 'aws', 'raingauge', 'soil_moisture'] as const;
type SensorType = typeof sensorTypes[number];

function unitFor(type: SensorType) {
  switch (type) {
    case 'radar_level': return 'm';
    case 'aws': return '°C';
    case 'raingauge': return 'mm';
    case 'soil_moisture': return '%';
  }
}

function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIMEI() {
  // 15-digit numeric string
  let s = '';
  for (let i = 0; i < 15; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function slug(n: number) {
  return n.toString().padStart(2, '0');
}

export async function POST(_req: NextRequest) {
  if (DISABLE) return NextResponse.json({ error: 'Seeding disabled' }, { status: 403 });

  await dbConnect();

  // wipe only demo-ish things if you want a clean slate (kept simple; not deleting superadmin)
  // await Promise.all([Client.deleteMany({}), Location.deleteMany({}), Device.deleteMany({}), Sensor.deleteMany({}), User.deleteMany({ role: { $ne: 'superadmin' } })]);

  const summary: any = { clients: [], locations: [], users: [], devices: [], sensors: [] };

  // Create 2 clients
  for (let c = 1; c <= 2; c++) {
    const client = await Client.create({
      name: `Demo Client ${c}`,
      code: `CLI-${slug(c)}`,
      contact: { email: `contact${c}@demo.test` },
      address: `Address line for client ${c}`,
      isActive: true,
    });
    summary.clients.push({ id: String(client._id), name: client.name });

    // 2 locations per client
    const locs: any[] = [];
    for (let l = 1; l <= 2; l++) {
      const location = await Location.create({
        clientId: client._id,
        name: `Location ${c}.${l}`,
        code: `LOC-${slug(c)}${slug(l)}`,
        lat: 26 + Math.random(),  // NE India-ish just for demo
        lon: 92 + Math.random(),
        address: `Block ${l}, Client ${c}`,
        isActive: true,
      });
      locs.push(location);
      summary.locations.push({ id: String(location._id), name: location.name, client: client.name });

      // 1 device per location
      const device = await Device.create({
        clientId: client._id,
        locationId: location._id,
        name: `Device ${c}.${l}`,
        code: `DEV-${slug(c)}${slug(l)}`,
        imei: randomIMEI(),
        type: 'logger',
        status: 'active',
        isActive: true,
      });
      summary.devices.push({ id: String(device._id), name: device.name, location: location.name });

      // 2 sensors per device
      for (let s = 1; s <= 2; s++) {
        const type = randPick(sensorTypes);
        const sensor = await Sensor.create({
          deviceId: device._id,
          name: `${type.replace('_',' ')} ${s}`,
          type,
          unit: unitFor(type),
          depth: type === 'soil_moisture' ? (s === 1 ? 10 : 30) : undefined,
          isActive: true,
        });
        summary.sensors.push({ id: String(sensor._id), name: sensor.name, device: device.name, type });
      }
    }

    // 2 users per client (admin + viewer), assigned to this client's locations
    const adminPass = await bcrypt.hash('Admin123!', 10);
    const viewerPass = await bcrypt.hash('Viewer123!', 10);

    const adminUser = await User.findOneAndUpdate(
      { email: `admin${c}@climetz.co.in` },
      {
        name: `Admin ${c}`,
        email: `admin${c}@climetz.co.in`,
        role: 'admin',
        clientId: client._id,
        assignedLocations: locs.map((x) => x._id),
        isActive: true,
        passwordHash: adminPass,
      },
      { new: true, upsert: true }
    ).lean();

    const viewerUser = await User.findOneAndUpdate(
      { email: `viewer${c}@climetz.co.in` },
      {
        name: `Viewer ${c}`,
        email: `viewer${c}@climetz.co.in`,
        role: 'viewer',
        clientId: client._id,
        assignedLocations: [locs[0]._id], // viewer sees only first location
        isActive: true,
        passwordHash: viewerPass,
      },
      { new: true, upsert: true }
    ).lean();

    summary.users.push(
      { id: String((adminUser as any)._id), email: (adminUser as any).email, role: 'admin', client: client.name },
      { id: String((viewerUser as any)._id), email: (viewerUser as any).email, role: 'viewer', client: client.name },
    );
  }

  return NextResponse.json({
    ok: true,
    how_to_login: [
      'admin1@climetz.co.in / Admin123!',
      'viewer1@climetz.co.in / Viewer123!',
      'admin2@climetz.co.in / Admin123!',
      'viewer2@climetz.co.in / Viewer123!',
      'superadmin@climetz.co.in / SuperAdmin123! (from Admin seeds, if present)',
    ],
    summary,
  });
}
