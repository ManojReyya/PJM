import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

export default function ProjectsPage({ auth }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", priority: "medium" });

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const isProjectAdmin = selected?.role_in_project === "admin";

  async function loadProjects() {
    try {
      const data = await apiFetch("/projects", { token: auth.token });
      setProjects(data);
      if (!selectedProjectId && data.length) setSelectedProjectId(data[0].id);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    Promise.all([
      apiFetch(`/projects/${selectedProjectId}/members`, { token: auth.token }),
      apiFetch(`/projects/${selectedProjectId}/tasks`, { token: auth.token })
    ])
      .then(([m, t]) => {
        setMembers(m);
        setTasks(t);
      })
      .catch((err) => setError(err.message));
  }, [selectedProjectId]);

  async function createProject(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/projects", {
        method: "POST",
        token: auth.token,
        body: projectForm
      });
      setProjectForm({ name: "", description: "" });
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addMember(e) {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");
    try {
      await apiFetch(`/projects/${selectedProjectId}/members`, {
        method: "POST",
        token: auth.token,
        body: { email: memberEmail, role_in_project: "member" }
      });
      setMemberEmail("");
      const m = await apiFetch(`/projects/${selectedProjectId}/members`, { token: auth.token });
      setMembers(m);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError("");
    try {
      await apiFetch(`/projects/${selectedProjectId}/tasks`, {
        method: "POST",
        token: auth.token,
        body: {
          ...taskForm,
          due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null
        }
      });
      setTaskForm({ title: "", description: "", due_date: "", priority: "medium" });
      const t = await apiFetch(`/projects/${selectedProjectId}/tasks`, { token: auth.token });
      setTasks(t);
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(taskId, status) {
    setError("");
    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: "PATCH",
        token: auth.token,
        body: { status }
      });
      const t = await apiFetch(`/projects/${selectedProjectId}/tasks`, { token: auth.token });
      setTasks(t);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Projects</h2>
        <form className="mb-3 space-y-2" onSubmit={createProject}>
          <input className="w-full rounded border px-2 py-1" placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
          <textarea className="w-full rounded border px-2 py-1" placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
          <button className="w-full rounded bg-brand px-3 py-2 text-white">Create</button>
        </form>
        <ul className="space-y-2 text-sm">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full rounded border px-2 py-2 text-left ${selectedProjectId === p.id ? "border-brand bg-teal-50" : ""}`}
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-500">role: {p.role_in_project}</p>
              </button>
            </li>
          ))}
          {!projects.length && <li className="text-slate-500">No projects yet.</li>}
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm md:col-span-2">
        <h2 className="mb-2 font-semibold">{selected ? selected.name : "Select a project"}</h2>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {selected && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Members</h3>
              {isProjectAdmin && (
                <form className="mb-2 flex gap-2" onSubmit={addMember}>
                  <input className="flex-1 rounded border px-2 py-1" placeholder="User email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                  <button className="rounded bg-slate-900 px-3 py-1 text-white">Add</button>
                </form>
              )}
              <ul className="space-y-1 text-sm">
                {members.map((m) => (
                  <li key={m.id} className="rounded border p-2">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email} • {m.role_in_project}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">New Task</h3>
              <form className="space-y-2" onSubmit={createTask}>
                <input className="w-full rounded border px-2 py-1" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                <textarea className="w-full rounded border px-2 py-1" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded border px-2 py-1" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input className="rounded border px-2 py-1" type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                </div>
                <button className="w-full rounded bg-brand px-3 py-2 text-white">Create Task</button>
              </form>
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Tasks</h3>
            <ul className="space-y-2 text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="rounded border p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-slate-500">{t.priority} • {t.assignee_name || "unassigned"}</p>
                    </div>
                    <select
                      className="rounded border px-2 py-1"
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                    >
                      <option value="todo">todo</option>
                      <option value="in_progress">in_progress</option>
                      <option value="done">done</option>
                    </select>
                  </div>
                </li>
              ))}
              {!tasks.length && <li className="text-slate-500">No tasks yet.</li>}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
