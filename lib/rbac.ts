import { Types } from 'mongoose';

type Role = 'user' | 'admin' | 'superadmin';

export function canSeeLocation(user: {role:Role, clientId?:string, assignedLocations?:any[]}, location: { _id: any, clientId:any }) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin') {
    return String(user.clientId) === String(location.clientId);
  }
  // user
  return (user.assignedLocations || []).some((id:any)=>String(id)===String(location._id));
}

export function canSeeDevice(user: any, device: any) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin') return String(user.clientId) === String(device.clientId);
  return (user.assignedLocations || []).some((locId:any)=>String(locId)===String(device.locationId));
}

export function canSeeSensor(user:any, sensor:any, device:any) {
  // sensor depends on device scope
  return canSeeDevice(user, device);
}
