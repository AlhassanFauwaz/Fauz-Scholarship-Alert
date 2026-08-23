import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", type: "", keyword: "" });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.keyword) params.keyword = filters.keyword;

      const res = await API.get("/admin/opportunities", { params });
      setOpportunities(res.data.opportunities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?"))
      return;
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
            Content
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-primary-500">
            Manage Opportunities
          </h1>
        </div>

        <Link
          to="/admin/opportunities/create"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110"
        >
          + New Opportunity
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(10,43,60,0.07)]"
      >
        <input
          type="text"
          placeholder="Search keyword..."
          className="min-w-[180px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All Types</option>
          <option value="scholarship">Scholarship</option>
          <option value="internship">Internship</option>
          <option value="fellowship">Fellowship</option>
          <option value="grant">Grant</option>
          <option value="competition">Competition</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="expired">Expired</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#0a2b3c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123a4d]"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
          Loading...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(10,43,60,0.08)]">
          <table className="min-w-[680px] w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Deadline</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No opportunities found.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp) => (
                  <tr
                    key={opp._id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-800">
                      {opp.title}
                    </td>
                    <td className="p-4 capitalize text-slate-600">
                      {opp.type}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          opp.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : opp.status === "draft"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(opp.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <Link
                          to={`/admin/opportunities/edit/${opp._id}`}
                          className="font-medium text-[#0a2b3c] hover:text-[#123a4d]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(opp._id)}
                          className="font-medium text-red-600 hover:text-red-700"
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
