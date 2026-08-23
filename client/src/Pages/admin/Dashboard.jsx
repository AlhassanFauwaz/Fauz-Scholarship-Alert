import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [mostSaved, setMostSaved] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setStats(res.data.stats);
      setMostSaved(res.data.mostSaved);
      setRecentUsers(res.data.recentUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-primary-500">
            Admin Dashboard
          </h1>
        </div>
        <div className="rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-xs font-semibold text-secondary-700">
          Live metrics
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: stats.totalUsers,
            tone: "from-[#0a2b3c] to-[#124d67]",
            accent: "bg-[#0a2b3c]",
          },
          {
            label: "Active Users",
            value: stats.activeUsers,
            tone: "from-[#1c9c4d] to-[#38b66d]",
            accent: "bg-[#1c9c4d]",
          },
          {
            label: "Published Opps",
            value: stats.publishedOpportunities,
            tone: "from-[#0f766e] to-[#10b981]",
            accent: "bg-[#10b981]",
          },
          {
            label: "Notifications",
            value: stats.totalNotifications,
            tone: "from-[#f59e0b] to-[#fbbf24]",
            accent: "bg-[#f59e0b]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(10,43,60,0.08)]"
          >
            <div className={`h-1.5 bg-gradient-to-r ${stat.tone}`} />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {stat.label}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${stat.accent}`} />
              </div>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <h2 className="mb-4 text-lg font-bold text-primary-500">
            Opportunity Breakdown
          </h2>
          <div className="space-y-3">
            {[
              ["Scholarships", stats.totalScholarships],
              ["Internships", stats.totalInternships],
              ["Fellowships", stats.totalFellowships],
              ["Grants", stats.totalGrants],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-slate-600">
                  {label}
                </span>
                <span className="text-base font-bold text-slate-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <h2 className="mb-4 text-lg font-bold text-primary-500">
            Notification Status
          </h2>
          <div className="space-y-3">
            {[
              ["Total Sent", stats.totalNotifications],
              ["Successful", stats.successfulNotifications, "text-emerald-600"],
              ["Failed", stats.failedNotifications, "text-red-600"],
              ["Subscriptions", stats.totalSubscriptions],
            ].map(([label, value, className = "text-slate-900"]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-slate-600">
                  {label}
                </span>
                <span className={`text-base font-bold ${className}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <h2 className="mb-4 text-lg font-bold text-primary-500">
            Most Saved Opportunities
          </h2>
          {mostSaved.length === 0 ? (
            <p className="text-sm text-slate-500">No saved data yet.</p>
          ) : (
            <div className="space-y-3">
              {mostSaved.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-xs font-bold text-secondary-700">
                    {item.count} saves
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <h2 className="mb-4 text-lg font-bold text-primary-500">
            Recent Registrations
          </h2>
          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500">No recent users.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{u.fullName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
