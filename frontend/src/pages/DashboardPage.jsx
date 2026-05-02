import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function DashboardPage({ auth }) {
  const [summary, setSummary] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/dashboard/summary", { token: auth.token }),
      apiFetch("/dashboard/overdue", { token: auth.token }),
      apiFetch("/dashboard/my-tasks", { token: auth.token })
    ])
      .then(([s, o, m]) => {
        setSummary(s);
        setOverdue(o);
        setMyTasks(m);
      })
      .catch((err) => setError(err.message));
  }, [auth.token]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!summary) return <p>Loading dashboard...</p>;

  const card = "rounded-xl border bg-white p-4 shadow-sm";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className={card}><p className="text-xs text-slate-500">Total</p><p className="text-2xl font-bold">{summary.total || 0}</p></div>
        <div className={card}><p className="text-xs text-slate-500">Todo</p><p className="text-2xl font-bold">{summary.todo || 0}</p></div>
        <div className={card}><p className="text-xs text-slate-500">In Progress</p><p className="text-2xl font-bold">{summary.in_progress || 0}</p></div>
        <div className={card}><p className="text-xs text-slate-500">Done</p><p className="text-2xl font-bold">{summary.done || 0}</p></div>
        <div className={card}><p className="text-xs text-slate-500">Overdue</p><p className="text-2xl font-bold text-red-600">{summary.overdue || 0}</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold">My Tasks</h3>
          <ul className="space-y-2 text-sm">
            {myTasks.slice(0, 8).map((t) => (
              <li key={t.id} className="rounded border p-2">
                <p className="font-medium">{t.title}</p>
                <p className="text-slate-500">{t.status} {t.due_date ? `• due ${new Date(t.due_date).toLocaleDateString()}` : ""}</p>
              </li>
            ))}
            {!myTasks.length && <li className="text-slate-500">No assigned tasks.</li>}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold text-red-700">Overdue Tasks</h3>
          <ul className="space-y-2 text-sm">
            {overdue.slice(0, 8).map((t) => (
              <li key={t.id} className="rounded border p-2">
                <p className="font-medium">{t.title}</p>
                <p className="text-red-600">due {new Date(t.due_date).toLocaleDateString()}</p>
              </li>
            ))}
            {!overdue.length && <li className="text-slate-500">No overdue tasks.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
