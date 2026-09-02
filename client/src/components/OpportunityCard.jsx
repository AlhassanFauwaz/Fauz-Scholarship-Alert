import { Link } from 'react-router-dom';
import fallbackImage from '../assets/soas.jpg';

const typeStyles = {
  scholarship: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  internship: 'bg-sky-100 text-sky-800 border-sky-200',
  fellowship: 'bg-violet-100 text-violet-800 border-violet-200',
  grant: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  competition: 'bg-amber-100 text-amber-800 border-amber-200',
  research: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  job: 'bg-blue-100 text-blue-800 border-blue-200',
  training: 'bg-teal-100 text-teal-800 border-teal-200',
  exchange: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  graduate_programme: 'bg-purple-100 text-purple-800 border-purple-200',
  volunteer: 'bg-rose-100 text-rose-800 border-rose-200',
  conference: 'bg-orange-100 text-orange-800 border-orange-200',
  entrepreneurship: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  funding: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

const fundingLabels = {
  fully_funded: 'Fully Funded',
  partially_funded: 'Partial Funding',
  tuition_only: 'Tuition Only',
  stipend: 'Stipend Provided',
  paid: 'Paid Opportunity',
  no_funding: 'Unfunded',
  unpaid: 'Unpaid',
};

export default function OpportunityCard({ opp, onDismiss }) {
  const daysLeft = opp.deadline
    ? Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const typeKey = (opp.type || 'other').toLowerCase();
  const badgeClass = typeStyles[typeKey] || 'bg-slate-100 text-slate-700 border-slate-200';
  const image = opp.image || fallbackImage;
  const isVerified =
    opp.verificationStatus === 'verified' || opp.verificationStatus === 'official_source';

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(10,43,60,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(10,43,60,0.12)]">
      {/* Banner image with overlays */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={opp.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize backdrop-blur-md ${badgeClass}`}
            >
              {opp.type ? opp.type.replace('_', ' ') : 'Opportunity'}
            </span>

            {opp.fundingType && fundingLabels[opp.fundingType] && (
              <span className="inline-flex items-center rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                {fundingLabels[opp.fundingType]}
              </span>
            )}
          </div>

          {isVerified && (
            <span
              title="Verified Opportunity"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
            >
              ✓ Verified
            </span>
          )}
        </div>

        {/* Remote Pill & Bottom Image text */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex-1">
            <p className="line-clamp-1 text-xs font-medium text-slate-200">
              {opp.organization || opp.provider || 'Global Opportunity'}
            </p>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">
              {opp.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Match score bar & reasons if present */}
        {opp.matchScore !== undefined && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">
                {opp.matchScore}% Profile Match
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {opp.matchReasons && opp.matchReasons.length > 0 && (
              <p className="mt-1 line-clamp-1 text-[11px] text-emerald-700">
                ✓ {opp.matchReasons[0]}
              </p>
            )}
          </div>
        )}

        {/* Short description */}
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
          {opp.shortDescription || opp.description}
        </p>

        {/* Metadata row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            📍 {opp.country || opp.region || 'Worldwide'}
          </span>
          {opp.isRemote && (
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              Remote
            </span>
          )}
          {opp.degreeLevels && opp.degreeLevels.length > 0 && opp.degreeLevels[0] !== 'any' && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] capitalize text-slate-600">
              {opp.degreeLevels[0]}
            </span>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <div>
            {daysLeft !== null && (
              <span
                className={`font-semibold ${
                  daysLeft <= 7 && daysLeft >= 0
                    ? 'text-red-600 font-bold'
                    : daysLeft < 0
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {daysLeft > 0
                  ? `⏰ ${daysLeft} days left`
                  : daysLeft === 0
                  ? '⏰ Closes today'
                  : 'Expired'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDismiss(opp._id);
                }}
                title="Not interested"
                className="text-xs text-slate-400 hover:text-red-500 transition"
              >
                Hide
              </button>
            )}
            <Link
              to={`/opportunity/${opp.slug || opp._id}`}
              className="inline-flex items-center gap-1 font-bold text-[#0a2b3c] transition hover:text-[#1c9c4d]"
            >
              View details <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
