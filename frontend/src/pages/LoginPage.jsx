import { Link } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../api";

export default function LoginPage({ auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      auth.setAuth(data.token, data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">Login</h2>
      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-brand px-4 py-2 font-medium text-white">Login</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New user? <Link to="/signup" className="text-brand">Create account</Link>
      </p>
    </div>
  );
}
