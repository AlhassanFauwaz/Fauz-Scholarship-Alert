import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import fsaLogo from "../assets/fsa.png";

function NavIcon({ name }) {
  const paths = {
    home: "M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9ZM9 21v-6h6v6",
    dashboard: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
    subscriptions: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4",
    notifications: "M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4",
    feedback: "M20 15a4 4 0 0 1-4 4H8l-4 3v-7a4 4 0 0 1-2-3.5v-5A4 4 0 0 1 6 3h10a4 4 0 0 1 4 4v8Z",
    admin: "M12 3 4 6v5c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V6l-8-3Zm0 5v5m0 4h.01",
    logout: "M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m4-4 4-3-4-3m4 3H9",
    login: "M14 5h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5m-4-4 4-3-4-3m4 3H3",
    register: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-3v6m3-3h-6",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function IconLink({ to, label, icon, onClick, accent = false }) {
  return <Link to={to} onClick={onClick} aria-label={label} title={label} className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${accent ? "bg-[#1c9c4d] text-white shadow-sm hover:bg-[#167d3e]" : "text-[#0a2b3c] hover:bg-[#1c9c4d]/10 hover:text-[#1c9c4d]"}`}><NavIcon name={icon} /></Link>;
}

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const handleLogout = () => { logout(); closeMenu(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 px-2 pb-2 pt-2 sm:px-3 sm:pt-3">
      <nav className="mx-auto max-w-7xl rounded-2xl border-t-[3px] border-[#1c9c4d] bg-white px-4 py-3 text-[#0a2b3c] shadow-lg sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Fauz Scholarship Alert home" title="Fauz Scholarship Alert" className="flex items-center gap-2"><img src={fsaLogo} alt="Fauz Scholarship Alert" className="h-8 w-8 rounded-full object-contain sm:h-9 sm:w-9" /></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="main-navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#0a2b3c] transition hover:border-[#1c9c4d] hover:text-[#1c9c4d] md:hidden">
            <span className="sr-only">Toggle navigation menu</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18 18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
          <div id="main-navigation" className={`${menuOpen ? "flex" : "hidden"} absolute left-2 right-2 top-[calc(100%+0.25rem)] flex-row flex-wrap justify-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl md:static md:flex md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <IconLink to="/" label="Home" icon="home" onClick={closeMenu} />
            {user ? <><IconLink to="/dashboard" label="Dashboard" icon="dashboard" onClick={closeMenu} /><IconLink to="/subscriptions" label="Subscriptions" icon="subscriptions" onClick={closeMenu} /><IconLink to="/notifications" label="Notifications" icon="notifications" onClick={closeMenu} /><IconLink to="/feedback" label="Feedback" icon="feedback" onClick={closeMenu} />{user.role === "admin" && <IconLink to="/admin" label="Admin panel" icon="admin" onClick={closeMenu} />}<button onClick={handleLogout} aria-label="Logout" title="Logout" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c9c4d] text-white shadow-sm transition hover:bg-[#167d3e]"><NavIcon name="logout" /></button></> : <><IconLink to="/login" label="Login" icon="login" onClick={closeMenu} /><IconLink to="/register" label="Register" icon="register" onClick={closeMenu} accent /></>}
          </div>
        </div>
      </nav>
    </header>
  );
}
