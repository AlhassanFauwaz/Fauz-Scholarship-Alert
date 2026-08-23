import { Link } from 'react-router-dom';
import fallbackImage from "../assets/soas.jpg";

const typeStyles = {
  scholarship: "bg-emerald-100 text-emerald-800",
  internship: "bg-sky-100 text-sky-800",
  fellowship: "bg-violet-100 text-violet-800",
  grant: "bg-cyan-100 text-cyan-800",
  competition: "bg-amber-100 text-amber-800",
  research: "bg-fuchsia-100 text-fuchsia-800",
  other: "bg-slate-200 text-slate-700",
};

export default function OpportunityCard({ opp }) {
  const daysLeft = Math.ceil(
    (new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const badgeClass = typeStyles[opp.type] || "bg-slate-100 text-slate-700";
  const image = opp.image || fallbackImage;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(10,43,60,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(10,43,60,0.12)]">
      {/* Image banner */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-200">
        <img
          src={image}
          alt={opp.title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold leading-snug text-white">
          {opp.title}
        </h3>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        {opp.matchScore !== undefined && (
          <span className="mb-2 inline-block rounded-full bg-[#1c9c4d]/10 px-2 py-1 text-[11px] font-bold text-[#1c9c4d]">
            {opp.matchScore}% match
          </span>
        )}

        <p className="text-sm text-slate-600">{opp.organization}</p>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${badgeClass}`}
          >
            {opp.type}
          </span>
          <span className="text-xs text-slate-500">
            {opp.country || "Global"}
          </span>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
          Deadline: {new Date(opp.deadline).toLocaleDateString()}
          {daysLeft >= 0 && (
            <span
              className={`ml-1 ${daysLeft <= 7 ? "font-bold text-red-600" : "text-slate-400"}`}
            >
              ({daysLeft} days left)
            </span>
          )}
        </div>

        <Link
          to={`/opportunity/${opp._id}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0a2b3c] transition hover:text-[#1c9c4d]"
        >
          View Details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
