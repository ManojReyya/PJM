import { Link } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../api";

export default function SignupPage({ auth }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: form
      });
      auth.setAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">Signup</h2>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="w-full rounded border px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-brand px-4 py-2 font-medium text-white">Create account</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have account? <Link to="/login" className="text-brand">Login</Link>
      </p>
    </div>
  );
}
