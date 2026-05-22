# Answers

## 1. How to run
To run the project on a fresh machine, you need to have Node.js and `npm` (or `bun`) installed.
1. Clone the repository and navigate into it.
2. Run `npm install` (or `bun install`) to install the dependencies.
3. Run `npm run dev` (or `bun dev`) to start the local development server.
4. Open the provided localhost URL (typically `http://localhost:5173`) in your browser.

## 2. Stack & design choices
**Stack:** I used React with Vite and Tailwind CSS. I picked this stack because React's component model and state management are perfectly suited for the interactive grid of a habit tracker, while Vite provides an incredibly fast feedback loop during development. Tailwind CSS allows for rapid, consistent styling without context switching.

**Design decisions:**
1. **Grid Layout Scaling:** I used CSS Grid with `minmax` columns for the habit rows. This ensures that the habit name takes up remaining space (`minmax(0, 1fr)`) while the days and streak counters maintain fixed, readable widths (`minmax(2rem, 1fr)`). This prevents the UI from breaking or overflowing as habits are added.
2. **Checkmark Animation:** I added a micro-animation (zoom-in) the moment a checkmark is ticked. A habit tracker needs to feel rewarding. A sudden appearance is jarring, but a quick `duration-150` zoom-in makes checking off a habit satisfying and dynamic.

## 3. Responsive & accessibility
**Responsive:** On a 360px-wide phone, the day labels are truncated to single letters (M, T, W), and the horizontal padding is reduced to maximize space for the checkmarks. The delete button also becomes always visible instead of appearing on hover. On a 1440px laptop, the full day abbreviations (Mon, Tue) are shown, and the UI has comfortable breathing room with larger max-widths.

**Accessibility:** 
- **Handled:** I ensured all interactive elements, especially the checkmark toggles, have clear `aria-label` and `aria-pressed` attributes so screen reader users know exactly what habit and day they are interacting with, and whether it's currently checked.
- **Skipped:** I knowingly skipped advanced 2D keyboard navigation (using arrow keys to move up/down/left/right within the grid like a spreadsheet). Implementing proper roving tabindex for a grid is complex, and currently users must tab sequentially through all cells, which can be tedious.

## 4. AI usage
I used AI (ChatGPT) primarily as a time-saving tool to generate the boilerplate date manipulation logic and to quickly scaffold the basic structure of the Radix UI primitives. 
**What I changed:** The AI originally gave me a standard HTML table for the weekly grid which broke heavily on mobile screens. I discarded that and manually implemented a responsive CSS Grid using `grid-cols-[minmax(0,1fr)_repeat(7,minmax(2rem,1fr))_3.5rem]`. This manual fix ensured that the habit name truncates smoothly while the checkboxes retain an exact click target size on all devices. I also fully rewrote the streak calculation logic manually, as the AI's version calculated the all-time longest streak instead of the current consecutive streak.

## 5. Honest gap
One thing that isn't polished enough is the data persistence layer. Currently, it relies on a simple `localStorage` dump. There is no schema validation or migration strategy. If the shape of the `Habit` object changes in the future, it could break the app for returning users. With another day, I would implement robust validation (using the already installed `zod` library) when parsing from `localStorage`, and add versioning to handle state migrations gracefully.

## 6. Week start day
The week starts on **Monday**. 
**Defense:** Monday is the international standard (ISO 8601) for the first day of the week. For habit tracking specifically, most people frame their goals around the workweek (Monday to Friday) followed by the weekend. Starting the visual grid on Monday aligns with this psychological weekly reset.

## 7. Streak calculation logic
The "current" streak counts up to **yesterday if today is unchecked**.
**Defense:** If a user has a habit of "Read before bed," they won't check it off until 11 PM. If the streak required today to be checked to remain active, they would see a "0" streak all day, which is highly demotivating. By allowing yesterday to carry the streak, the user is encouraged throughout the day to keep the streak alive.
