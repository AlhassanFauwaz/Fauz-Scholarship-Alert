import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [mostSaved, setMostSaved] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data.stats);
      setMostSaved(res.data.mostSaved || []);
      setMostViewed(res.data.mostViewed || []);
      setRecentUsers(res.data.recentUsers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500 text-xs font-bold">Loading admin metrics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500 text-xs">
        Failed to load platform statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
            Global Operations Center
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            Admin Overview
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/verification"
            className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            Review Queue ({stats.pendingVerificationOpportunities || 0})
          </Link>
          <Link
            to="/admin/sources"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            Manage Sources ({stats.totalSources || 0})
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Opportunities",
            value: stats.totalOpportunities,
            sub: `${stats.verifiedOpportunities || 0} Verified`,
            tone: "from-[#0a2b3c] to-[#124d67]",
          },
          {
            label: "Pending Verification",
            value: stats.pendingVerificationOpportunities || 0,
            sub: "Requires Moderation",
            tone: "from-[#d97706] to-[#f59e0b]",
          },
          {
            label: "Active Sources",
            value: stats.totalSources || 0,
            sub: `${stats.healthySources || 0} Healthy / ${stats.failedSources || 0} Failed`,
            tone: "from-[#1c9c4d] to-[#38b66d]",
          },
          {
            label: "Registered Users",
            value: stats.totalUsers,
            sub: `${stats.activeUsers || 0} Active`,
            tone: "from-[#4f46e5] to-[#6366f1]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className={`h-1.5 bg-gradient-to-r ${stat.tone}`} />
            <div className="p-4 sm:p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {stat.label}
              </span>
              <p className="mt-2 text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="mt-1 text-[11px] text-slate-500 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown & Source Health */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Breakdown by Type */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#0a2b3c]">
            Opportunities by Category
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Scholarships", stats.totalScholarships],
              ["Internships", stats.totalInternships],
              ["Fellowships", stats.totalFellowships],
              ["Grants", stats.totalGrants],
              ["Jobs", stats.totalJobs || 0],
              ["Competitions", stats.totalCompetitions || 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <span className="font-semibold text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System & Notification Delivery */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#0a2b3c]">
            System & Notification Health
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-semibold text-slate-600">Total Alerts Dispatched</span>
              <span className="font-bold text-slate-900">{stats.totalNotifications}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-semibold text-slate-600">Delivered Successfully</span>
              <span className="font-bold text-emerald-600">{stats.successfulNotifications}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="font-semibold text-slate-600">Failed Dispatches</span>
              <span className="font-bold text-red-600">{stats.failedNotifications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Saved & Most Viewed Opportunities */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#0a2b3c]">
            Most Saved Opportunities
          </h2>
          {mostSaved.length === 0 ? (
            <p className="text-xs text-slate-500">No bookmark data recorded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {mostSaved.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5"
                >
                  <span className="font-medium text-slate-800 line-clamp-1 flex-1 pr-2">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {item.count} saves
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#0a2b3c]">
            Most Viewed Opportunities
          </h2>
          {mostViewed.length === 0 ? (
            <p className="text-xs text-slate-500">No view analytics yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {mostViewed.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5"
                >
                  <span className="font-medium text-slate-800 line-clamp-1 flex-1 pr-2">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                    {item.viewsCount || 0} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
