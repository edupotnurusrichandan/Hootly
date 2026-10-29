export function isBedtimeReminderDue(now: Date, bedtimeHour: number): boolean {
  if (!Number.isFinite(bedtimeHour) || bedtimeHour < 0 || bedtimeHour > 24) return false;
  const hour = Math.floor(bedtimeHour);
  if (hour === 24) return now.getHours() < 5;
  if (hour < 5) return now.getHours() >= hour && now.getHours() < 5;
  return now.getHours() >= hour || now.getHours() < 5;
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function bedtimeReminderKey(date: Date): string {
  const bedtimeDate = new Date(date);
  if (date.getHours() < 5) bedtimeDate.setDate(bedtimeDate.getDate() - 1);
  return localDateKey(bedtimeDate);
}
