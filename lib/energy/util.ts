// /lib/energy/util.ts
import dayjs from 'dayjs';

export function toYMD(d: Date): string {
  return dayjs(d).tz?.('Asia/Kolkata') ? (dayjs as any)(d).tz('Asia/Kolkata').format('YYYY-MM-DD') : dayjs(d).format('YYYY-MM-DD');
}
export function toYM(d: Date): string {
  return dayjs(d).tz?.('Asia/Kolkata') ? (dayjs as any)(d).tz('Asia/Kolkata').format('YYYY-MM') : dayjs(d).format('YYYY-MM');
}
export function floor5m(d: Date): Date {
  const t = d.getTime();
  const m5 = 5 * 60 * 1000;
  return new Date(t - (t % m5));
}
export function minutesBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}
