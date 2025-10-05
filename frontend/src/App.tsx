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
    <div className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/app" className="font-bold text-lg">Task<span className="text-blue-600">Manager</span></Link>
        <nav className="flex items-center gap-4">
          <Link to="/app" className="hover:text-blue-600 transition">Board</Link>
          <Link to="/analytics" className="hover:text-blue-600 transition">Analytics</Link>
          <button onClick={logout} className="ml-2 rounded-xl border px-3 py-1.5 hover:bg-gray-50">Logout</button>
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
              <div className="min-h-screen bg-gray-50">
                <Topbar />
                <main className="mx-auto max-w-6xl px-4 py-6">
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
              <div className="min-h-screen bg-gray-50">
                <Topbar />
                <main className="mx-auto max-w-6xl px-4 py-6">
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
