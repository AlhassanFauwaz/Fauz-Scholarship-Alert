import { useState, useEffect } from "react";
import API from "../services/api";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    opportunityTypes: [],
    categories: [],
    fields: [],
    countries: [],
    educationLevels: [],
    keywords: [],
    notificationChannels: { email: true, sms: false, inApp: true },
    frequency: "instant",
  });

  const resetForm = () => {
    setForm({
      name: "",
      opportunityTypes: [],
      categories: [],
      fields: [],
      countries: [],
      educationLevels: [],
      keywords: [],
      notificationChannels: { email: true, sms: false, inApp: true },
      frequency: "instant",
    });
    setShowForm(false);
    setEditId(null);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await API.get("/subscriptions");
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("channel.")) {
      const channel = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        notificationChannels: {
          ...prev.notificationChannels,
          [channel]: checked,
        },
      }));
    } else if (type === "select-multiple") {
      const options = Array.from(
        e.target.selectedOptions,
        (option) => option.value,
      );
      setForm((prev) => ({ ...prev, [name]: options }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        keywords:
          typeof form.keywords === "string"
            ? form.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : form.keywords,
        categories:
          typeof form.categories === "string"
            ? form.categories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : form.categories,
        countries:
          typeof form.countries === "string"
            ? form.countries
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : form.countries,
        fields:
          typeof form.fields === "string"
            ? form.fields
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean)
            : form.fields,
      };

      if (editId) {
        await API.put(`/subscriptions/${editId}`, payload);
      } else {
        await API.post("/subscriptions", payload);
      }
      resetForm();
      fetchSubscriptions();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving subscription");
    }
  };

  const toggleActive = async (id) => {
    await API.put(`/subscriptions/${id}/toggle`);
    fetchSubscriptions();
  };

  const deleteSub = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    await API.delete(`/subscriptions/${id}`);
    fetchSubscriptions();
  };

  const editSub = (sub) => {
    setForm({
      name: sub.name || "",
      opportunityTypes: sub.opportunityTypes || [],
      categories: sub.categories || [],
      fields: sub.fields || [],
      countries: sub.countries || [],
      educationLevels: sub.educationLevels || [],
      keywords: sub.keywords || [],
      notificationChannels: sub.notificationChannels || {
        email: true,
        sms: false,
        inApp: true,
      },
      frequency: sub.frequency || "instant",
    });
    setEditId(sub._id);
    setShowForm(true);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading subscriptions...
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
            Alerts
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#0a2b3c]">
            My subscriptions
          </h2>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.2)]"
        >
          {showForm ? "Cancel" : "+ New subscription"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(10,43,60,0.08)]"
        >
          <h3 className="text-xl font-bold text-[#0a2b3c]">
            {editId ? "Edit subscription" : "Create subscription"}
          </h3>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Name (optional)
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
              placeholder="My scholarship alert"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Opportunity types
              </label>
              <select
                multiple
                name="opportunityTypes"
                value={form.opportunityTypes}
                onChange={handleChange}
                className="h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="scholarship">Scholarship</option>
                <option value="internship">Internship</option>
                <option value="fellowship">Fellowship</option>
                <option value="grant">Grant</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Education levels
              </label>
              <select
                multiple
                name="educationLevels"
                value={form.educationLevels}
                onChange={handleChange}
                className="h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
              >
                <option value="highschool">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="phd">PhD</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Categories
              </label>
              <input
                name="categories"
                value={
                  Array.isArray(form.categories)
                    ? form.categories.join(", ")
                    : form.categories
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
                placeholder="STEM, Business"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fields
              </label>
              <input
                name="fields"
                value={
                  Array.isArray(form.fields)
                    ? form.fields.join(", ")
                    : form.fields
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Countries
              </label>
              <input
                name="countries"
                value={
                  Array.isArray(form.countries)
                    ? form.countries.join(", ")
                    : form.countries
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
                placeholder="Ghana, UK"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Keywords
              </label>
              <input
                name="keywords"
                value={
                  Array.isArray(form.keywords)
                    ? form.keywords.join(", ")
                    : form.keywords
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white"
                placeholder="engineering, scholarship"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Frequency
              </label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="channel.email"
                  checked={form.notificationChannels.email}
                  onChange={handleChange}
                />{" "}
                Email
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="channel.sms"
                  checked={form.notificationChannels.sms}
                  onChange={handleChange}
                />{" "}
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="channel.inApp"
                  checked={form.notificationChannels.inApp}
                  onChange={handleChange}
                />{" "}
                In-app
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-4 py-3 font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110"
          >
            {editId ? "Update subscription" : "Create subscription"}
          </button>
        </form>
      )}

      {subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
          No subscriptions yet. Create one to get custom alerts.
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className={`rounded-2xl border p-5 shadow-[0_18px_45px_rgba(10,43,60,0.06)] ${sub.active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-80"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-[#0a2b3c]">
                    {sub.name || "Unnamed subscription"}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    {sub.opportunityTypes?.join(", ") || "All types"} |{" "}
                    {sub.countries?.join(", ") || "All countries"} |{" "}
                    {sub.fields?.join(", ") || "All fields"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${sub.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}
                >
                  {sub.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => toggleActive(sub._id)}
                  className="text-sm font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
                >
                  {sub.active ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => editSub(sub)}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSub(sub._id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
