// Tiny date helpers for the seed script (no external deps).
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function subHours(date: Date, hours: number): Date {
  return addHours(date, -hours);
}

export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export function setHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(hours, 0, 0, 0);
  return d;
}

export function setMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(minutes, 0, 0);
  return d;
}