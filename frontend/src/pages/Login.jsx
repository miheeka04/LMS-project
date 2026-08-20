import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const roleOptions = [
  { key: "student", label: "Student", icon: <FaUserGraduate /> },
  { key: "teacher", label: "Teacher", icon: <FaChalkboardTeacher /> },
  { key: "admin", label: "Admin", icon: <FaUserShield /> },
];

const dashboardPath = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

const Login = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      loginWithToken(data.token, data.user);
      navigate(dashboardPath[data.user.role]);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2">
      <div className="card mx-auto w-full max-w-md p-8 shadow-soft order-2 md:order-1">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">
          New here?{" "}
          <Link to="/register" className="font-semibold text-indigo hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {roleOptions.map((r) => (
            <button
              type="button"
              key={r.key}
              onClick={() => setForm({ ...form, role: r.key })}
              className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                form.role === r.key
                  ? "border-indigo bg-indigo/10 text-indigo shadow-sm"
                  : "border-indigo-light/30 text-ink/60 hover:border-indigo/40"
              }`}
            >
              <span className="text-lg">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="input-field px-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-indigo"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <div className="relative hidden overflow-hidden rounded-xl2 bg-gradient-to-br from-violet via-indigo to-blue-600 p-10 text-white md:block order-1 md:order-2">
        <div className="absolute -right-14 -bottom-14 h-56 w-56 rounded-full bg-white/10" />
        <h2 className="relative font-display text-3xl font-bold leading-snug">
          Pick up right where you left off.
        </h2>
        <p className="relative mt-4 text-white/85">
          Courses, assignments, quizzes and progress — all waiting for you
          the moment you log back in.
        </p>
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
          alt="Online classroom"
          className="relative mt-8 w-full rounded-xl2 shadow-2xl ring-4 ring-white/20"
        />
      </div>
    </div>
  );
};

export default Login;
