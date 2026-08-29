import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import OpportunityCard from "../components/OpportunityCard";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recResult, savedResult, notifResult] = await Promise.allSettled([
          API.get("/matching/recommendations"),
          API.get("/saved-opportunities"),
          API.get("/notifications"),
        ]);

        if (recResult.status === "fulfilled") {
          setRecommendations(recResult.value.data.recommendations || []);
        } else {
          console.error("Could not load recommendations:", recResult.reason);
        }

        if (savedResult.status === "fulfilled") {
          setSavedCount(savedResult.value.data.saved?.length || 0);
        } else {
          console.error("Could not load saved opportunities:", savedResult.reason);
        }

        if (notifResult.status === "fulfilled") {
          const unread = (notifResult.value.data.notifications || []).filter(
            (n) => !n.read,
          ).length;
          setNotifCount(unread);
        } else {
          console.error("Could not load notifications:", notifResult.reason);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Email verification banner */}
      {user && !user.emailVerified && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Email not verified
            </p>
            <p className="text-sm text-amber-700">
              Please check your inbox for the six-digit verification code.
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                window.location.assign("/verify-email");
              } catch (err) {
                alert(
                  err.response?.data?.message || "Failed to resend verification email"
                );
              }
            }}
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Verify email
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
            Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0a2b3c]">
            Welcome, {user?.fullName || "there"}!
          </h2>
        </div>
        <div className="rounded-full border border-[#1c9c4d]/20 bg-[#1c9c4d]/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#0a2b3c]">
          Personalized feed
        </div>
      </div>

      {/* Stats cards (unchanged) */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/saved"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)] transition hover:-translate-y-1"
        >
          <p className="text-sm font-medium text-slate-500">Saved</p>
          <p className="mt-3 text-4xl font-black text-[#0a2b3c]">
            {savedCount}
          </p>
        </Link>

        <Link
          to="/notifications"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)] transition hover:-translate-y-1"
        >
          <p className="text-sm font-medium text-slate-500">Unread alerts</p>
          <p className="mt-3 text-4xl font-black text-[#1c9c4d]">
            {notifCount}
          </p>
        </Link>

        <Link
          to="/profile"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)] transition hover:-translate-y-1"
        >
          <p className="text-sm font-medium text-slate-500">Profile</p>
          <p className="mt-3 text-xl font-bold text-[#0a2b3c]">
            Update details
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <p className="text-sm font-medium text-slate-500">Matches</p>
          <p className="mt-3 text-4xl font-black text-[#0a2b3c]">
            {recommendations.length}
          </p>
        </div>
      </div>

      {/* Recommendations (unchanged) */}
      <h3 className="mb-5 text-2xl font-black text-[#0a2b3c]">
        Recommended opportunities
      </h3>

      {recommendations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
          No recommendations yet. Complete your profile and check back later.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((opp) => (
          <OpportunityCard key={opp._id} opp={opp} />
        ))}
        </div>
      )}
    </div>
  );
}
