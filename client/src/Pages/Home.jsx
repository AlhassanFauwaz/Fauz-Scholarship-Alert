import { useState, useEffect } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import OpportunityCard from "../components/OpportunityCard";
import soas from "../assets/soas.jpg";

const CATEGORIES = [
  { label: "All Opportunities", value: "" },
  { label: "Scholarships", value: "scholarship" },
  { label: "Internships", value: "internship" },
  { label: "Grants", value: "grant" },
  { label: "Fellowships", value: "fellowship" },
  { label: "Jobs", value: "job" },
  { label: "Research", value: "research" },
  { label: "Competitions", value: "competition" },
  { label: "Training", value: "training" },
  { label: "Exchange Programs", value: "exchange" },
  { label: "Conferences", value: "conference" },
];

function SectionHeading({ children, accent = "bg-[#1c9c4d]", linkTo, linkText = "Explore all" }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2.5 text-2xl font-black text-[#0a2b3c]">
        <span className={`inline-block h-6 w-1.5 rounded-full ${accent}`} />
        {children}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs font-bold uppercase tracking-wider text-[#1c9c4d] transition hover:text-[#0a2b3c]"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [fullyFunded, setFullyFunded] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, closingRes, fundedRes] = await Promise.all([
          API.get("/opportunities", { params: { featured: true, limit: 4 } }),
          API.get("/opportunities", { params: { sort: "latest", limit: 6 } }),
          API.get("/opportunities", { params: { closingSoon: true, sort: "deadline", limit: 4 } }),
          API.get("/opportunities", { params: { fundingType: "fully_funded", limit: 4 } }),
        ]);

        setFeatured(featuredRes.data.opportunities || []);
        setLatest(latestRes.data.opportunities || []);
        setClosingSoon(closingRes.data.opportunities || []);
        setFullyFunded(fundedRes.data.opportunities || []);
      } catch (err) {
        console.error("Failed to load home page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const keyword = search.trim();

    if (keyword) params.set("keyword", keyword);
    if (activeCategory) params.set("type", activeCategory);

    const query = params.toString();
    navigate(`/opportunities${query ? `?${query}` : ""}`);
  };

  const handleCategoryClick = (categoryValue) => {
    setActiveCategory(categoryValue);
    if (categoryValue) {
      navigate(`/opportunities?type=${categoryValue}`);
    } else {
      navigate("/opportunities");
    }
  };

  return (
    <div className="bg-[#f3f8fb]">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center py-20 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(8,29,42,0.82), rgba(10,43,60,0.88)), url(${soas})`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300 backdrop-blur-md">
            🌍 Global Opportunity Discovery
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Discover Opportunities <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              Around the World
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-200 sm:text-lg md:text-xl">
            Explore thousands of verified scholarships, internships, fellowships, grants, and career
            programs updated continuously from global sources.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 shadow-[0_25px_70px_rgba(8,29,42,0.5)] backdrop-blur-md md:flex-row"
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search scholarships, internships, grants, fellowships, jobs and more..."
                className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-300 outline-none transition focus:border-emerald-300 focus:bg-white/15"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#1c9c4d] to-[#32b86c] px-8 py-3.5 text-sm font-black text-white shadow-[0_12px_25px_rgba(28,156,77,0.4)] transition hover:brightness-110"
            >
              Search Opportunities
            </button>
          </form>

          {/* Category Chips */}
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeCategory === cat.value
                    ? "bg-emerald-400 text-slate-900"
                    : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/15 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="mx-auto max-w-6xl px-4 py-12 space-y-14">
        {/* Featured Opportunities */}
        {featured.length > 0 && (
          <section>
            <SectionHeading linkTo="/opportunities?featured=true">
              Featured Global Opportunities
            </SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((opp) => (
                <OpportunityCard key={opp._id} opp={opp} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Opportunities */}
        <section>
          <SectionHeading linkTo="/opportunities?sort=latest">
            Latest Discoveries
          </SectionHeading>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Loading latest opportunities from around the world...
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((opp) => (
                <OpportunityCard key={opp._id} opp={opp} />
              ))}
            </div>
          )}
        </section>

        {/* Fully Funded Highlights */}
        {fullyFunded.length > 0 && (
          <section>
            <SectionHeading accent="bg-emerald-600" linkTo="/opportunities?fundingType=fully_funded">
              Fully Funded Highlights
            </SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {fullyFunded.map((opp) => (
                <OpportunityCard key={opp._id} opp={opp} />
              ))}
            </div>
          </section>
        )}

        {/* Closing Soon */}
        {closingSoon.length > 0 && (
          <section>
            <SectionHeading accent="bg-red-500" linkTo="/opportunities?closingSoon=true">
              Closing Soon (Next 7 Days)
            </SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {closingSoon.map((opp) => (
                <OpportunityCard key={opp._id} opp={opp} />
              ))}
            </div>
          </section>
        )}

        {/* Personalized Call To Action */}
        <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0a2b3c_0%,#123d52_40%,#1c9c4d_100%)] p-8 text-white shadow-xl sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              Personalized Matching
            </span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Get Matched with Opportunities Specifically For You
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-100 sm:text-lg">
              Set your country, degree level, study fields, and interests to receive intelligent match
              scores, transparent eligibility explanations, and deadline alerts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="rounded-xl bg-white px-8 py-3.5 text-sm font-black text-[#0a2b3c] shadow-lg transition hover:bg-slate-100"
              >
                Create Free Profile
              </Link>
              <Link
                to="/opportunities"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Browse All Opportunities
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
