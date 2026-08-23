import { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function SavedOpportunities() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const res = await API.get("/saved-opportunities");
      setSaved(res.data.saved || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (oppId) => {
    try {
      await API.delete(`/opportunities/${oppId}/save`);
      setSaved((prev) => prev.filter((s) => s.opportunity?._id !== oppId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading saved opportunities...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
          Bookmarks
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#0a2b3c]">
          Saved opportunities
        </h2>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
          <p className="text-lg font-semibold text-slate-700">
            No saved opportunities yet.
          </p>
          <p className="mt-2 text-sm">
            Browse opportunities and click “Save” to keep the ones you like.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map((item) => (
            <div
              key={item._id}
              className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,43,60,0.06)] sm:flex-row sm:justify-between"
            >
              <div>
                <Link
                  to={`/opportunity/${item.opportunity?._id}`}
                  className="text-lg font-bold text-[#0a2b3c] hover:text-[#1c9c4d]"
                >
                  {item.opportunity?.title}
                </Link>
                <p className="mt-2 text-sm text-slate-600">
                  {item.opportunity?.organization}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Type: {item.opportunity?.type} | Deadline:{" "}
                  {new Date(item.opportunity?.deadline).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleUnsave(item.opportunity?._id)}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 sm:w-auto"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
