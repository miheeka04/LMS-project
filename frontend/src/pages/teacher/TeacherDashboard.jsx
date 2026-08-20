import React, { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiUploadCloud,
  FiClipboard,
  FiHelpCircle,
  FiBell,
  FiCheckSquare,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const tabs = [
  { key: "courses", label: "My Courses", icon: <FiBookOpen /> },
  { key: "materials", label: "Materials", icon: <FiUploadCloud /> },
  { key: "assignments", label: "Assignments", icon: <FiClipboard /> },
  { key: "quizzes", label: "Quizzes", icon: <FiHelpCircle /> },
  { key: "announcements", label: "Announcements", icon: <FiBell /> },
  { key: "attendance", label: "Attendance", icon: <FiCheckSquare /> },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = async () => {
    const { data } = await api.get("/courses");
    setCourses(data);
    if (!selectedCourse && data.length) setSelectedCourse(data[0]);
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Hi {user?.name}, ready to teach? 📚</h1>

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

      {activeTab !== "courses" && (
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-ink/60">Course:</span>
          <select
            value={selectedCourse?._id || ""}
            onChange={(e) => setSelectedCourse(courses.find((c) => c._id === e.target.value))}
            className="input-field max-w-xs"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-6">
        {activeTab === "courses" && <CoursesTab courses={courses} reload={loadCourses} />}
        {activeTab === "materials" && selectedCourse && <MaterialsTab course={selectedCourse} />}
        {activeTab === "assignments" && selectedCourse && <AssignmentsTab course={selectedCourse} />}
        {activeTab === "quizzes" && selectedCourse && <QuizzesTab course={selectedCourse} />}
        {activeTab === "announcements" && selectedCourse && <AnnouncementsTab course={selectedCourse} />}
        {activeTab === "attendance" && selectedCourse && <AttendanceTab course={selectedCourse} />}
        {activeTab !== "courses" && !selectedCourse && (
          <p className="text-ink/50">Create a course first from the "My Courses" tab.</p>
        )}
      </div>
    </div>
  );
};

/* ------------------------------ Courses ------------------------------ */
const CoursesTab = ({ courses, reload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/courses", { title, description });
    setTitle("");
    setDescription("");
    reload();
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    await api.delete(`/courses/${id}`);
    reload();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={createCourse} className="card p-6">
        <h3 className="font-display font-bold text-ink">Create a new course</h3>
        <input
          className="input-field mt-4"
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input-field mt-3"
          placeholder="Short description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn-primary mt-4 w-full">
          <FiPlus /> Create Course
        </button>
      </form>

      <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <div key={c._id} className="card overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-indigo to-violet" />
            <div className="p-5">
              <h4 className="font-display font-bold text-ink">{c.title}</h4>
              <p className="mt-1 text-sm text-ink/60">{c.description || "No description yet."}</p>
              <p className="mt-3 text-xs text-ink/50">{c.students?.length || 0} students enrolled</p>
              <button
                onClick={() => deleteCourse(c._id)}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600"
              >
                <FiTrash2 /> Delete Course
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-ink/50">You haven't created any courses yet.</p>}
      </div>
    </div>
  );
};

/* ----------------------------- Materials ------------------------------ */
const MaterialsTab = ({ course }) => {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: "", type: "note", fileUrl: "", content: "" });

  const load = async () => {
    const { data } = await api.get(`/courses/${course._id}/materials`);
    setMaterials(data);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const upload = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.post(`/courses/${course._id}/materials`, form);
    setForm({ title: "", type: "note", fileUrl: "", content: "" });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/courses/materials/${id}`);
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={upload} className="card p-6">
        <h3 className="font-display font-bold text-ink">Upload material</h3>
        <input
          className="input-field mt-4"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <select
          className="input-field mt-3"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="note">Note</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="link">Link</option>
        </select>
        <input
          className="input-field mt-3"
          placeholder="File / video URL (optional)"
          value={form.fileUrl}
          onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
        />
        <textarea
          className="input-field mt-3"
          placeholder="Notes / content"
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button className="btn-primary mt-4 w-full">
          <FiPlus /> Upload
        </button>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {materials.map((m) => (
          <div key={m._id} className="card flex items-start justify-between p-4">
            <div>
              <p className="font-semibold text-ink">
                {m.title} <span className="ml-2 rounded-full bg-indigo/10 px-2 py-0.5 text-xs text-indigo">{m.type}</span>
              </p>
              {m.content && <p className="mt-1 text-sm text-ink/60">{m.content}</p>}
              {m.fileUrl && (
                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-indigo underline">
                  {m.fileUrl}
                </a>
              )}
            </div>
            <button onClick={() => remove(m._id)} className="text-red-400 hover:text-red-600">
              <FiTrash2 />
            </button>
          </div>
        ))}
        {materials.length === 0 && <p className="text-ink/50">No materials uploaded yet for this course.</p>}
      </div>
    </div>
  );
};

/* ---------------------------- Assignments ------------------------------ */
const AssignmentsTab = ({ course }) => {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxMarks: 100 });
  const [viewing, setViewing] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const load = async () => {
    const { data } = await api.get(`/assignments/course/${course._id}`);
    setAssignments(data);
  };
  useEffect(() => {
    load();
    setViewing(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.post("/assignments", { ...form, course: course._id });
    setForm({ title: "", description: "", dueDate: "", maxMarks: 100 });
    load();
  };

  const remove = async (id) => {
    await api.delete(`/assignments/${id}`);
    load();
  };

  const viewSubmissions = async (assignment) => {
    setViewing(assignment);
    const { data } = await api.get(`/assignments/${assignment._id}/submissions`);
    setSubmissions(data);
  };

  const grade = async (submissionId, marksAwarded, feedback) => {
    await api.put(`/assignments/submissions/${submissionId}/grade`, { marksAwarded, feedback });
    viewSubmissions(viewing);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={create} className="card p-6">
        <h3 className="font-display font-bold text-ink">Create assignment</h3>
        <input
          className="input-field mt-4"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input-field mt-3"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="date"
          className="input-field mt-3"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
        <input
          type="number"
          className="input-field mt-3"
          placeholder="Max marks"
          value={form.maxMarks}
          onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
        />
        <button className="btn-primary mt-4 w-full">
          <FiPlus /> Create
        </button>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {assignments.map((a) => (
          <div key={a._id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">{a.title}</p>
                <p className="mt-1 text-sm text-ink/60">{a.description}</p>
                <p className="mt-1 text-xs text-ink/50">
                  Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "No due date"} · Max marks: {a.maxMarks}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => viewSubmissions(a)} className="text-xs font-semibold text-indigo hover:underline">
                  View Submissions
                </button>
                <button onClick={() => remove(a._id)} className="text-red-400 hover:text-red-600">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {viewing?._id === a._id && (
              <div className="mt-4 space-y-2 border-t border-indigo-light/20 pt-3">
                {submissions.map((s) => (
                  <div key={s._id} className="rounded-lg bg-cream p-3 text-sm">
                    <p className="font-semibold text-ink">{s.student?.name}</p>
                    <p className="text-ink/60">{s.content}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Marks"
                        defaultValue={s.marksAwarded ?? ""}
                        className="input-field w-24 !py-1"
                        id={`marks-${s._id}`}
                      />
                      <input
                        placeholder="Feedback"
                        defaultValue={s.feedback}
                        className="input-field flex-1 !py-1"
                        id={`feedback-${s._id}`}
                      />
                      <button
                        onClick={() =>
                          grade(
                            s._id,
                            document.getElementById(`marks-${s._id}`).value,
                            document.getElementById(`feedback-${s._id}`).value
                          )
                        }
                        className="btn-primary !py-1.5 !px-3 text-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && <p className="text-ink/50 text-sm">No submissions yet.</p>}
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && <p className="text-ink/50">No assignments created yet.</p>}
      </div>
    </div>
  );
};

/* ------------------------------- Quizzes -------------------------------- */
const QuizzesTab = ({ course }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 },
  ]);

  const load = async () => {
    const { data } = await api.get(`/quizzes/course/${course._id}`);
    setQuizzes(data);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const updateQuestion = (idx, field, value) => {
    const copy = [...questions];
    copy[idx][field] = value;
    setQuestions(copy);
  };
  const updateOption = (qIdx, oIdx, value) => {
    const copy = [...questions];
    copy[qIdx].options[oIdx] = value;
    setQuestions(copy);
  };
  const addQuestion = () =>
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);

  const createQuiz = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/quizzes", { course: course._id, title, questions });
    setTitle("");
    setQuestions([{ questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 }]);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/quizzes/${id}`);
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={createQuiz} className="card p-6 lg:col-span-2">
        <h3 className="font-display font-bold text-ink">Create quiz</h3>
        <input
          className="input-field mt-4"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {questions.map((q, idx) => (
          <div key={idx} className="mt-4 rounded-xl border border-indigo-light/20 p-4">
            <input
              className="input-field"
              placeholder={`Question ${idx + 1}`}
              value={q.questionText}
              onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={q.correctOptionIndex === oIdx}
                    onChange={() => updateQuestion(idx, "correctOptionIndex", oIdx)}
                  />
                  <input
                    className="input-field !py-1.5"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-ink/40">Select the radio button next to the correct option.</p>
          </div>
        ))}

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={addQuestion} className="btn-accent !py-2 !px-4 text-sm">
            <FiPlus /> Add Question
          </button>
          <button type="submit" className="btn-primary !py-2 !px-4 text-sm">
            Save Quiz
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {quizzes.map((q) => (
          <div key={q._id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink">{q.title}</p>
              <button onClick={() => remove(q._id)} className="text-red-400 hover:text-red-600">
                <FiTrash2 />
              </button>
            </div>
            <p className="text-xs text-ink/50">{q.questions?.length || 0} questions</p>
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-ink/50">No quizzes yet.</p>}
      </div>
    </div>
  );
};

/* --------------------------- Announcements ------------------------------ */
const AnnouncementsTab = ({ course }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });

  const load = async () => {
    const { data } = await api.get("/courses/announcements/all");
    setAnnouncements(data.filter((a) => a.course?._id === course._id));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id]);

  const post = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await api.post("/courses/announcements", { ...form, course: course._id });
    setForm({ title: "", message: "" });
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={post} className="card p-6">
        <h3 className="font-display font-bold text-ink">Post announcement</h3>
        <input
          className="input-field mt-4"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input-field mt-3"
          placeholder="Message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button className="btn-primary mt-4 w-full">
          <FiPlus /> Post
        </button>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {announcements.map((a) => (
          <div key={a._id} className="card p-4">
            <p className="font-semibold text-ink">{a.title}</p>
            <p className="mt-1 text-sm text-ink/60">{a.message}</p>
            <p className="mt-2 text-xs text-ink/40">{new Date(a.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-ink/50">No announcements for this course yet.</p>}
      </div>
    </div>
  );
};

/* ---------------------------- Attendance -------------------------------- */
const AttendanceTab = ({ course }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/courses/${course._id}`);
      setStudents(data.students || []);
      const initial = {};
      (data.students || []).forEach((s) => (initial[s._id] = true));
      setRecords(initial);
    })();
  }, [course._id]);

  const toggle = (id) => setRecords({ ...records, [id]: !records[id] });

  const save = async () => {
    const payload = students.map((s) => ({ student: s._id, present: !!records[s._id] }));
    await api.post(`/courses/${course._id}/attendance`, { date, records: payload });
    alert("Attendance saved for " + date);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-ink">Mark attendance</h3>
        <input type="date" className="input-field w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="mt-4 divide-y divide-indigo-light/10">
        {students.map((s) => (
          <label key={s._id} className="flex items-center justify-between py-3">
            <span className="text-sm text-ink">{s.name}</span>
            <input type="checkbox" checked={!!records[s._id]} onChange={() => toggle(s._id)} className="h-5 w-5 accent-indigo" />
          </label>
        ))}
        {students.length === 0 && <p className="py-4 text-ink/50">No students enrolled in this course yet.</p>}
      </div>

      {students.length > 0 && (
        <button onClick={save} className="btn-primary mt-4">
          Save Attendance
        </button>
      )}
    </div>
  );
};

export default TeacherDashboard;
