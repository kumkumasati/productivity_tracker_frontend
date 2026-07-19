# Questly — frontend

React + Vite frontend for the `productivity-tracker` Spring Boot backend.

## Setup

```bash
npm install
cp .env.example .env   # defaults to http://localhost:8080, edit if needed
npm run dev
```

Runs at `http://localhost:5173` — matches the backend's `CorsConfig`
(`allowedOrigins = http://localhost:5173`). Start the Spring Boot app first.

## Charts and animation

- **XP — Last 7 Days** on the Dashboard uses [Recharts](https://recharts.org)
  (`<BarChart>`), styled with a custom tooltip (`.chart-tip` in `index.css`)
  to match the app's dark theme instead of Recharts' default white box.
- **Level-up celebration** and **badge unlock animations** use
  [Framer Motion](https://www.framer.com/motion/): the Dashboard shows a
  toast + badge pulse when your computed level increases
  (`src/pages/Dashboard.jsx`), and `Achievements.jsx` staggers badges in on
  load and gives newly-earned badges a pop + gold glow
  (`.badge.just-unlocked` in `index.css`).
- The completion-rate donut on the Dashboard is still hand-rolled SVG (no
  library needed for a single ring) and animates via a CSS transition on
  `stroke-dashoffset`.

## Pages

| Route          | Backend endpoints used |
|-----------------|------------------------|
| `/login`, `/signup` | `POST /api/auth/login`, `POST /api/auth/register` (returns a JWT) |
| `/` (Dashboard)  | `GET /api/users/{userId}/tasks`, `GET /api/user-stats`, `PUT /api/users/{userId}/tasks/{id}` |
| `/quests`        | full CRUD on `/api/users/{userId}/tasks` |
| `/achievements`  | `GET /api/achievements`, `GET /api/user-achievements` |
| `/challenges`    | `GET/POST /api/challenges`, `GET/POST /api/participants` |
| `/report`        | `GET /api/weekly-reports`, `GET /api/ai/weekly-summary/{userId}` |

## Auth

`POST /api/auth/register` and `POST /api/auth/login` are the only routes
`SecurityConfig` permits without a token. Both return
`{ token, userId, username, email }`. The frontend stores `token` in
`localStorage` (`questly_token`) and `client.js` attaches it as
`Authorization: Bearer <token>` on every other request. A 401 response
clears the stored token so `ProtectedRoute` bounces the user back to
`/login`.

## Known limitations (backend, not this app)

1. **No pagination or filtering on any endpoint.** Achievements, XP logs,
   user-stats, challenges, and participants are all fetched in full and
   filtered client-side by `userId`. Fine for a prototype/small dataset;
   won't scale — add query params (e.g. `?userId=`) or scoped paths
   (like `TaskController` already does) if the dataset grows.

3. **OpenAI key exposure** — see the note from earlier: rotate the key in
   `application.properties` and load it from an environment variable
   instead of committing it.

4. **Streak calendar is illustrative.** The backend doesn't expose
   per-day activity history, only `currentStreak`/`longestStreak` counts, so
   the dashboard's calendar just lights up the most recent N days rather
   than showing real per-day data. Wire it to `DailyStatsController` if you
   want an accurate calendar.

## Design system

Colors, type, and component classes live in `src/index.css` and match the
approved prototype (`questly-prototype.html`) — dark ink-navy base,
gold/coral/teal/periwinkle accents, Bricolage Grotesque for display type,
IBM Plex Mono for stats/XP numbers.
