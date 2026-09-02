import { useState, useEffect } from "react";
import API from "../../services/api";

export default function GlobalDiscovery() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDiscovery = async () => {
    setLoading(true);
    try {
      const res = await API.get("/discovery");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  }, []);

  const handleTriggerDiscovery = async () => {
    setScanning(true);
    setMessage("");
    try {
      const res = await API.post("/discovery/run");
      setMessage(res.data.message || "Discovery scan completed!");
      fetchDiscovery();
    } catch (err) {
      setMessage(err.response?.data?.message || "Discovery scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.post(`/discovery/approve/${id}`);
      setMessage("Candidate source approved and activated!");
      fetchDiscovery();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this source?")) return;
    try {
      await API.post(`/discovery/block/${id}`);
      setMessage("Source blocked from automated collection.");
      fetchDiscovery();
    } catch (err) {
      alert(err.response?.data?.message || "Block action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs font-bold text-slate-500">Loading global discovery infrastructure...</p>
      </div>
    );
  }

  const { stats = {}, regionalCoverage = [], countryCoverage = [], candidateSources = [] } = data || {};

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
            Global Acquisition Infrastructure
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            Global Source Discovery & Coverage
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Autonomous multi-continent search engine continuously expanding the opportunity registry.
          </p>
        </div>

        <button
          onClick={handleTriggerDiscovery}
          disabled={scanning}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {scanning ? "Scanning Global Targets..." : "⚡ Run Discovery Scan Now"}
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          ✓ {message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Sources", value: stats.totalSources || 0, sub: "Registered Feeds & APIs", color: "text-slate-900" },
          { label: "Active & Healthy", value: stats.activeSources || 0, sub: "Actively Ingesting", color: "text-emerald-600" },
          { label: "Candidate Queue", value: stats.pendingSources || 0, sub: "Discovered / Review", color: "text-amber-600" },
          { label: "Opportunities Today", value: stats.collectedToday || 0, sub: "Auto-Ingested", color: "text-sky-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
            <p className={`mt-2 text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-[10px] text-slate-500 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Continental Coverage & Top Countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Continental Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#0a2b3c]">
            Continental Coverage & Density
          </h2>
          <div className="space-y-3 text-xs">
            {regionalCoverage.map((r) => {
              const regionName = r._id || "Worldwide";
              const count = r.sourceCount || 0;
              const pct = Math.min(count * 15, 100);
              return (
                <div key={regionName} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{regionName}</span>
                    <span className="text-slate-500">{count} sources ({r.opportunitiesCount || 0} opps)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Country Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#0a2b3c]">
            Top Destination & Eligible Countries
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {countryCoverage.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 font-medium text-slate-700"
              >
                <span className="truncate pr-1">📍 {c._id}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Sources Review Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0a2b3c]">
            Candidate Sources Awaiting Approval ({candidateSources.length})
          </h2>
          <span className="text-[11px] text-slate-400">Auto-discovered from legitimate institutional directories</span>
        </div>

        {candidateSources.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No candidate sources in the review queue. All discovered sources have been processed!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-700">
                <tr>
                  <th className="p-3 font-bold">Discovered Source</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Region / Country</th>
                  <th className="p-3 font-bold">Trust Score</th>
                  <th className="p-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateSources.map((src) => (
                  <tr key={src._id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-[#0a2b3c]">
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
                    <td className="p-3 capitalize text-slate-600 font-medium">
                      {src.sourceCategory?.replace("_", " ")}
                    </td>
                    <td className="p-3 text-slate-600">
                      {src.region} • {src.defaultCountry}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        🛡️ {src.trustScore}/100
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(src._id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Approve Source
                        </button>
                        <button
                          onClick={() => handleBlock(src._id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
