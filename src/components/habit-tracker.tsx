"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Flame, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  addDays,
  currentStreak,
  formatRange,
  type Habit,
  isSameDay,
  loadHabits,
  saveHabits,
  startOfWeek,
  toKey,
  weekDays,
} from "@/lib/habits";

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function HabitTracker() {
  const [hydrated, setHydrated] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [today, setToday] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    const now = new Date();
    setToday(now);
    setWeekStart(startOfWeek(now));
    setHabits(loadHabits());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveHabits(habits);
  }, [habits, hydrated]);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(today));

  function addHabit() {
    const name = newName.trim();
    if (!name) return;
    setHabits((h) => [...h, { id: uid(), name, createdAt: toKey(today), checks: {} }]);
    setNewName("");
  }

  function toggleCheck(habitId: string, day: Date) {
    const key = toKey(day);
    setHabits((hs) =>
      hs.map((h) =>
        h.id !== habitId
          ? h
          : {
              ...h,
              checks: { ...h.checks, [key]: !h.checks[key] },
            },
      ),
    );
  }

  function deleteHabit(id: string) {
    setHabits((hs) => hs.filter((h) => h.id !== id));
  }

  function startRename(h: Habit) {
    setEditingId(h.id);
    setEditingValue(h.name);
  }

  function commitRename() {
    if (!editingId) return;
    const name = editingValue.trim();
    if (name) {
      setHabits((hs) => hs.map((h) => (h.id === editingId ? { ...h, name } : h)));
    }
    setEditingId(null);
    setEditingValue("");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Habits
        </h1>
        <p className="text-sm text-muted-foreground">Tick each day. Watch the streak grow.</p>
      </header>

      {/* Add habit */}
      <div className="mb-6 flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHabit();
            }
          }}
          placeholder="New habit — e.g. Read 30 min"
          aria-label="New habit name"
          className="h-11"
        />
        <Button type="button" size="lg" disabled={!newName.trim()} onClick={addHabit}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Week nav */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            <ChevronRight />
          </Button>
          <span className="ml-2 text-sm font-medium text-foreground">{formatRange(weekStart)}</span>
        </div>
        {!isCurrentWeek && (
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(today))}>
            This week
          </Button>
        )}
      </div>

      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header row */}
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,minmax(2rem,1fr))_3.5rem] items-center gap-1 border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground sm:gap-2 sm:px-4">
            <div className="truncate">Habit</div>
            {days.map((d) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={toKey(d)}
                  className={cn(
                    "flex flex-col items-center leading-tight",
                    isToday && "text-primary",
                  )}
                >
                  <span className="hidden sm:block">{DOW_LABELS[(d.getDay() + 6) % 7]}</span>
                  <span className="sm:hidden">{DOW_LABELS[(d.getDay() + 6) % 7][0]}</span>
                  <span
                    className={cn("mt-0.5 text-[11px] tabular-nums", isToday && "font-semibold")}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-end pr-1">
              <Flame className="size-3.5" aria-label="Streak" />
            </div>
          </div>

          {/* Habit rows */}
          <ul>
            {habits.map((h) => {
              const streak = currentStreak(h, today);
              return (
                <li
                  key={h.id}
                  className="group grid grid-cols-[minmax(0,1fr)_repeat(7,minmax(2rem,1fr))_3.5rem] items-center gap-1 border-b border-border px-3 py-2 last:border-b-0 sm:gap-2 sm:px-4"
                >
                  <div className="flex min-w-0 items-center gap-1">
                    {editingId === h.id ? (
                      <input
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditingValue("");
                          }
                        }}
                        className="w-full min-w-0 rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Rename habit"
                      />
                    ) : (
                      <button
                        onClick={() => startRename(h)}
                        className="truncate rounded px-1 py-0.5 text-left text-sm font-medium text-foreground hover:bg-muted"
                        title="Click to rename"
                      >
                        {h.name}
                      </button>
                    )}
                    <button
                      onClick={() => deleteHabit(h.id)}
                      aria-label={`Delete ${h.name}`}
                      className="ml-auto rounded p-1 text-muted-foreground/60 transition hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  {days.map((d) => {
                    const key = toKey(d);
                    const checked = !!h.checks[key];
                    const isToday = isSameDay(d, today);
                    return (
                      <div key={key} className="flex items-center justify-center">
                        <button
                          onClick={() => toggleCheck(h.id, d)}
                          aria-label={`${checked ? "Uncheck" : "Check"} ${h.name} on ${key}`}
                          aria-pressed={checked}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-md border transition",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            checked
                              ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                              : "border-border bg-background hover:border-primary/60 hover:bg-accent",
                            isToday && !checked && "ring-1 ring-primary/40",
                          )}
                        >
                          {checked && (
                            <Check
                              className="size-4 animate-in zoom-in-50 duration-150"
                              strokeWidth={3}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 pr-1 text-sm tabular-nums",
                      streak > 0 ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {streak > 0 && <Flame className="size-3.5 text-primary" />}
                    <span className="font-medium">{streak}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Plus className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">No habits yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your first habit above — something small and daily, like
        <span className="text-foreground"> "Read 30 min"</span> or
        <span className="text-foreground"> "Stretch"</span>.
      </p>
    </div>
  );
}
