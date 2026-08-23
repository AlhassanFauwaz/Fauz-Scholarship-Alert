import { Link } from 'react-router-dom';
import fsaLogo from "../assets/fsa.png";

export default function Footer() {
  return (
    <footer className="bg-[#0a2b3c] text-white mt-16 border-t-4 border-[#1c9c4d]">
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xl font-black tracking-wide text-white sm:text-2xl">
              <img src={fsaLogo} alt="Fauz Scholarship Alert" className="h-9 w-9 rounded-full object-contain" />
              <span>Fauz Scholarship Alert</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Fauz Scholarship Alert is your centralized platform for discovering scholarships, internships, fellowships, grants, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base mb-4 text-[#1c9c4d] uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Home</Link></li>
              <li><Link to="/login" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Dashboard</Link></li>
              <li><Link to="/feedback" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Feedback</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-bold text-base mb-4 text-[#1c9c4d] uppercase tracking-wider text-xs">Contact & Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="mailto:support@soas.com" className="hover:text-[#1c9c4d] transition-colors duration-200 flex items-center gap-2">
                  <span className="text-[#1c9c4d]">✉</span> support@soas.com
                </a>
              </li>
              <li><Link to="/privacy" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#1c9c4d] hover:translate-x-1 inline-block transition-all duration-200">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-slate-700/60 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Fauz Scholarship Alert. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-slate-500">Empowering future opportunities.</p>
        </div>
      </div>
    </footer>
  );
}
