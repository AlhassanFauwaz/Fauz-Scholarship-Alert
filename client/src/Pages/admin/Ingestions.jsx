import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AdminIngestions() {
  const [ingestions, setIngestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIngestion, setSelectedIngestion] = useState(null);

  const fetchIngestions = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/admin/ingestions", { params });
      setIngestions(res.data.ingestions || []);
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
    fetchIngestions(1);
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "processed":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">✓ Processed</span>;
      case "duplicate_merged":
        return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">🔗 Merged Duplicate</span>;
      case "flagged_review":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">⚠️ Flagged</span>;
      case "rejected":
        return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">✕ Rejected / Spam</span>;
      case "failed":
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">✕ Ingestion Failed</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
          Auditability & Transparency
        </p>
        <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
          Raw Ingestion Audit Stream
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Inspection log of raw payloads, quality evaluation, duplicate merging, and error diagnostics.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: "All Items", value: "" },
            { label: "Processed", value: "processed" },
            { label: "Merged Duplicates", value: "duplicate_merged" },
            { label: "Flagged for Review", value: "flagged_review" },
            { label: "Rejected / Spam", value: "rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                statusFilter === tab.value
                  ? "bg-[#0a2b3c] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">{total} total ingestion records</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Loading raw ingestion records...
        </div>
      ) : ingestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          No ingestion records found matching this status filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3 font-bold">Raw Title / Payload</th>
                <th className="p-3 font-bold">Source</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold">Quality</th>
                <th className="p-3 font-bold">Retrieved At</th>
                <th className="p-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ingestions.map((ing) => (
                <tr key={ing._id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-medium text-[#0a2b3c] max-w-sm">
                    <div className="line-clamp-1 font-bold">{ing.rawTitle || "Untitled Payload"}</div>
                    <a
                      href={ing.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-emerald-600 truncate block"
                    >
                      {ing.sourceUrl}
                    </a>
                  </td>
                  <td className="p-3 text-slate-600 font-semibold">{ing.sourceName || ing.sourceId?.name || "Global Feed"}</td>
                  <td className="p-3">{getStatusBadge(ing.processingStatus)}</td>
                  <td className="p-3">
                    {ing.qualityScore !== undefined ? (
                      <span className="font-bold text-slate-800">{ing.qualityScore}/100</span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-500">{new Date(ing.retrievedAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedIngestion(ing)}
                      className="font-bold text-emerald-600 hover:underline"
                    >
                      Inspect Raw ↗
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
            onClick={() => fetchIngestions(page - 1)}
            disabled={page <= 1}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="font-semibold text-slate-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => fetchIngestions(page + 1)}
            disabled={page >= totalPages}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Inspect Raw Modal */}
      {selectedIngestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0a2b3c]">Raw Ingestion Audit Details</h2>
              <button
                onClick={() => setSelectedIngestion(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 text-xs">
              <div>
                <p className="font-bold text-slate-700">Raw Title:</p>
                <p className="rounded-lg bg-slate-50 p-2 text-slate-900 font-medium">{selectedIngestion.rawTitle}</p>
              </div>

              <div>
                <p className="font-bold text-slate-700">Source URL:</p>
                <a href={selectedIngestion.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  {selectedIngestion.sourceUrl}
                </a>
              </div>

              <div>
                <p className="font-bold text-slate-700">Raw Description / Snippet:</p>
                <p className="rounded-lg bg-slate-50 p-3 text-slate-800 whitespace-pre-wrap">{selectedIngestion.rawDescription || "No description provided."}</p>
              </div>

              {selectedIngestion.processingErrors?.length > 0 && (
                <div>
                  <p className="font-bold text-rose-600">Processing Errors / Flag Reason:</p>
                  <ul className="list-disc pl-4 text-rose-700">
                    {selectedIngestion.processingErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedIngestion.rawContent && (
                <div>
                  <p className="font-bold text-slate-700">Raw XML / Payload Snippet:</p>
                  <pre className="max-h-40 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-400 font-mono">
                    {selectedIngestion.rawContent}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedIngestion(null)}
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
