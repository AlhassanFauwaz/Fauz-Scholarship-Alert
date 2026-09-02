import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import OpportunityCard from "../components/OpportunityCard";

const OPPORTUNITY_TYPES = [
  { label: "All Types", value: "" },
  { label: "Scholarship", value: "scholarship" },
  { label: "Internship", value: "internship" },
  { label: "Grant", value: "grant" },
  { label: "Fellowship", value: "fellowship" },
  { label: "Job", value: "job" },
  { label: "Research", value: "research" },
  { label: "Training", value: "training" },
  { label: "Competition", value: "competition" },
  { label: "Exchange Program", value: "exchange" },
  { label: "Graduate Programme", value: "graduate_programme" },
  { label: "Volunteer", value: "volunteer" },
  { label: "Conference / Event", value: "conference" },
  { label: "Entrepreneurship", value: "entrepreneurship" },
  { label: "Funding", value: "funding" },
  { label: "Other", value: "other" },
];

const REGIONS = [
  { label: "All Regions", value: "" },
  { label: "Africa", value: "Africa" },
  { label: "Europe", value: "Europe" },
  { label: "North America", value: "North America" },
  { label: "South America", value: "South America" },
  { label: "Asia", value: "Asia" },
  { label: "Oceania", value: "Oceania" },
  { label: "Middle East", value: "Middle East" },
  { label: "Worldwide / Global", value: "Worldwide" },
];

const DEGREE_LEVELS = [
  { label: "Any Education Level", value: "" },
  { label: "High School", value: "highschool" },
  { label: "Diploma / Certificate", value: "diploma" },
  { label: "Bachelor's / Undergraduate", value: "undergraduate" },
  { label: "Master's / Graduate", value: "graduate" },
  { label: "PhD / Doctorate", value: "phd" },
  { label: "Postdoctoral", value: "postdoctoral" },
  { label: "Professional", value: "professional" },
];

const FUNDING_TYPES = [
  { label: "All Funding Types", value: "" },
  { label: "Fully Funded", value: "fully_funded" },
  { label: "Partially Funded", value: "partially_funded" },
  { label: "Tuition Only", value: "tuition_only" },
  { label: "Stipend / Allowance", value: "stipend" },
  { label: "Paid Opportunity", value: "paid" },
  { label: "No Funding / Unfunded", value: "no_funding" },
];

export default function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL search params
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") || "");
  const [type, setType] = useState(() => searchParams.get("type") || "");
  const [region, setRegion] = useState(() => searchParams.get("region") || "");
  const [country, setCountry] = useState(() => searchParams.get("country") || "");
  const [degreeLevel, setDegreeLevel] = useState(() => searchParams.get("degreeLevel") || "");
  const [fundingType, setFundingType] = useState(() => searchParams.get("fundingType") || "");
  const [isRemote, setIsRemote] = useState(() => searchParams.get("isRemote") === "true");
  const [closingSoon, setClosingSoon] = useState(() => searchParams.get("closingSoon") === "true");
  const [featured, setFeatured] = useState(() => searchParams.get("featured") === "true");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "latest");
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") || "1", 10));

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 18,
        sort,
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (type) params.type = type;
      if (region) params.region = region;
      if (country.trim()) params.country = country.trim();
      if (degreeLevel) params.degreeLevel = degreeLevel;
      if (fundingType) params.fundingType = fundingType;
      if (isRemote) params.isRemote = "true";
      if (closingSoon) params.closingSoon = "true";
      if (featured) params.featured = "true";

      const res = await API.get("/opportunities", { params });
      setOpportunities(res.data.opportunities || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();

    // Sync URL search params
    const nextParams = new URLSearchParams();
    if (keyword) nextParams.set("keyword", keyword);
    if (type) nextParams.set("type", type);
    if (region) nextParams.set("region", region);
    if (country) nextParams.set("country", country);
    if (degreeLevel) nextParams.set("degreeLevel", degreeLevel);
    if (fundingType) nextParams.set("fundingType", fundingType);
    if (isRemote) nextParams.set("isRemote", "true");
    if (closingSoon) nextParams.set("closingSoon", "true");
    if (featured) nextParams.set("featured", "true");
    if (sort !== "latest") nextParams.set("sort", sort);
    if (page > 1) nextParams.set("page", page.toString());
    setSearchParams(nextParams, { replace: true });
  }, [keyword, type, region, country, degreeLevel, fundingType, isRemote, closingSoon, featured, sort, page]);

  const handleResetFilters = () => {
    setKeyword("");
    setType("");
    setRegion("");
    setCountry("");
    setDegreeLevel("");
    setFundingType("");
    setIsRemote(false);
    setClosingSoon(false);
    setFeatured(false);
    setSort("latest");
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  return (
    <div className="min-h-screen bg-[#f3f8fb]">
      {/* Header Banner */}
      <section className="bg-[linear-gradient(135deg,#081d2a_0%,#0a2b3c_40%,#133d52_100%)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
            Global Opportunity Feed
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">
            Explore Opportunities Worldwide
          </h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Filter by opportunity category, education level, funding status, country, or delivery mode.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-2xl gap-2">
            <input
              type="text"
              placeholder="Search keyword, field, university, or country..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none focus:border-emerald-300 focus:bg-white/15"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#1c9c4d] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Layout with Filters Sidebar & Feed */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(10,43,60,0.06)] h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-[#0a2b3c]">Filters</h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-500"
              >
                Reset All
              </button>
            </div>

            {/* Opportunity Type */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Opportunity Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree Level */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Degree Level
              </label>
              <select
                value={degreeLevel}
                onChange={(e) => {
                  setDegreeLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                {DEGREE_LEVELS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Funding Type */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Funding
              </label>
              <select
                value={fundingType}
                onChange={(e) => {
                  setFundingType(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              >
                {FUNDING_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Specific Country
              </label>
              <input
                type="text"
                placeholder="e.g. Ghana, Canada, UK"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => {
                    setIsRemote(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Remote Only
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={closingSoon}
                  onChange={(e) => {
                    setClosingSoon(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Closing Soon (7 Days)
              </label>

              <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => {
                    setFeatured(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Featured Only
              </label>
            </div>
          </aside>

          {/* Results Area */}
          <main className="space-y-6">
            {/* Header with count and Sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Showing <span className="font-bold text-[#0a2b3c]">{opportunities.length}</span> of{" "}
                <span className="font-bold text-[#0a2b3c]">{pagination.total}</span> opportunities
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm outline-none"
                >
                  <option value="latest">Latest Discovered</option>
                  <option value="deadline">Closing Soonest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500 shadow-sm">
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <p className="text-lg font-bold text-slate-800">No opportunities match your current filters.</p>
                <p className="mt-2 text-sm text-slate-500">Try broadening your search keywords or resetting filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-block rounded-xl bg-[#0a2b3c] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1c9c4d]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp._id} opp={opp} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="text-xs font-semibold text-slate-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
