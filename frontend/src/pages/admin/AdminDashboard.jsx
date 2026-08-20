import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiClipboard,
  FiHelpCircle,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4 p-5">
    <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white ${color}`}>
      {icon}
    </span>
    <div>
      <p className="text-2xl font-bold text-ink">{value ?? "-"}</p>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [roleFilter, setRoleFilter] = useState("teacher");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    const { data } = await api.get("/admin/summary");
    setSummary(data);
  };

  const loadUsers = async (role) => {
    const { data } = await api.get(`/admin/users?role=${role}`);
    setUsers(data);
  };

  const loadCourses = async () => {
    const { data } = await api.get("/courses");
    setCourses(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadSummary(), loadUsers(roleFilter), loadCourses()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers(roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const toggleActive = async (id) => {
    await api.put(`/admin/users/${id}/toggle-active`);
    loadUsers(roleFilter);
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers(roleFilter);
    loadSummary();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome, {user?.name} 👋</h1>
      <p className="text-ink/60">Here's what's happening across your LMS today.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<FiUsers />} label="Teachers" value={summary.teachers} color="bg-indigo" />
        <StatCard icon={<FiUsers />} label="Students" value={summary.students} color="bg-violet" />
        <StatCard icon={<FiBookOpen />} label="Courses" value={summary.courses} color="bg-amber" />
        <StatCard icon={<FiClipboard />} label="Assignments" value={summary.assignments} color="bg-emerald" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Users management */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Manage Users</h2>
            <div className="flex gap-2">
              {["teacher", "student", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                    roleFilter === r ? "bg-indigo text-white" : "bg-indigo/10 text-indigo"
                  }`}
                >
                  {r}s
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-indigo-light/20 text-ink/50">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Mobile</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-indigo-light/10">
                    <td className="py-2 font-medium text-ink">{u.name}</td>
                    <td className="py-2 text-ink/70">{u.email}</td>
                    <td className="py-2 text-ink/70">{u.mobile}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.isActive ? "bg-emerald/10 text-emerald" : "bg-red-50 text-red-500"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => toggleActive(u._id)} title="Toggle active" className="text-indigo">
                          {u.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        </button>
                        <button onClick={() => deleteUser(u._id)} title="Delete" className="text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-ink/50">
                      No {roleFilter}s found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses overview */}
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink">All Courses</h2>
          <div className="mt-4 space-y-3">
            {courses.map((c) => (
              <div key={c._id} className="rounded-xl border border-indigo-light/20 p-3">
                <p className="font-semibold text-ink">{c.title}</p>
                <p className="text-xs text-ink/50">Teacher: {c.teacher?.name || "Unassigned"}</p>
                <p className="text-xs text-ink/50">{c.students?.length || 0} students enrolled</p>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-ink/50">No courses created yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
