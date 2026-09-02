import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 25 };
      if (categoryFilter) params.category = categoryFilter;

      const res = await API.get("/admin/audit-logs", { params });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [categoryFilter]);

  const getCategoryBadge = (category) => {
    switch (category) {
      case "opportunity_override":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">Admin Override</span>;
      case "duplicate_merge":
        return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">Duplicate Merge</span>;
      case "verification":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Verification</span>;
      case "source_moderation":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">Source Moderation</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">{category}</span>;
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
          Security & Traceability
        </p>
        <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
          Audit Trail & System Actions
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Complete chronological record of administrative overrides, source moderations, and automated decisions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: "All Logs", value: "" },
            { label: "Admin Overrides", value: "opportunity_override" },
            { label: "Duplicate Merges", value: "duplicate_merge" },
            { label: "Verifications", value: "verification" },
            { label: "Source Moderations", value: "source_moderation" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                categoryFilter === tab.value
                  ? "bg-[#0a2b3c] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">{total} audit log entries</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          Loading audit trail...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          No audit log entries found for this category.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3 font-bold">Action / Details</th>
                <th className="p-3 font-bold">Category</th>
                <th className="p-3 font-bold">Performer</th>
                <th className="p-3 font-bold">Target</th>
                <th className="p-3 font-bold">Timestamp</th>
                <th className="p-3 font-bold">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/80">
                  <td className="p-3 max-w-sm">
                    <div className="font-bold text-[#0a2b3c]">{log.action?.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{log.details}</div>
                  </td>
                  <td className="p-3">{getCategoryBadge(log.category)}</td>
                  <td className="p-3 text-slate-700 font-semibold">
                    {log.performedBy?.fullName || "Automated System Worker"}
                  </td>
                  <td className="p-3 text-slate-500 font-medium">
                    {log.targetType} {log.targetId ? `(${log.targetId.substring(0, 8)}...)` : ''}
                  </td>
                  <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      View Details ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => fetchLogs(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="font-semibold text-slate-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => fetchLogs(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0a2b3c]">Audit Trail Snapshot</h2>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <p className="font-bold text-slate-700">Action & Details:</p>
                <p className="rounded-lg bg-slate-50 p-2.5 text-slate-900 font-medium">{selectedLog.details}</p>
              </div>

              {selectedLog.previousState && (
                <div>
                  <p className="font-bold text-slate-700">Previous State Snapshot:</p>
                  <pre className="max-h-36 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] text-amber-300 font-mono">
                    {JSON.stringify(selectedLog.previousState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newState && (
                <div>
                  <p className="font-bold text-slate-700">New State Snapshot:</p>
                  <pre className="max-h-36 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-400 font-mono">
                    {JSON.stringify(selectedLog.newState, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-[#0a2b3c] px-4 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
