import { useState, useEffect } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import OpportunityCard from "../components/OpportunityCard";
import soas from "../assets/soas.jpg";

function SectionHeading({ children, accent = "bg-[#1c9c4d]" }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-[#0a2b3c]">
      <span className={`inline-block h-6 w-1.5 rounded-full ${accent}`} />
      {children}
    </h2>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [internships, setInternships] = useState([]);
  const [fellowships, setFellowships] = useState([]);
  const [grants, setGrants] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          featuredRes,
          latestRes,
          closingRes,
          schRes,
          intRes,
          felRes,
          grtRes,
        ] = await Promise.all([
          API.get("/opportunities", { params: { featured: true, limit: 4 } }),
          API.get("/opportunities", { params: { sort: "latest", limit: 6 } }),
          API.get("/opportunities", {
            params: { closingSoon: true, sort: "deadline", limit: 4 },
          }),
          API.get("/opportunities", {
            params: { type: "scholarship", limit: 4 },
          }),
          API.get("/opportunities", {
            params: { type: "internship", limit: 4 },
          }),
          API.get("/opportunities", {
            params: { type: "fellowship", limit: 4 },
          }),
          API.get("/opportunities", { params: { type: "grant", limit: 4 } }),
        ]);
        setFeatured(featuredRes.data.opportunities || []);
        setLatest(latestRes.data.opportunities || []);
        setClosingSoon(closingRes.data.opportunities || []);
        setScholarships(schRes.data.opportunities || []);
        setInternships(intRes.data.opportunities || []);
        setFellowships(felRes.data.opportunities || []);
        setGrants(grtRes.data.opportunities || []);
      } catch (err) {
        console.error("Failed to load home page data", err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const keyword = search.trim();

    if (keyword) params.set("keyword", keyword);
    if (searchType) params.set("type", searchType);

    const query = params.toString();
    navigate(`/opportunities${query ? `?${query}` : ""}`);
  };

  return (
    <div className="bg-[#f3f8fb]">
      {/* Hero Section with background image */}
      <section className="relative overflow-hidden bg-cover bg-center py-20 text-white" 
        style={{
          backgroundImage: `linear-gradient(rgba(8,29,42,0.75), rgba(10,43,60,0.75)), url(${soas})`,
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Fauz Scholarship Alert
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Find your next opportunity
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-emerald-50 md:text-xl">
            Scholarships, internships, fellowships, grants, and career-building
            opportunities—all in one smart platform.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-[0_25px_70px_rgba(8,29,42,0.4)] backdrop-blur-sm md:flex-row"
          >
            <input
              type="text"
              placeholder="Search by keyword..."
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 outline-none focus:border-emerald-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300"
            >
              <option value="" className="text-slate-900">
                All Types
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
            </select>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#1c9c4d] to-[#32b86c] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.4)] transition hover:brightness-110"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading>Featured opportunities</SectionHeading>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <SectionHeading>Latest opportunities</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0a2b3c] transition hover:text-[#1c9c4d]"
          >
            View all opportunities <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-red-600">
            <span className="inline-block h-6 w-1.5 rounded-full bg-red-500" />
            Closing soon
          </h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {closingSoon.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} />
            ))}
          </div>
        </section>
      )}

      {/* Scholarships */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <SectionHeading>Scholarships</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {scholarships.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} />
          ))}
        </div>
      </section>

      {/* Internships */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <SectionHeading accent="bg-sky-700">Internships</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {internships.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} />
          ))}
        </div>
      </section>

      {/* Fellowships */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <SectionHeading accent="bg-violet-600">Fellowships</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {fellowships.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} />
          ))}
        </div>
      </section>

      {/* Grants */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <SectionHeading accent="bg-cyan-700">Grants</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {grants.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 bg-[linear-gradient(135deg,#0a2b3c_0%,#123d52_35%,#1c9c4d_100%)] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-black md:text-4xl">
            Never miss an opportunity again
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-100">
            Create an account to receive tailored recommendations, deadline
            alerts, and curated updates that match your profile.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-bold text-[#0a2b3c] shadow-[0_18px_40px_rgba(10,43,60,0.2)] transition hover:bg-slate-100"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* About & Contact */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(10,43,60,0.07)]">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
              <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
              About Fauz Scholarship Alert
            </h3>
            <p className="leading-7 text-slate-600">
              Fauz Scholarship Alert helps students and professionals discover the right
              scholarships, internships, fellowships, and grants with smarter
              matching and insight-driven recommendations.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(10,43,60,0.07)]">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
              <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
              Contact us
            </h3>
            <p className="leading-7 text-slate-600">
              Questions or feedback? Reach us at{" "}
              <a
                href="mailto:support@soas.com"
                className="font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
              >
                support@soas.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
