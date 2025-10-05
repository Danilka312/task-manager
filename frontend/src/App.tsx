import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Board from "./pages/Board";
import Analytics from "./pages/Analytics";
import { initTheme, getTheme, setTheme, type ThemeMode } from "./store/theme";

function Private({ children }: { children: JSX.Element }) {
  const isAuthed = !!(JSON.parse(localStorage.getItem("tm_tokens") || "null")?.access);
  const loc = useLocation();
  if (!isAuthed) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function Topbar() {
  const [theme, setThemeState] = useState<ThemeMode>(getTheme());
  const logout = () => {
    localStorage.removeItem("tm_tokens");
    location.href = "/login";
  };
  const toggle = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };
  return (
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <Link to="/app" className="font-bold text-lg">Task<span className="text-indigo-600">Manager</span></Link>
      <nav className="flex items-center gap-2 md:gap-4">
        <Link to="/app" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Board</Link>
        <Link to="/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Analytics</Link>
        <button onClick={toggle} className="rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 px-3 py-1.5 transition">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button onClick={logout} className="rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 px-3 py-1.5 transition">Logout</button>
      </nav>
    </div>
  );
}

export default function App() {
  useEffect(() => { initTheme(); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route
          path="/app"
          element={
            <Private>
              <div className="w-full min-h-screen">
                <header className="border-b border-slate-200 dark:border-slate-800">
                  <Topbar />
                </header>
                <main className="max-w-6xl mx-auto px-4 py-8">
                  <Board />
                </main>
              </div>
            </Private>
          }
        />
        <Route
          path="/analytics"
          element={
            <Private>
              <div className="w-full min-h-screen">
                <header className="border-b border-slate-200 dark:border-slate-800">
                  <Topbar />
                </header>
                <main className="max-w-6xl mx-auto px-4 py-8">
                  <Analytics />
                </main>
              </div>
            </Private>
          }
        />
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
