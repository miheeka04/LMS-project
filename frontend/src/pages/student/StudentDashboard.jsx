import React, { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiUploadCloud,
  FiClipboard,
  FiHelpCircle,
  FiBell,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const tabs = [
  { key: "courses", label: "My Courses", icon: <FiBookOpen /> },
  { key: "materials", label: "Materials", icon: <FiUploadCloud /> },
  { key: "assignments", label: "Assignments", icon: <FiClipboard /> },
  { key: "quizzes", label: "Quizzes", icon: <FiHelpCircle /> },
  { key: "results", label: "My Results", icon: <FiBarChart2 /> },
  { key: "announcements", label: "Announcements", icon: <FiBell /> },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const load = async () => {
    const { data } = await api.get("/courses");
    setAllCourses(data);
    const mine = data.filter((c) => c.students?.some((s) => s === user._id || s?._id === user._id));
    setMyCourses(mine);
    if (!selectedCourse && mine.length) setSelectedCourse(mine[0]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enroll = async (id) => {
    await api.post(`/courses/${id}/enroll`);
    load();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back, {user?.name} 🎓</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === t.key ? "bg-indigo text-white shadow-soft" : "bg-white text-ink/60 border border-indigo-light/20"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {["materials", "assignments", "quizzes", "announcements"].includes(activeTab) && (
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-ink/60">Course:</span>
          <select
            value={selectedCourse?._id || ""}
            onChange={(e) => setSelectedCourse(myCourses.find((c) => c._id === e.target.value))}
            className="input-field max-w-xs"
          >
            {myCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6">
        {activeTab === "courses" && (
          <BrowseCourses allCourses={allCourses} myCourses={myCourses} enroll={enroll} userId={user._id} />
        )}
        {activeTab === "materials" &&
          (selectedCourse ? <MaterialsView course={selectedCourse} /> : <EmptyState />)}
        {activeTab === "assignments" &&
          (selectedCourse ? <AssignmentsView course={selectedCourse} /> : <EmptyState />)}
        {activeTab === "quizzes" &&
          (selectedCourse ? <QuizzesView course={selectedCourse} /> : <EmptyState />)}
        {activeTab === "results" && <ResultsView />}
        {activeTab === "announcements" &&
          (selectedCourse ? <AnnouncementsView course={selectedCourse} /> : <AllAnnouncementsView />)}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <p className="text-ink/50">Enroll in a course first from "My Courses" to see this.</p>
);

/* ------------------------------ Courses -------------------------------- */
const BrowseCourses = ({ allCourses, myCourses, enroll, userId }) => (
  <div>
    <h3 className="font-display font-bold text-ink">Enrolled Courses</h3>
    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {myCourses.map((c) => (
        <div key={c._id} className="card overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-emerald to-indigo" />
          <div className="p-5">
            <h4 className="font-display font-bold text-ink">{c.title}</h4>
            <p className="mt-1 text-sm text-ink/60">{c.description}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald">
              <FiCheckCircle /> Enrolled
            </p>
          </div>
        </div>
      ))}
      {myCourses.length === 0 && <p className="text-ink/50">You're not enrolled in any course yet.</p>}
    </div>

    <h3 className="mt-8 font-display font-bold text-ink">Available Courses</h3>
    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allCourses
        .filter((c) => !c.students?.some((s) => s === userId || s?._id === userId))
        .map((c) => (
          <div key={c._id} className="card overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-amber to-violet" />
            <div className="p-5">
              <h4 className="font-display font-bold text-ink">{c.title}</h4>
              <p className="mt-1 text-sm text-ink/60">{c.description}</p>
              <p className="mt-1 text-xs text-ink/40">By {c.teacher?.name}</p>
              <button onClick={() => enroll(c._id)} className="btn-primary mt-3 !py-2 !px-4 text-sm">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
    </div>
  </div>
);

/* ----------------------------- Materials -------------------------------- */
const MaterialsView = ({ course }) => {
  const [materials, setMaterials] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/courses/${course._id}/materials`);
      setMaterials(data);
    })();
  }, [course._id]);

  return (
    <div className="space-y-3">
      {materials.map((m) => (
        <div key={m._id} className="card p-4">
          <p className="font-semibold text-ink">
            {m.title} <span className="ml-2 rounded-full bg-indigo/10 px-2 py-0.5 text-xs text-indigo">{m.type}</span>
          </p>
          {m.content && <p className="mt-1 text-sm text-ink/60">{m.content}</p>}
          {m.fileUrl && (
            <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo underline">
              Open resource
            </a>
          )}
        </div>
      ))}
      {materials.length === 0 && <p className="text-ink/50">No materials uploaded for this course yet.</p>}
    </div>
  );
};

/* --------------------------- Assignments -------------------------------- */
const AssignmentsView = ({ course }) => {
  const [assignments, setAssignments] = useState([]);
  const [mySubs, setMySubs] = useState({});
  const [contentDraft, setContentDraft] = useState({});

  const load = async () => {
    const { data } = await api.get(`/assignments/course/${course._id}`);
    setAssignments(data);
    const subs = {};
    for (const a of data) {
      const { data: sub } = await api.get(`/assignments/${a._id}/my-submission`);
      if (sub) subs[a._id] = sub;
    }
    setMySubs(subs);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const submit = async (id) => {
    await api.post(`/assignments/${id}/submit`, { content: contentDraft[id] || "" });
    load();
  };

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const sub = mySubs[a._id];
        return (
          <div key={a._id} className="card p-4">
            <p className="font-semibold text-ink">{a.title}</p>
            <p className="mt-1 text-sm text-ink/60">{a.description}</p>
            <p className="mt-1 text-xs text-ink/50">
              Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "No due date"} · Max marks: {a.maxMarks}
            </p>

            {sub ? (
              <div className="mt-3 rounded-lg bg-cream p-3 text-sm">
                <p className="font-semibold text-emerald">Submitted ✓</p>
                <p className="mt-1 text-ink/70">{sub.content}</p>
                {sub.status === "graded" && (
                  <p className="mt-2 text-xs font-semibold text-indigo">
                    Marks: {sub.marksAwarded} / {a.maxMarks} — {sub.feedback}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Type your submission text..."
                  onChange={(e) => setContentDraft({ ...contentDraft, [a._id]: e.target.value })}
                />
                <button onClick={() => submit(a._id)} className="btn-primary mt-2 !py-2 !px-4 text-sm">
                  Submit Assignment
                </button>
              </div>
            )}
          </div>
        );
      })}
      {assignments.length === 0 && <p className="text-ink/50">No assignments for this course yet.</p>}
    </div>
  );
};

/* ----------------------------- Quizzes ----------------------------------- */
const QuizzesView = ({ course }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const load = async () => {
    const { data } = await api.get(`/quizzes/course/${course._id}`);
    setQuizzes(data);
  };
  useEffect(() => {
    load();
    setActive(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const openQuiz = async (quiz) => {
    const { data } = await api.get(`/quizzes/${quiz._id}`);
    setActive(data);
    setAnswers({});
    setResult(null);
  };

  const submitQuiz = async () => {
    const ordered = active.questions.map((q, idx) => answers[idx] ?? -1);
    const { data } = await api.post(`/quizzes/${active._id}/attempt`, { answers: ordered });
    setResult(data);
  };

  if (active) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">{active.title}</h3>
          <button onClick={() => setActive(null)} className="text-sm text-indigo hover:underline">
            ← Back to quizzes
          </button>
        </div>

        {result ? (
          <div className="mt-4 rounded-xl bg-emerald/10 p-4 text-center">
            <p className="text-lg font-bold text-emerald">
              You scored {result.score} / {result.totalQuestions}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {active.questions.map((q, idx) => (
              <div key={q._id} className="rounded-xl border border-indigo-light/20 p-4">
                <p className="font-medium text-ink">
                  {idx + 1}. {q.questionText}
                </p>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 text-sm text-ink/70">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={answers[idx] === oIdx}
                        onChange={() => setAnswers({ ...answers, [idx]: oIdx })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} className="btn-primary">
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {quizzes.map((q) => (
        <div key={q._id} className="card p-5">
          <p className="font-semibold text-ink">{q.title}</p>
          <p className="text-xs text-ink/50">{q.questions?.length || 0} questions</p>
          <button onClick={() => openQuiz(q)} className="btn-primary mt-3 !py-2 !px-4 text-sm">
            Attempt Quiz
          </button>
        </div>
      ))}
      {quizzes.length === 0 && <p className="text-ink/50">No quizzes available for this course yet.</p>}
    </div>
  );
};

/* ------------------------------ Results ----------------------------------- */
const ResultsView = () => {
  const [results, setResults] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/quizzes/results/mine");
      setResults(data);
    })();
  }, []);

  return (
    <div className="card overflow-x-auto p-6">
      <h3 className="font-display font-bold text-ink">Quiz Results</h3>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-indigo-light/20 text-ink/50">
            <th className="py-2">Quiz</th>
            <th className="py-2">Score</th>
            <th className="py-2">Attempted</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r._id} className="border-b border-indigo-light/10">
              <td className="py-2 font-medium text-ink">{r.quiz?.title}</td>
              <td className="py-2 text-ink/70">
                {r.score} / {r.totalQuestions}
              </td>
              <td className="py-2 text-ink/50">{new Date(r.attemptedAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {results.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-ink/50">
                No quiz attempts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* --------------------------- Announcements --------------------------------- */
const AnnouncementsView = ({ course }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/courses/announcements/all");
      setItems(data.filter((a) => a.course?._id === course._id));
    })();
  }, [course._id]);

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a._id} className="card p-4">
          <p className="font-semibold text-ink">{a.title}</p>
          <p className="mt-1 text-sm text-ink/60">{a.message}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-ink/50">No announcements for this course yet.</p>}
    </div>
  );
};

const AllAnnouncementsView = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/courses/announcements/all");
      setItems(data);
    })();
  }, []);

  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a._id} className="card p-4">
          <p className="font-semibold text-ink">
            {a.title} {!a.course && <span className="ml-2 rounded-full bg-amber/20 px-2 py-0.5 text-xs text-amber">Global</span>}
          </p>
          <p className="mt-1 text-sm text-ink/60">{a.message}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-ink/50">No announcements yet. Enroll in a course to see more.</p>}
    </div>
  );
};

export default StudentDashboard;
