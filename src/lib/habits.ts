export type Habit = {
  id: string;
  name: string;
  createdAt: string; // ISO date (YYYY-MM-DD)
  checks: Record<string, boolean>; // key: YYYY-MM-DD
};

const STORAGE_KEY = "habit-tracker:v1";

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// --- Date helpers (week starts Monday) ---

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0=Sun ... 6=Sat
  const diff = (day + 6) % 7; // Mon=0
  date.setDate(date.getDate() - diff);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b);
}

export function isFuture(d: Date, today: Date): boolean {
  return toKey(d) > toKey(today);
}

/**
 * Streak: the current consecutive-day streak.
 * Counts backwards from today, or yesterday if today is unchecked.
 */
export function currentStreak(habit: Habit, today: Date): number {
  let streak = 0;
  
  const checkedKeys = Object.keys(habit.checks).filter((k) => habit.checks[k]);
  if (checkedKeys.length === 0) return 0;
  
  checkedKeys.sort();
  const maxKey = checkedKeys[checkedKeys.length - 1];
  const maxDate = fromKey(maxKey);
  
  let checkDate = maxDate > today ? maxDate : new Date(today);

  if (!habit.checks[toKey(checkDate)]) {
    checkDate = addDays(checkDate, -1);
  }

  while (habit.checks[toKey(checkDate)]) {
    streak++;
    checkDate = addDays(checkDate, -1);
  }

  return streak;
}

export function formatRange(start: Date): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const fmt = (d: Date, withMonth: boolean) =>
    withMonth
      ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : String(d.getDate());
  return sameMonth
    ? `${fmt(start, true)} – ${fmt(end, false)}, ${end.getFullYear()}`
    : `${fmt(start, true)} – ${fmt(end, true)}, ${end.getFullYear()}`;
}
