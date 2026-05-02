import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";

function Protected({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!token) return;
    apiFetch("/auth/me", { token })
      .then((me) => {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      })
      .catch(() => {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  }, [token]);

  const auth = useMemo(
    () => ({
      token,
      user,
      setAuth(nextToken, nextUser) {
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
      },
      logout() {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }),
    [token, user, navigate]
  );

  return (
    <div className="min-h-screen">
      {token && (
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-brand">Team Task Manager</h1>
              <nav className="flex gap-3 text-sm font-medium">
                <Link to="/dashboard" className="text-slate-700 hover:text-brand">
                  Dashboard
                </Link>
                <Link to="/projects" className="text-slate-700 hover:text-brand">
                  Projects
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded bg-slate-100 px-2 py-1">{user?.email}</span>
              <button
                onClick={auth.logout}
                className="rounded bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" replace /> : <LoginPage auth={auth} />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/dashboard" replace /> : <SignupPage auth={auth} />}
          />
          <Route
            path="/dashboard"
            element={
              <Protected token={token}>
                <DashboardPage auth={auth} />
              </Protected>
            }
          />
          <Route
            path="/projects"
            element={
              <Protected token={token}>
                <ProjectsPage auth={auth} />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}
