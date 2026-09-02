import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";
import fallbackImage from "../assets/soas.jpg";

const fundingLabels = {
  fully_funded: "Fully Funded",
  partially_funded: "Partially Funded",
  tuition_only: "Tuition Only",
  stipend: "Stipend Provided",
  paid: "Paid Opportunity",
  no_funding: "Unfunded / No Financial Support",
  unpaid: "Unpaid",
  other: "Financial Details in Application",
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const res = await API.get(`/opportunities/${id}`);
      const opp = res.data.opportunity;
      setOpportunity(opp);

      if (user) {
        // Fetch saved status and match data
        const [savedRes, recRes] = await Promise.allSettled([
          API.get("/saved-opportunities"),
          API.get("/matching/recommendations"),
        ]);

        if (savedRes.status === "fulfilled") {
          const isSaved = (savedRes.value.data.saved || []).some(
            (s) => s.opportunity?._id === opp._id || s.opportunity?.slug === opp.slug
          );
          setSaved(isSaved);
        }

        if (recRes.status === "fulfilled") {
          const allRecs = [
            ...(recRes.value.data.recommendations || []),
            ...(recRes.value.data.newOpportunities || []),
            ...(recRes.value.data.closingSoon || []),
          ];
          const matchedItem = allRecs.find((r) => r._id === opp._id);
          if (matchedItem) {
            setMatchData({
              score: matchedItem.matchScore,
              reasons: matchedItem.matchReasons || [],
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (opportunity?._id) {
      API.post(`/opportunities/${opportunity._id}/click`).catch(() => {});
    }
  };

  const handleSave = async () => {
    if (!user) return alert("Please log in to save opportunities");
    try {
      await API.post(`/opportunities/${opportunity._id}/save`);
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save opportunity");
    }
  };

  const handleUnsave = async () => {
    try {
      await API.delete(`/opportunities/${opportunity._id}/save`);
      setSaved(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove opportunity");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0a2b3c] border-t-[#1c9c4d]" />
          <p>Loading opportunity details...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg font-bold text-slate-700">Opportunity not found.</p>
        <Link
          to="/opportunities"
          className="mt-4 inline-block font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
        >
          ← Browse other opportunities
        </Link>
      </div>
    );
  }

  const daysLeft = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isVerified =
    opportunity.verificationStatus === "verified" ||
    opportunity.verificationStatus === "official_source";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/opportunities"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
      >
        <span aria-hidden="true">←</span> Back to all opportunities
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(10,43,60,0.1)]">
        {/* Banner Header */}
        <div className="relative bg-[linear-gradient(135deg,#0a2b3c_0%,#103f54_40%,#1c9c4d_100%)] px-6 py-10 text-white md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-md">
              {opportunity.type ? opportunity.type.replace("_", " ") : "Opportunity"}
            </span>

            {isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                ✓ Verified Official Opportunity
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-black sm:text-4xl">
            {opportunity.title}
          </h1>

          <p className="mt-2 text-base text-emerald-100 sm:text-lg">
            Organized by{" "}
            <span className="font-bold text-white">
              {opportunity.organization || opportunity.provider}
            </span>
          </p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Recommendation Match Score Box (If Logged In and Available) */}
          {matchData && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Personalized Match
                  </span>
                  <h3 className="mt-1 text-xl font-black text-emerald-950">
                    {matchData.score}% Match For Your Profile
                  </h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                  ✓
                </span>
              </div>

              {matchData.reasons && matchData.reasons.length > 0 && (
                <div className="mt-4 border-t border-emerald-200/80 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Why this matches you:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-emerald-800">
                    {matchData.reasons.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Key Quick Facts Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Funding Status
              </p>
              <p className="mt-1 font-bold capitalize text-[#0a2b3c]">
                {opportunity.fundingType
                  ? fundingLabels[opportunity.fundingType] || opportunity.fundingType
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Location & Mode
              </p>
              <p className="mt-1 font-bold text-[#0a2b3c]">
                {opportunity.country || opportunity.region || "Global"}
                {opportunity.isRemote ? " (Remote)" : ""}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Target Degree
              </p>
              <p className="mt-1 font-bold capitalize text-[#0a2b3c]">
                {opportunity.degreeLevels?.join(", ") ||
                  opportunity.eligibility?.minEducationLevel ||
                  "All levels"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Application Deadline
              </p>
              <p className="mt-1 font-bold text-[#0a2b3c]">
                {opportunity.deadline
                  ? new Date(opportunity.deadline).toLocaleDateString()
                  : "Rolling"}
              </p>
              {daysLeft !== null && (
                <p
                  className={`mt-0.5 text-xs font-semibold ${
                    daysLeft <= 7 && daysLeft >= 0
                      ? "text-red-600"
                      : daysLeft < 0
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {daysLeft > 0 ? `${daysLeft} days remaining` : "Deadline passed"}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
              <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
              Opportunity Overview
            </h3>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {opportunity.description}
            </p>
          </div>

          {/* Benefits / Funding Breakdown */}
          {opportunity.benefits && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
                <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
                Benefits & Financial Support
              </h3>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {opportunity.benefits}
              </p>
            </div>
          )}

          {/* Eligibility & Requirements */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
              <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
              Eligibility Criteria
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {opportunity.fieldsOfStudy?.length > 0 && (
                <li>
                  • <span className="font-semibold text-slate-800">Fields of Study:</span>{" "}
                  {opportunity.fieldsOfStudy.join(", ")}
                </li>
              )}
              {opportunity.eligibleCountries?.length > 0 && (
                <li>
                  • <span className="font-semibold text-slate-800">Eligible Nationalities/Countries:</span>{" "}
                  {opportunity.eligibleCountries.join(", ")}
                </li>
              )}
              {opportunity.skills?.length > 0 && (
                <li>
                  • <span className="font-semibold text-slate-800">Relevant Skills:</span>{" "}
                  {opportunity.skills.join(", ")}
                </li>
              )}
              {opportunity.eligibility?.gender && (
                <li>
                  • <span className="font-semibold text-slate-800">Gender Eligibility:</span>{" "}
                  <span className="capitalize">{opportunity.eligibility.gender}</span>
                </li>
              )}
              {opportunity.eligibility?.other && (
                <li>
                  • <span className="font-semibold text-slate-800">Additional Criteria:</span>{" "}
                  {opportunity.eligibility.other}
                </li>
              )}
            </ul>
          </div>

          {/* Official Website vs Info Source Notice */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-bold text-slate-800">🛡️ Verified Source Integrity</p>
            <p className="mt-1">
              Fauz Opportunity Alert does not process applications or collect personal submission documents. Always apply directly on the official host organization's website.
            </p>
            {opportunity.sourceName && (
              <p className="mt-2 text-[11px] text-slate-500">
                Information gathered from: <span className="font-semibold">{opportunity.sourceName}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6">
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110"
            >
              Apply on Official Website ↗
            </a>

            {user && (
              <button
                onClick={saved ? handleUnsave : handleSave}
                className={`rounded-xl border px-5 py-3.5 text-sm font-bold transition ${
                  saved
                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                {saved ? "Saved ✓" : "Save Opportunity"}
              </button>
            )}

            <button
              onClick={handleShare}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {copied ? "Link Copied ✓" : "Share Opportunity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
