import { useState, useEffect } from "react";
import API from "../../services/api";

const FREQUENCIES = [
  { label: "Every 15 minutes", value: "15m" },
  { label: "Every 30 minutes", value: "30m" },
  { label: "Every 1 hour", value: "1h" },
  { label: "Every 6 hours", value: "6h" },
  { label: "Every 12 hours", value: "12h" },
  { label: "Every 24 hours (Daily)", value: "24h" },
];

export default function AdminSources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const [form, setForm] = useState({
    name: "",
    websiteUrl: "",
    sourceType: "rss",
    rssUrl: "",
    apiEndpoint: "",
    defaultOpportunityType: "scholarship",
    defaultCountry: "Worldwide",
    frequency: "6h",
    active: true,
    autoPublish: false,
  });

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await API.get("/sources");
      setSources(res.data.sources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleOpenAdd = () => {
    setEditingSource(null);
    setForm({
      name: "",
      websiteUrl: "",
      sourceType: "rss",
      rssUrl: "",
      apiEndpoint: "",
      defaultOpportunityType: "scholarship",
      defaultCountry: "Worldwide",
      frequency: "6h",
      active: true,
      autoPublish: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (src) => {
    setEditingSource(src);
    setForm({
      name: src.name,
      websiteUrl: src.websiteUrl,
      sourceType: src.sourceType,
      rssUrl: src.rssUrl || "",
      apiEndpoint: src.apiEndpoint || "",
      defaultOpportunityType: src.defaultOpportunityType || "scholarship",
      defaultCountry: src.defaultCountry || "Worldwide",
      frequency: src.frequency || "6h",
      active: src.active ?? true,
      autoPublish: src.autoPublish ?? false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSource) {
        await API.put(`/sources/${editingSource._id}`, form);
        setMessage("Source updated successfully!");
      } else {
        await API.post("/sources", form);
        setMessage("New opportunity source created!");
      }
      setShowModal(false);
      fetchSources();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save source");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this opportunity source?")) return;
    try {
      await API.delete(`/sources/${id}`);
      fetchSources();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete source");
    }
  };

  const handleSyncNow = async (id) => {
    setSyncingId(id);
    try {
      const res = await API.post(`/sources/${id}/sync`);
      alert(res.data.message || "Sync completed successfully!");
      fetchSources();
    } catch (err) {
      alert(err.response?.data?.message || "Sync encountered an error");
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "healthy":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">✓ Healthy</span>;
      case "warning":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">⚠️ Warning</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">✕ Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">Disabled</span>;
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
            Automation Engine
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            Opportunity Sources
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage global RSS feeds, APIs, collection frequencies, and automatic synchronization health.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110"
        >
          + Add Opportunity Source
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          ✓ {message}
        </div>
      )}

      {/* Sources Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          Loading opportunity sources...
        </div>
      ) : sources.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-base font-bold text-slate-700">No opportunity sources configured.</p>
          <p className="mt-1 text-xs text-slate-500">Add an RSS feed or API endpoint to enable automated discovery.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th className="p-4 font-bold">Source Name</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Frequency</th>
                <th className="p-4 font-bold">Health</th>
                <th className="p-4 font-bold">Last Sync</th>
                <th className="p-4 font-bold">Found</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((src) => (
                <tr key={src._id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-[#0a2b3c]">
                    <div>{src.name}</div>
                    <a
                      href={src.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-normal text-slate-400 hover:text-emerald-600"
                    >
                      {src.websiteUrl}
                    </a>
                  </td>
                  <td className="p-4">
                    <span className="rounded bg-slate-100 px-2 py-1 uppercase font-bold text-slate-700">
                      {src.sourceType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{src.frequency}</td>
                  <td className="p-4">{getStatusBadge(src.healthStatus)}</td>
                  <td className="p-4 text-slate-500">
                    {src.lastSyncAt ? new Date(src.lastSyncAt).toLocaleString() : "Never"}
                    {src.lastErrorMessage && (
                      <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-red-500" title={src.lastErrorMessage}>
                        {src.lastErrorMessage}
                      </p>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-800">{src.opportunitiesFound || 0}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncNow(src._id)}
                        disabled={syncingId === src._id}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {syncingId === src._id ? "Syncing..." : "Sync Now"}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(src)}
                        className="font-semibold text-slate-600 hover:text-[#0a2b3c]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(src._id)}
                        className="font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add / Edit Source */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-[#0a2b3c]">
                {editingSource ? "Edit Opportunity Source" : "Add Opportunity Source"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700">Source Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAAD Scholarship Database"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Host Website URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Source Type</label>
                  <select
                    value={form.sourceType}
                    onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  >
                    <option value="rss">RSS / Atom Feed</option>
                    <option value="api">REST API</option>
                    <option value="approved_crawler">Approved Crawler</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Sync Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.sourceType === "rss" ? (
                <div>
                  <label className="mb-1 block font-bold text-slate-700">RSS / Atom Feed URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/feed.xml"
                    value={form.rssUrl}
                    onChange={(e) => setForm({ ...form, rssUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block font-bold text-slate-700">API Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://api.example.com/opportunities"
                    value={form.apiEndpoint}
                    onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Default Category</label>
                  <input
                    type="text"
                    value={form.defaultCategory}
                    onChange={(e) => setForm({ ...form, defaultCategory: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Default Country</label>
                  <input
                    type="text"
                    value={form.defaultCountry}
                    onChange={(e) => setForm({ ...form, defaultCountry: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.autoPublish}
                    onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Auto-publish opportunities from this trusted source without manual review
                </label>

                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Active Source (Scheduler will periodically poll this source)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1c9c4d] px-5 py-2 font-bold text-white shadow transition hover:brightness-110"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
