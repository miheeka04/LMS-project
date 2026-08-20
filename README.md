# EduSphere — Learning Management System (MERN Stack)

A complete full-stack LMS with **Admin**, **Teacher**, and **Student** roles,
built with **React (Vite) + simple CSS** on the frontend and
**Node.js + Express + MongoDB** on the backend.

This matches the project synopsis: registration/login, course management,
study material uploads, assignments, quizzes, attendance, progress
tracking, and announcements — with secure JWT + bcrypt authentication
(no OTP / email verification step — register and you're straight in).

---

## 1. What's inside

```
lms-project/
├── backend/           Node.js + Express + MongoDB API
└── frontend/          React (Vite) + Tailwind CSS UI
```

**Tech stack**
- Frontend: React 18, React Router, simple CSS, Axios, Vite
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt password hashing (no OTP)

**Roles & dashboards**
- **Admin** — manage teachers/students, view all courses, system reports
- **Teacher** — create courses, upload materials, create assignments &
  quizzes, grade submissions, post announcements, mark attendance
- **Student** — enroll in courses, view materials, submit assignments,
  attempt quizzes (auto-graded), track results, view announcements

---

## 2. Prerequisites

Install these on your computer first:

1. **Node.js** (v18 or newer) → https://nodejs.org
2. **MongoDB** — either:
   - Install locally → https://www.mongodb.com/try/download/community, or
   - Use a free cloud database → https://www.mongodb.com/cloud/atlas (recommended, no install needed)

---

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Now open `.env` and fill in:

- `MONGO_URI` — your MongoDB connection string
  - Local: `mongodb://127.0.0.1:27017/lms`
  - Atlas: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/lms`
- `JWT_SECRET` — any long random string

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. You should see:
```
MongoDB connected: ...
Server running on http://localhost:5000
```

---

## 4. Frontend setup

Open a **new terminal window** (keep the backend running):

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` already points to `http://localhost:5000/api`, which
matches the backend above — no changes needed unless you deploy elsewhere.

Start the frontend:

```bash
npm run dev
```

Open the app at **http://localhost:5173**

---

## 5. Using the app

1. Go to the **Home page** → click **"Get Started"** (or **Login** if you
   already have an account) — both links are available from the home page
   and the top navbar.
2. On **Register**, pick a role (Student / Teacher / Admin), fill in your
   name, email, mobile number, password and confirm password, then submit.
3. You're logged in immediately and redirected to your role's dashboard —
   no verification step needed.
4. Next time, use **Login**, pick your role, and sign in with your email/password.

**Typical workflow to try everything out:**
1. Register a **Teacher** account → create a course → upload a material,
   an assignment, and a quiz.
2. Register a **Student** account → go to "My Courses" → enroll in the
   teacher's course → view materials, submit the assignment, attempt the quiz.
3. Register an **Admin** account → view the dashboard to see teacher/student
   counts, manage user accounts, and see all courses.

---

## 6. Project structure (backend)

```
backend/
├── config/db.js              MongoDB connection
├── models/                   User, Course, Material, Assignment,
│                              Submission, Quiz, QuizAttempt,
│                              Announcement, Attendance
├── middleware/auth.js        JWT auth + role-based access control
├── routes/
│   ├── authRoutes.js         register / login / me
│   ├── courseRoutes.js       courses, materials, announcements, attendance
│   ├── assignmentRoutes.js   assignments, submissions, grading
│   ├── quizRoutes.js         quizzes, attempts, auto-grading, results
│   └── adminRoutes.js        user management, system summary
└── server.js                 App entry point
```

## 7. Project structure (frontend)

```
frontend/src/
├── api/axios.js              Axios instance with JWT auto-attach
├── context/AuthContext.jsx   Global auth state
├── components/               Navbar, ProtectedRoute
├── pages/
│   ├── Home.jsx               Landing page (links to Login/Register)
│   ├── Login.jsx               Role-based login
│   ├── Register.jsx            Registration (email, mobile, role, password)
│   ├── admin/AdminDashboard.jsx
│   ├── teacher/TeacherDashboard.jsx
│   └── student/StudentDashboard.jsx
└── App.jsx                    Routes
```

---

## 8. Deploying it live (optional)

- **Backend** → Render, Railway, or any Node host. Set the same environment
  variables as your local `.env` (use MongoDB Atlas for the database).
- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed
  backend's URL (e.g. `https://your-api.onrender.com/api`).
- Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL
  so CORS allows it.

---

## 9. Troubleshooting

- **"MongoDB connection error"** → check `MONGO_URI` in `backend/.env` is
  correct and MongoDB is running (or your Atlas IP allowlist includes your
  current IP / `0.0.0.0/0` for testing).
- **CORS errors in browser console** → make sure `CLIENT_URL` in
  `backend/.env` matches the URL the frontend runs on.
- **"Route not found" on refresh after deploying frontend** → configure
  your host to redirect all routes to `index.html` (standard SPA rewrite rule).
- **"Invalid email or password" on login** → make sure you selected the
  same role you registered with (an account is tied to one role).
