export const HOSPITAL_CONSULTATION_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
] as const;

export type ConsultationSlot = (typeof HOSPITAL_CONSULTATION_SLOTS)[number];

export function normalizeSlotTime(slot: string): string {
  if (!slot) return '';
  const trimmed = slot.trim();
  // If in range format like "10:00 AM - 11:00 AM", extract the start time
  const parts = trimmed.split('-');
  const timePart = parts[0].trim();

  // Check direct case-insensitive match
  const directMatch = HOSPITAL_CONSULTATION_SLOTS.find(
    (s) => s.toLowerCase() === timePart.toLowerCase()
  );
  if (directMatch) return directMatch;

  // Handle single-digit hour: e.g. "9:00 AM" -> "09:00 AM"
  const m = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    const hh = m[1].padStart(2, '0');
    const mm = m[2];
    const ampm = m[3].toUpperCase();
    const formatted = `${hh}:${mm} ${ampm}`;
    const found = HOSPITAL_CONSULTATION_SLOTS.find((s) => s === formatted);
    if (found) return found;
    return formatted;
  }

  return timePart;
}

export function isSlotInPast(dateStr: string, slotStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = new Date().toISOString().slice(0, 10);
  if (dateStr < todayStr) {
    return true;
  }
  if (dateStr > todayStr) {
    return false;
  }

  // If same day, compare hour and minute
  const normalized = normalizeSlotTime(slotStr);
  const m = normalized.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return false;

  let slotHour = parseInt(m[1], 10);
  const slotMin = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();

  if (ampm === 'PM' && slotHour !== 12) slotHour += 12;
  if (ampm === 'AM' && slotHour === 12) slotHour = 0;

  const now = new Date();
  const nowHour = now.getHours();
  const nowMin = now.getMinutes();

  if (slotHour < nowHour) return true;
  if (slotHour === nowHour && slotMin < nowMin) return true;
  return false;
}
