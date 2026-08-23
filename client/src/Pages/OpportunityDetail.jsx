import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const res = await API.get(`/opportunities/${id}`);
      setOpportunity(res.data.opportunity);
      if (user) {
        const savedRes = await API.get("/saved-opportunities");
        const isSaved = (savedRes.data.saved || []).some(
          (s) => s.opportunity?._id === id,
        );
        setSaved(isSaved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return alert("Please login first");
    try {
      await API.post(`/opportunities/${id}/save`);
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save");
    }
  };

  const handleUnsave = async () => {
    try {
      await API.delete(`/opportunities/${id}/save`);
      setSaved(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0a2b3c] border-t-[#1c9c4d]" />
          <p>Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Opportunity not found.</p>
        <Link
          to="/"
          className="mt-3 inline-block font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/opportunities"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
      >
        <span aria-hidden="true">←</span> Back to opportunities
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(10,43,60,0.12)]">
        <div className="bg-[linear-gradient(135deg,#0a2b3c_0%,#103f54_40%,#1c9c4d_100%)] px-6 py-8 text-white md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {opportunity.type}
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            {opportunity.title}
          </h1>
          <p className="mt-2 text-lg text-emerald-50">
            by {opportunity.organization}
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Type
              </p>
              <p className="mt-2 font-bold capitalize text-[#0a2b3c]">
                {opportunity.type}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Category
              </p>
              <p className="mt-2 font-bold text-[#0a2b3c]">
                {opportunity.category || "General"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Country
              </p>
              <p className="mt-2 font-bold text-[#0a2b3c]">
                {opportunity.country || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Deadline
              </p>
              <p className="mt-2 font-bold text-[#0a2b3c]">
                {new Date(opportunity.deadline).toLocaleDateString()}
              </p>
              <p
                className={`mt-1 text-xs ${daysLeft <= 7 ? "font-bold text-red-600" : "text-slate-500"}`}
              >
                {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
                <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
                Description
              </h3>
              <p className="whitespace-pre-line leading-7 text-slate-600">
                {opportunity.description}
              </p>
            </div>

            {opportunity.benefits && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
                  <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
                  Benefits / funding
                </h3>
                <p className="leading-7 text-slate-600">
                  {opportunity.benefits}
                </p>
              </div>
            )}

            {opportunity.eligibility && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
                  <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
                  Eligibility
                </h3>
                <ul className="space-y-2 text-slate-600">
                  {opportunity.eligibility.minEducationLevel && (
                    <li>
                      • Minimum education:{" "}
                      <span className="font-semibold text-slate-800">
                        {opportunity.eligibility.minEducationLevel}
                      </span>
                    </li>
                  )}
                  {opportunity.eligibility.fieldOfStudy && (
                    <li>
                      • Field of study:{" "}
                      <span className="font-semibold text-slate-800">
                        {opportunity.eligibility.fieldOfStudy}
                      </span>
                    </li>
                  )}
                  {opportunity.eligibility.countryEligibility?.length > 0 && (
                    <li>
                      • Eligible countries:{" "}
                      <span className="font-semibold text-slate-800">
                        {opportunity.eligibility.countryEligibility.join(", ")}
                      </span>
                    </li>
                  )}
                  {opportunity.eligibility.gender && (
                    <li>
                      • Gender: {" "}
                      <span className="font-semibold capitalize text-slate-800">
                        {opportunity.eligibility.gender}
                      </span>
                    </li>
                  )}
                  {opportunity.eligibility.other && (
                    <li className="whitespace-pre-line">
                      • Additional requirements: {" "}
                      <span className="font-semibold text-slate-800">
                        {opportunity.eligibility.other}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-200 pt-6">
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-3 font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110"
            >
              Apply now
            </a>

            {user &&
              (saved ? (
                <button
                  onClick={handleUnsave}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Saved ✓
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Save opportunity
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
