import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Board from "./pages/Board";
import Analytics from "./pages/Analytics";

function Private({ children }: { children: JSX.Element }) {
  const isAuthed = !!(JSON.parse(localStorage.getItem("tm_tokens") || "null")?.access);
  const loc = useLocation();
  if (!isAuthed) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

function Topbar() {
  const logout = () => {
    localStorage.removeItem("tm_tokens");
    location.href = "/login";
  };
  return (
    <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/app" className="font-bold text-lg">Task<span className="text-indigo-600">Manager</span></Link>
        <nav className="flex items-center gap-4">
          <Link to="/app" className="hover:text-indigo-600 transition">Board</Link>
          <Link to="/analytics" className="hover:text-indigo-600 transition">Analytics</Link>
          <button onClick={logout} className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 transition">Logout</button>
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route
          path="/app"
          element={
            <Private>
              <div className="min-h-screen">
                <Topbar />
                <main className="min-h-[calc(100vh-64px)] grid place-items-center px-4 md:px-6 py-6">
                  <div className="w-full max-w-5xl mx-auto">
                    <Board />
                  </div>
                </main>
              </div>
            </Private>
          }
        />
        <Route
          path="/analytics"
          element={
            <Private>
              <div className="min-h-screen">
                <Topbar />
                <main className="min-h-[calc(100vh-64px)] grid place-items-center px-4 md:px-6 py-6">
                  <div className="w-full max-w-5xl mx-auto">
                    <Analytics />
                  </div>
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
