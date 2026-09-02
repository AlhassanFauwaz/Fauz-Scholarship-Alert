import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function VerificationQueue() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/opportunities", {
        params: { verificationStatus: "pending" },
      });
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, status) => {
    setProcessingId(id);
    try {
      await API.put(`/admin/opportunities/${id}/verify`, {
        verificationStatus: status,
        autoPublish: status === "verified",
      });
      setMessage(`Opportunity successfully marked as ${status}!`);
      setOpportunities((prev) => prev.filter((o) => o._id !== id));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Verification action failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
          Moderation & Trust
        </p>
        <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
          Opportunity Verification Queue
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Review newly discovered opportunities from internet sources before publishing them globally.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          ✓ {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          Loading verification queue...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <p className="text-2xl">🎉</p>
          <p className="mt-2 text-base font-bold text-slate-800">All caught up!</p>
          <p className="mt-1 text-xs text-slate-500">There are no pending opportunities awaiting moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">
              {opportunities.length} pending opportunities waiting for review
            </p>
          </div>

          <div className="grid gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold capitalize text-slate-700">
                      {opp.type}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Pending Verification
                    </span>
                    {opp.sourceName && (
                      <span className="text-[11px] text-slate-400">
                        Source: <span className="font-semibold text-slate-600">{opp.sourceName}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#0a2b3c]">{opp.title}</h3>

                  <p className="text-xs text-slate-600 line-clamp-2">{opp.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>📍 {opp.country || "Global"}</span>
                    <span>💰 {opp.fundingType || "N/A"}</span>
                    <span>
                      ⏰ Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
                  <button
                    onClick={() => handleVerify(opp._id, "verified")}
                    disabled={processingId === opp._id}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    ✓ Verify & Publish
                  </button>

                  <button
                    onClick={() => handleVerify(opp._id, "rejected")}
                    disabled={processingId === opp._id}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>

                  <Link
                    to={`/admin/opportunities/edit/${opp._id}`}
                    className="text-xs font-semibold text-[#0a2b3c] hover:underline"
                  >
                    Edit Details ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
