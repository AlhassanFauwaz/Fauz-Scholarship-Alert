import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import fsaLogo from "../assets/fsa.png";

function NavIcon({ name }) {
  const paths = { home: "M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9ZM9 21v-6h6v6", dashboard: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z", subscriptions: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4", notifications: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4", feedback: "M20 15a4 4 0 0 1-4 4H8l-4 3v-7a4 4 0 0 1-2-3.5v-5A4 4 0 0 1 6 3h10a4 4 0 0 1 4 4v8Z", admin: "M12 3 4 6v5c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V6l-8-3Zm0 5v5m0 4h.01", logout: "M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m4-4 4-3-4-3m4 3H9", login: "M14 5h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5m-4-4 4-3-4-3m4 3H3", register: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-3v6m3-3h-6" };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function NavItem({ to, label, icon, onClick, mobile = false, variant = "default" }) {
  const variants = { default: "text-slate-600 hover:bg-emerald-50 hover:text-[#167d3e]", admin: "border border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700", login: "border border-slate-300 bg-white text-[#0a2b3c] shadow-sm hover:border-[#1c9c4d] hover:text-[#167d3e]", register: "border border-[#1c9c4d] bg-[#1c9c4d] text-white shadow-[0_5px_12px_rgba(28,156,77,0.22)] hover:bg-[#167d3e]" };
  return <NavLink to={to} onClick={onClick} title={label} className={({ isActive }) => `inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${isActive && variant === "default" ? "bg-emerald-50 text-[#167d3e]" : ""} ${mobile ? "w-full justify-start rounded-xl px-4" : "h-10 xl:px-3"}`}><NavIcon name={icon} /><span className={mobile ? "" : "hidden xl:inline"}>{label}</span></NavLink>;
}

function LogoutButton({ onClick, mobile = false }) {
  return <button onClick={onClick} title="Logout" className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#1c9c4d] bg-[#1c9c4d] px-3 py-2 text-sm font-semibold text-white shadow-[0_5px_12px_rgba(28,156,77,0.22)] transition hover:bg-[#167d3e] ${mobile ? "w-full justify-start rounded-xl px-4" : "h-10"}`}><NavIcon name="logout" /><span className={mobile ? "" : "hidden xl:inline"}>Logout</span></button>;
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate("/"); };
  const primaryLinks = [{ to: "/", label: "Home", icon: "home" }, ...(user ? [{ to: "/dashboard", label: "Dashboard", icon: "dashboard" }, { to: "/subscriptions", label: "Subscriptions", icon: "subscriptions" }, { to: "/notifications", label: "Notifications", icon: "notifications" }, { to: "/feedback", label: "Feedback", icon: "feedback" }] : [])];

  return <header className="sticky top-0 z-50 px-2 pb-2 pt-2 sm:px-3 sm:pt-3"><nav className="mx-auto max-w-7xl rounded-2xl border-t-[3px] border-[#1c9c4d] bg-white px-4 py-3 text-[#0a2b3c] shadow-lg sm:px-6"><div className="flex items-center justify-between md:hidden"><Link to="/" aria-label="Fauz Scholarship Alert home"><img src={fsaLogo} alt="Fauz Scholarship Alert" className="h-9 w-9 rounded-full object-contain" /></Link><button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#0a2b3c] transition hover:border-[#1c9c4d] hover:text-[#1c9c4d]"><span className="sr-only">Toggle navigation menu</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18 18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg></button></div><div className="hidden items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4"><Link to="/" aria-label="Fauz Scholarship Alert home" title="Fauz Scholarship Alert" className="justify-self-start"><img src={fsaLogo} alt="Fauz Scholarship Alert" className="h-9 w-9 rounded-full object-contain" /></Link><div className="flex items-center justify-center gap-1">{primaryLinks.map((link) => <NavItem key={link.to} {...link} />)}</div><div className="flex items-center justify-self-end gap-2">{user ? <>{user.role === "admin" && <NavItem to="/admin" label="Admin" icon="admin" variant="admin" />}<LogoutButton onClick={handleLogout} /></> : <><NavItem to="/login" label="Login" icon="login" variant="login" /><NavItem to="/register" label="Register" icon="register" variant="register" /></>}</div></div><div id="mobile-navigation" className={`${menuOpen ? "mt-3 grid" : "hidden"} gap-1 border-t border-slate-100 pt-3 md:hidden`}>{primaryLinks.map((link) => <NavItem key={link.to} {...link} mobile onClick={closeMenu} />)}{user ? <>{user.role === "admin" && <NavItem to="/admin" label="Admin panel" icon="admin" variant="admin" mobile onClick={closeMenu} />}<LogoutButton onClick={handleLogout} mobile /></> : <><NavItem to="/login" label="Login" icon="login" variant="login" mobile onClick={closeMenu} /><NavItem to="/register" label="Register" icon="register" variant="register" mobile onClick={closeMenu} /></>}</div></nav></header>;
}
