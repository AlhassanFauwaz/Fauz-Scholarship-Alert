import { NavLink, Outlet } from "react-router-dom";

const sidebarLinks = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/opportunities", label: "Opportunities", icon: "opportunities" },
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/feedback", label: "Feedback", icon: "feedback" },
  { to: "/admin/reports", label: "Reports", icon: "reports" },
];

function AdminIcon({ name }) {
  const paths = {
    dashboard: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
    opportunities: "M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm3 4a4 4 0 0 1 3 3.9V21",
    feedback: "M20 15a4 4 0 0 1-4 4H8l-4 3v-7a4 4 0 0 1-2-3.5v-5A4 4 0 0 1 6 3h10a4 4 0 0 1 4 4v8Z",
    reports: "M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function AdminLayout() {
  return <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row"><aside className="w-full border-b border-slate-800/60 bg-gradient-to-b from-[#081d2a] via-[#0a2b3c] to-[#0c3444] p-4 text-white shadow-[0_25px_60px_rgba(10,43,60,0.35)] md:w-20 md:border-b-0 md:border-r"><div className="mb-4 flex justify-center border-b border-white/10 pb-4 md:mb-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-500 text-sm font-black shadow-lg shadow-secondary-500/30" title="Admin panel">AD</div></div><nav className="flex justify-center gap-2 overflow-x-auto pb-1 md:flex-col md:items-center md:overflow-visible">{sidebarLinks.map((link) => <NavLink key={link.to} to={link.to} end={link.end} aria-label={link.label} title={link.label} className={({ isActive }) => `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${isActive ? "bg-white/12 text-white shadow-inner shadow-white/10 ring-1 ring-white/10" : "text-slate-200 hover:bg-white/10 hover:text-white"}`}><AdminIcon name={link.icon} /></NavLink>)}</nav></aside><main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(28,156,77,0.08),_transparent_32%),linear-gradient(180deg,#f3f8fb_0%,#eef5f4_100%)] p-4 sm:p-6 md:p-8"><div className="mx-auto max-w-7xl"><Outlet /></div></main></div>;
}
