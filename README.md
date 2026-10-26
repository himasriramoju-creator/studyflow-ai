# StudyFlow AI - Smart Study Planner & Task Prioritizer

A modern, full-stack AI Study Planner designed for college students to organize coursework, assignments, laboratory work, projects, and examinations. Intelligently calculates which task to complete first using a normalized mathematical algorithm that analyzes deadline urgency, importance, difficulty, and available study hours.

## 🚀 Key Features

1. **Explainable Multi-Factor Prioritizer**:
   - Computes a transparent 0–100 priority score using the formula:
     $$\text{Priority Score} = (0.40 \times \text{Urgency}) + (0.30 \times \text{Importance}) + (0.20 \times \text{Difficulty}) + (0.10 \times \text{Time Fit})$$
   - Real-time **Algorithm Weights Tuner** allowing students and evaluators to adjust weights and instantly inspect score recalculation.
   - Explainable breakdown showing exact points contributed by each factor.
   - Optional Gemini AI integration (`gemini-3.8-flash`) for deep-dive strategic micro-action steps.

2. **Personalized Daily Study Planner**:
   - Generates realistic, balanced daily study timelines based on start time, end time, session length, and break duration.
   - Detects workload overload when total remaining demand exceeds daily capacity.
   - Integrated Pomodoro focus timer to launch deep work sessions directly from the timeline.

3. **Academic Calendar**:
   - Monthly calendar grid with color-coded assignments, examinations, projects, and revision tasks.
   - Upcoming deadlines widget with countdown urgency indicators.

4. **Study Analytics**:
   - Recharts data visualization: weekly study hours bar chart, task completion donut chart, subject progress breakdown, and on-time completion rates.

5. **Gamification & Motivation**:
   - Daily study streak tracker (`🔥`).
   - Task completion points (+50 pts for assignments, +100 pts for examinations).
   - Milestone achievement badges with celebratory confetti effects.

6. **Full-Stack Authentication & Security**:
   - Real password hashing with `bcrypt`.
   - JWT session management.
   - 1-Click "Demo College Student" login for instant capstone evaluation.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Canvas-Confetti.
- **Integrated Full-Stack Server**: Node.js / Express (`server.ts`) on port 3000, Vite middleware, JSON database persistence, JWT authorization, Gemini 3.8 Flash SDK.
- **Python Backend Engine**: FastAPI, SQLAlchemy, Pydantic, Python unit tests (`backend/`).

---

## 📂 Project Architecture

```
studyflow-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # SQLAlchemy SQLite / PostgreSQL session
│   │   ├── models.py            # SQLAlchemy models (User, Task, StudyPreference, Achievement)
│   │   └── schemas.py           # Pydantic validation schemas
│   ├── services/
│   │   ├── prioritization.py    # Python mathematical priority engine
│   │   ├── study_scheduler.py   # Python daily timeline generator
│   │   └── recommendations.py   # Python personalized recommendation generator
│   ├── tests/
│   │   └── test_prioritization.py # Python unittest test suite
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── assets/images/           # High-resolution generated visual assets
│   ├── components/
│   │   ├── Navbar.tsx           # 3-zone Top Bar Contract navigation
│   │   ├── Sidebar.tsx          # Responsive student workspace sidebar
│   │   ├── TaskCard.tsx         # Color-coded task card with priority scores
│   │   ├── TaskModal.tsx        # Add/edit coursework modal
│   │   ├── AIInsightModal.tsx   # Mathematical priority rationale modal
│   │   ├── WeightsModal.tsx     # Algorithm weights customizer
│   │   └── FocusTimerModal.tsx  # Pomodoro study focus session timer
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication state and demo student login
│   ├── pages/
│   │   ├── LandingPage.tsx      # Animated landing page with live algorithm sandbox
│   │   ├── LoginPage.tsx        # Login page with demo 1-click button
│   │   ├── SignupPage.tsx       # Signup page with password strength meter
│   │   ├── DashboardPage.tsx    # 6 real metric cards, queue, next task hero
│   │   ├── TasksPage.tsx        # Task search, filtering, and sorting
│   │   ├── PlannerPage.tsx      # Configurable daily study schedule timeline
│   │   ├── CalendarPage.tsx     # Monthly calendar with color-coded categories
│   │   ├── AnalyticsPage.tsx    # Recharts analytics dashboard
│   │   └── SettingsPage.tsx     # Preferences, security, and demo data
│   ├── services/
│   │   ├── api.ts               # Frontend API client
│   │   └── prioritizer.ts       # TypeScript prioritization and scheduling engine
│   ├── types/
│   │   └── index.ts             # Data models and interfaces
│   ├── App.tsx
│   └── main.tsx
├── data/
│   └── db.json                  # Persistent file-based database
├── server.ts                    # Full-stack Node.js server running on port 3000
└── metadata.json
```

---

## 🧪 Testing the Algorithms

To run the Python unit tests for the prioritization and scheduling engine:

```bash
python3 -m unittest backend/tests/test_prioritization.py
```

All 4 unit tests verify:
1. Overdue tasks automatically receive maximum urgency (100.0).
2. Distant deadlines scale down gracefully.
3. Importance weights correctly boost critical exams over low-priority readings.
4. Daily study schedule accurately distributes tasks and detects overload capacity.

---

## 💻 Local Development

### Running the Full-Stack Application:

```bash
npm run dev
```

Visit `http://localhost:3000` to interact with the application.
