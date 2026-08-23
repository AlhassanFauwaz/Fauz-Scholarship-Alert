import { useState } from "react";
import API from "../services/api";

export default function Feedback() {
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await API.post("/feedback", { category, message });
      setSuccess(true);
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
          Support
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#0a2b3c]">
          Submit feedback
        </h2>
      </div>

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          Thank you! Your feedback has been submitted.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(10,43,60,0.08)] md:p-8"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
          >
            <option value="general">General feedback</option>
            <option value="suggestion">Suggestion</option>
            <option value="incorrect-info">Incorrect information</option>
            <option value="expired-opp">Expired opportunity</option>
            <option value="technical">Technical problem</option>
            <option value="report-opp">Report an opportunity</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
            rows={5}
            placeholder="Describe your feedback..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-4 py-3 font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
