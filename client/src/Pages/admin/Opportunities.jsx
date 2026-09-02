import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

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

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    verificationStatus: "",
    keyword: "",
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;
      if (filters.keyword) params.keyword = filters.keyword;

      const res = await API.get("/admin/opportunities", { params });
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await API.delete(`/opportunities/${id}`);
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
            Database & Content
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            Manage Opportunities
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            View, search, filter, and manage global educational and professional opportunities.
          </p>
        </div>

        <Link
          to="/admin/opportunities/create"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110"
        >
          + New Opportunity
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          placeholder="Search title, org, or country..."
          className="min-w-[180px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={filters.verificationStatus}
          onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="">All Verification</option>
          <option value="verified">Verified ✓</option>
          <option value="pending">Pending Moderation</option>
          <option value="unverified">Unverified</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-[#0a2b3c] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#1c9c4d]"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          Loading opportunities...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Verification</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Deadline</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No opportunities found matching these filters.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp._id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-[#0a2b3c]">
                      <div className="line-clamp-1">{opp.title}</div>
                      <span className="text-[11px] font-normal text-slate-400">
                        {opp.organization} • {opp.country || "Global"}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-slate-600 font-medium">{opp.type?.replace("_", " ")}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          opp.verificationStatus === "verified" || opp.verificationStatus === "official_source"
                            ? "bg-emerald-100 text-emerald-800"
                            : opp.verificationStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opp.verificationStatus === "verified" ? "✓ Verified" : opp.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          opp.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : opp.status === "draft"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/opportunities/edit/${opp._id}`}
                          className="font-bold text-[#0a2b3c] hover:text-[#1c9c4d]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(opp._id)}
                          className="font-bold text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
