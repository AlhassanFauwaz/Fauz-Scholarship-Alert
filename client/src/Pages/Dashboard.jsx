import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import OpportunityCard from "../components/OpportunityCard";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [newOpportunities, setNewOpportunities] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [recResult, savedResult, notifResult] = await Promise.allSettled([
        API.get("/matching/recommendations"),
        API.get("/saved-opportunities"),
        API.get("/notifications"),
      ]);

      if (recResult.status === "fulfilled") {
        setRecommendations(recResult.value.data.recommendations || []);
        setNewOpportunities(recResult.value.data.newOpportunities || []);
        setClosingSoon(recResult.value.data.closingSoon || []);
      }

      if (savedResult.status === "fulfilled") {
        setSavedCount(savedResult.value.data.saved?.length || 0);
      }

      if (notifResult.status === "fulfilled") {
        const unread = (notifResult.value.data.notifications || []).filter(
          (n) => !n.read
        ).length;
        setNotifCount(unread);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDismiss = async (oppId) => {
    try {
      await API.post(`/matching/dismiss/${oppId}`);
      setRecommendations((prev) => prev.filter((o) => o._id !== oppId));
      setNewOpportunities((prev) => prev.filter((o) => o._id !== oppId));
      setClosingSoon((prev) => prev.filter((o) => o._id !== oppId));
    } catch (err) {
      console.error("Failed to dismiss opportunity", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg font-medium text-slate-500">Loading your personalized dashboard...</p>
      </div>
    );
  }

  const isProfileIncomplete =
    !user?.profile?.educationLevel || !user?.profile?.fieldOfStudy || !user?.profile?.country;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Email verification alert */}
      {user && !user.emailVerified && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">Email not verified</p>
            <p className="text-xs text-amber-700">Please verify your email address to receive immediate alert broadcasts.</p>
          </div>
          <Link
            to="/verify-email"
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
          >
            Verify Email
          </Link>
        </div>
      )}

      {/* Incomplete profile helper card */}
      {isProfileIncomplete && (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div>
            <p className="text-sm font-bold text-emerald-900">✨ Complete Your Academic & Career Profile</p>
            <p className="text-xs text-emerald-700">
              Add your degree level, study fields, and destination preferences to unlock precision 90%+ match recommendations.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center rounded-xl bg-[#1c9c4d] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
          >
            Update Profile →
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1c9c4d]">
            Personalized Feed
          </p>
          <h2 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            Welcome back, {user?.fullName || "Scholar"}!
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {user?.profile?.country ? `📍 ${user.profile.country}` : "Global"} •{" "}
            {user?.profile?.fieldOfStudy || "All Fields"} •{" "}
            <span className="capitalize">{user?.profile?.educationLevel || "Student"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/opportunities"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Explore Global Feed
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/saved"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(10,43,60,0.06)] transition hover:-translate-y-1"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Opportunities</p>
          <p className="mt-2 text-3xl font-black text-[#0a2b3c]">{savedCount}</p>
        </Link>

        <Link
          to="/notifications"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(10,43,60,0.06)] transition hover:-translate-y-1"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unread Alerts</p>
          <p className="mt-2 text-3xl font-black text-[#1c9c4d]">{notifCount}</p>
        </Link>

        <Link
          to="/profile"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(10,43,60,0.06)] transition hover:-translate-y-1"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Match Engine</p>
          <p className="mt-2 text-base font-bold text-[#0a2b3c]">
            {isProfileIncomplete ? "⚠️ Action Needed" : "✓ Active"}
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(10,43,60,0.06)]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Matches</p>
          <p className="mt-2 text-3xl font-black text-[#0a2b3c]">{recommendations.length}</p>
        </div>
      </div>

      {/* Recommended For You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-2xl font-black text-[#0a2b3c]">
            <span className="inline-block h-6 w-1.5 rounded-full bg-[#1c9c4d]" />
            Recommended for You
          </h3>
          <span className="text-xs font-semibold text-slate-500">Ranked by qualification & interests</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
            <p className="text-base font-bold text-slate-700">No matching recommendations found yet.</p>
            <p className="mt-1 text-xs">Update your profile or explore the global opportunity feed.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} onDismiss={handleDismiss} />
            ))}
          </div>
        )}
      </section>

      {/* New Discoveries For Your Field */}
      {newOpportunities.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-black text-[#0a2b3c]">
              <span className="inline-block h-6 w-1.5 rounded-full bg-sky-500" />
              New Opportunities Discovered This Week
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newOpportunities.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} onDismiss={handleDismiss} />
            ))}
          </div>
        </section>
      )}

      {/* Closing Soon Matches */}
      {closingSoon.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-2xl font-black text-red-600">
              <span className="inline-block h-6 w-1.5 rounded-full bg-red-500" />
              Closing Soon (Action Required)
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {closingSoon.map((opp) => (
              <OpportunityCard key={opp._id} opp={opp} onDismiss={handleDismiss} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
