import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import fallbackImage from "../assets/soas.jpg";

const typeStyles = {
  scholarship: "bg-emerald-100 text-emerald-700",
  internship: "bg-sky-100 text-sky-700",
  fellowship: "bg-violet-100 text-violet-700",
  grant: "bg-cyan-100 text-cyan-700",
  competition: "bg-amber-100 text-amber-700",
  research: "bg-fuchsia-100 text-fuchsia-700",
  other: "bg-slate-200 text-slate-700",
};

export default function Opportunities() {
  const [searchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("keyword") || "");
  const [type, setType] = useState(() => searchParams.get("type") || "");

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const params = { sort: "latest", limit: 100 };
        if (type) params.type = type;
        if (search) params.keyword = search;

        const res = await API.get("/opportunities", { params });
        setOpportunities(res.data.opportunities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [search, type]);

  return (
    <div className="bg-[#f3f8fb]">
      <section className="bg-[radial-gradient(circle_at_top,_rgba(28,156,77,0.18),_transparent_28%),linear-gradient(135deg,#081d2a_0%,#0a2b3c_38%,#133d52_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Explore
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              Find the right opportunity
            </h1>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords..."
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
            >
              <option value="" className="text-slate-900">
                All types
              </option>
              <option value="scholarship" className="text-slate-900">
                Scholarship
              </option>
              <option value="internship" className="text-slate-900">
                Internship
              </option>
              <option value="fellowship" className="text-slate-900">
                Fellowship
              </option>
              <option value="grant" className="text-slate-900">
                Grant
              </option>
              <option value="competition" className="text-slate-900">
                Competition
              </option>
              <option value="research" className="text-slate-900">
                Research
              </option>
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
            Loading opportunities...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
            No opportunities found for this search.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opp) => {
              const daysLeft = Math.ceil(
                (new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24),
              );
              const badgeClass =
                typeStyles[opp.type] || "bg-slate-200 text-slate-700";

              return (
                <div
                  key={opp._id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(10,43,60,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(10,43,60,0.12)]"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                    <img
                      src={opp.image || fallbackImage}
                      alt={opp.title}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClass}`}
                      >
                        {opp.type}
                      </span>
                      <h2 className="mt-3 text-xl font-bold text-slate-900">
                        {opp.title}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#0a2b3c]/5 px-2.5 py-1 text-[11px] font-semibold text-[#0a2b3c]">
                      {opp.country || "Global"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600">{opp.organization}</p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </p>
                    <p
                      className={
                        daysLeft <= 7 ? "font-semibold text-red-600" : ""
                      }
                    >
                      {daysLeft > 0
                        ? `${daysLeft} days left`
                        : "Deadline passed"}
                    </p>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {opp.description ||
                      "We have a great opportunity for students and professionals looking to grow."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Open
                    </span>
                    <Link
                      to={`/opportunity/${opp._id}`}
                      className="inline-flex items-center gap-2 font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
                    >
                      View details
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
