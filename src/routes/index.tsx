import { createFileRoute } from "@tanstack/react-router";
import { HabitTracker } from "@/components/habit-tracker";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Habit Tracker — Build streaks, one day at a time" },
      {
        name: "description",
        content:
          "A simple weekly habit tracker. Add habits, tick them off each day, and watch your streaks grow.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <HabitTracker />
    </main>
  );
}
