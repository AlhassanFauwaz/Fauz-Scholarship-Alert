import { NavLink, Outlet } from "react-router-dom";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true, color: "text-emerald-300" },
  { to: "/admin/discovery", label: "Global Discovery", icon: "discovery", color: "text-sky-300" },
  { to: "/admin/opportunities", label: "Opportunities", icon: "opportunities", color: "text-teal-300" },
  { to: "/admin/verification", label: "Verification Queue", icon: "verification", color: "text-amber-300" },
  { to: "/admin/sources", label: "Sources Registry", icon: "sources", color: "text-emerald-400" },
  { to: "/admin/ingestions", label: "Raw Ingestion Stream", icon: "ingestions", color: "text-indigo-300" },
  { to: "/admin/audit-logs", label: "Audit Trail", icon: "audit", color: "text-purple-300" },
  { to: "/admin/users", label: "Users", icon: "users", color: "text-violet-300" },
  { to: "/admin/feedback", label: "Feedback", icon: "feedback", color: "text-rose-300" },
  { to: "/admin/reports", label: "Reports", icon: "reports", color: "text-cyan-300" },
];

function AdminIcon({ name }) {
  const paths = {
    dashboard: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
    discovery: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z",
    opportunities: "M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01",
    verification: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    sources: "M13 10V3L4 14h7v7l9-11h-7z",
    ingestions: "M4 6h16M4 12h16M4 18h7",
    audit: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm3 4a4 4 0 0 1 3 3.9V21",
    feedback: "M20 15a4 4 0 0 1-4 4H8l-4 3v-7a4 4 0 0 1-2-3.5v-5A4 4 0 0 1 6 3h10a4 4 0 0 1 4 4v8Z",
    reports: "M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6",
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.dashboard} />
    </svg>
  );
}

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <aside className="w-full border-b border-slate-800/60 bg-gradient-to-b from-[#081d2a] via-[#0a2b3c] to-[#0c3444] p-4 text-white shadow-[0_25px_60px_rgba(10,43,60,0.35)] lg:w-64 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center justify-center gap-3 border-b border-white/10 pb-4 lg:justify-start lg:px-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c9c4d] to-[#32b86c] text-sm font-black text-white shadow-lg"
            title="Admin panel"
          >
            AD
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold">Admin Console</p>
            <p className="text-xs text-slate-300">Global Opportunity Platform</p>
          </div>
        </div>

        <nav className="flex justify-center gap-2 overflow-x-auto pb-1 lg:flex-col lg:items-stretch lg:overflow-visible">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              aria-label={link.label}
              title={link.label}
              className={({ isActive }) =>
                `inline-flex h-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 lg:w-full lg:justify-start lg:gap-3 lg:px-3 ${
                  isActive
                    ? "bg-white/12 text-white shadow-inner shadow-white/10 ring-1 ring-white/10 font-bold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className={link.color}>
                <AdminIcon name={link.icon} />
              </span>
              <span className="hidden text-xs lg:inline">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(28,156,77,0.08),_transparent_32%),linear-gradient(180deg,#f3f8fb_0%,#eef5f4_100%)] p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
