import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const dashboardPath = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-light/20 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo to-violet text-white shadow-soft">
            <FiBookOpen size={18} />
          </span>
          <span className="font-display text-lg font-bold text-ink">
            Edu<span className="text-indigo">Sphere</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-indigo">
                Home
              </Link>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-indigo">
                Login
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                Get Started
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to={dashboardPath[user.role]}
                className="px-3 py-2 text-sm font-medium text-ink/70 hover:text-indigo"
              >
                Dashboard
              </Link>
              <span className="hidden rounded-full bg-indigo/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo sm:inline-block">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 hover:text-red-500"
              >
                <FiLogOut /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
