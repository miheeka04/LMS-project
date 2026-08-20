import React from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiUsers,
  FiAward,
  FiBarChart2,
  FiUploadCloud,
  FiBell,
} from "react-icons/fi";

const features = [
  { icon: <FiUploadCloud />, title: "Study Materials", desc: "Teachers upload notes, PDFs and videos in one click." },
  { icon: <FiBookOpen />, title: "Assignments & Quizzes", desc: "Create, submit and auto-grade coursework online." },
  { icon: <FiBarChart2 />, title: "Progress Tracking", desc: "Students track scores and growth over time." },
  { icon: <FiBell />, title: "Announcements", desc: "Never miss an update from your teacher or admin." },
  { icon: <FiUsers />, title: "Attendance", desc: "Mark and monitor attendance for every class." },
  { icon: <FiAward />, title: "Secure Access", desc: "Encrypted passwords and JWT auth keep every role's data safe." },
];

const roles = [
  {
    key: "admin",
    title: "Admin",
    desc: "Oversee teachers, students, courses and system reports.",
    color: "from-violet to-indigo",
  },
  {
    key: "teacher",
    title: "Teacher",
    desc: "Manage courses, upload content, grade student work.",
    color: "from-indigo to-indigo-light",
  },
  {
    key: "student",
    title: "Student",
    desc: "Learn, submit assignments, attempt quizzes, track progress.",
    color: "from-amber to-violet",
  },
];

const Home = () => {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
              Learning Management System
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-5xl">
              One platform for teaching, learning and everything in between.
            </h1>
            <p className="mt-5 max-w-lg text-white/85">
              EduSphere brings admins, teachers and students together — course
              content, assignments, quizzes, attendance and progress, all in
              one secure, easy-to-use place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-accent">
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Login to Continue
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="card-glow absolute -inset-6 rounded-xl2" />
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
              alt="Students learning online"
              className="relative rounded-xl2 shadow-2xl ring-4 ring-white/20"
            />
          </div>
        </div>
      </section>

      {/* ROLE CARDS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-ink md:text-3xl">
          Built for every role in your classroom
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">
          Pick your role at registration — each dashboard is tailored to what
          you actually need to do.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div key={r.key} className="card overflow-hidden">
              <div className={`h-2 w-full bg-gradient-to-r ${r.color}`} />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-ink">{r.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{r.desc}</p>
                <Link
                  to="/register"
                  className="mt-4 inline-block text-sm font-semibold text-indigo hover:underline"
                >
                  Register as {r.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-2xl font-bold text-ink md:text-3xl">
            Everything you need to run a course online
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo/10 text-xl text-indigo">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display font-semibold text-ink">{f.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="card-glow relative overflow-hidden rounded-xl2 bg-gradient-to-r from-indigo to-violet p-10 text-center text-white">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            Create your free account in under a minute and jump straight into your dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/register" className="btn-accent">
              Register Now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-indigo-light/20 py-8 text-center text-sm text-ink/50">
        © {new Date().getFullYear()} EduSphere LMS. Built with React, Node.js, Express & MongoDB.
      </footer>
    </div>
  );
};

export default Home;
