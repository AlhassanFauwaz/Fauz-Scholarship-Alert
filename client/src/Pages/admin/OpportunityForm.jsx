import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const OPPORTUNITY_TYPES = [
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

export default function OpportunityForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    type: "scholarship",
    category: "General",
    organization: "",
    provider: "",
    description: "",
    country: "Worldwide",
    region: "Worldwide",
    isRemote: false,
    fundingType: "other",
    fundingAmount: "",
    degreeLevels: "undergraduate",
    fieldsOfStudy: "",
    skills: "",
    documentsRequired: "",
    tags: "",
    applicationUrl: "",
    officialWebsite: "",
    sourceName: "",
    sourceUrl: "",
    deadline: "",
    status: "published",
    verificationStatus: "verified",
    featured: false,
    imageFile: null,
    imagePreview: null,
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      const fetchOpportunity = async () => {
        try {
          const res = await API.get(`/opportunities/${id}`);
          const opp = res.data.opportunity;
          setForm({
            title: opp.title || "",
            shortDescription: opp.shortDescription || "",
            type: opp.type || "scholarship",
            category: opp.category || "General",
            organization: opp.organization || "",
            provider: opp.provider || "",
            description: opp.description || "",
            country: opp.country || "Worldwide",
            region: opp.region || "Worldwide",
            isRemote: opp.isRemote || false,
            fundingType: opp.fundingType || "other",
            fundingAmount: opp.fundingAmount || "",
            degreeLevels: opp.degreeLevels?.join(", ") || opp.eligibility?.minEducationLevel || "",
            fieldsOfStudy: opp.fieldsOfStudy?.join(", ") || opp.eligibility?.fieldOfStudy || "",
            skills: opp.skills?.join(", ") || "",
            documentsRequired: opp.documentsRequired?.join(", ") || "",
            tags: opp.tags?.join(", ") || "",
            applicationUrl: opp.applicationUrl || "",
            officialWebsite: opp.officialWebsite || "",
            sourceName: opp.sourceName || "",
            sourceUrl: opp.sourceUrl || "",
            deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
            status: opp.status || "published",
            verificationStatus: opp.verificationStatus || "verified",
            featured: opp.featured || false,
            imageFile: null,
            imagePreview: null,
            image: opp.image || "",
          });
        } catch (err) {
          console.error(err);
          navigate("/admin/opportunities");
        }
      };
      fetchOpportunity();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("shortDescription", form.shortDescription);
    payload.append("type", form.type);
    payload.append("category", form.category);
    payload.append("organization", form.organization);
    payload.append("provider", form.provider);
    payload.append("description", form.description);
    payload.append("country", form.country);
    payload.append("region", form.region);
    payload.append("isRemote", form.isRemote);
    payload.append("fundingType", form.fundingType);
    payload.append("fundingAmount", form.fundingAmount);
    payload.append("degreeLevels", form.degreeLevels);
    payload.append("fieldsOfStudy", form.fieldsOfStudy);
    payload.append("skills", form.skills);
    payload.append("documentsRequired", form.documentsRequired);
    payload.append("tags", form.tags);
    payload.append("applicationUrl", form.applicationUrl);
    payload.append("officialWebsite", form.officialWebsite);
    payload.append("sourceName", form.sourceName);
    payload.append("sourceUrl", form.sourceUrl);
    payload.append("deadline", form.deadline);
    payload.append("status", form.status);
    payload.append("verificationStatus", form.verificationStatus);
    payload.append("featured", form.featured);

    if (form.imageFile) {
      payload.append("image", form.imageFile);
    }

    try {
      if (isEditing) {
        await API.put(`/opportunities/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/opportunities", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/admin/opportunities");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save opportunity");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white";
  const labelClass = "mb-1 block text-xs font-bold text-slate-700";

  return (
    <div className="mx-auto max-w-4xl p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c9c4d]">
            Opportunity Management
          </p>
          <h1 className="mt-1 text-3xl font-black text-[#0a2b3c]">
            {isEditing ? "Edit Opportunity" : "Create New Global Opportunity"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. Fully Funded Master's Scholarship in AI 2026"
            />
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Short Summary</label>
            <input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className={inputClass}
              placeholder="Brief 1-2 sentence overview for cards"
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Opportunity Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category *</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. Computer Science / Technology"
            />
          </div>

          {/* Organization */}
          <div>
            <label className={labelClass}>Host Organization / Institution *</label>
            <input
              name="organization"
              value={form.organization}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. University of Oxford / Google"
            />
          </div>

          {/* Funding Type */}
          <div>
            <label className={labelClass}>Funding Status</label>
            <select name="fundingType" value={form.fundingType} onChange={handleChange} className={inputClass}>
              <option value="fully_funded">Fully Funded</option>
              <option value="partially_funded">Partially Funded</option>
              <option value="tuition_only">Tuition Only</option>
              <option value="stipend">Stipend Provided</option>
              <option value="paid">Paid Opportunity</option>
              <option value="no_funding">Unfunded</option>
              <option value="other">Other / See Description</option>
            </select>
          </div>

          {/* Country & Region */}
          <div>
            <label className={labelClass}>Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Canada, Germany, Worldwide"
            />
          </div>

          <div>
            <label className={labelClass}>Region</label>
            <select name="region" value={form.region} onChange={handleChange} className={inputClass}>
              <option value="Worldwide">Worldwide</option>
              <option value="Africa">Africa</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Asia">Asia</option>
              <option value="Middle East">Middle East</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          {/* Degree Levels & Fields */}
          <div>
            <label className={labelClass}>Degree Levels (comma separated)</label>
            <input
              name="degreeLevels"
              value={form.degreeLevels}
              onChange={handleChange}
              className={inputClass}
              placeholder="undergraduate, graduate, phd"
            />
          </div>

          <div>
            <label className={labelClass}>Fields of Study (comma separated)</label>
            <input
              name="fieldsOfStudy"
              value={form.fieldsOfStudy}
              onChange={handleChange}
              className={inputClass}
              placeholder="Computer Science, Engineering, Medicine"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Detailed Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className={inputClass}
            />
          </div>

          {/* Application URL & Official Website */}
          <div>
            <label className={labelClass}>Official Application URL *</label>
            <input
              name="applicationUrl"
              type="url"
              value={form.applicationUrl}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className={labelClass}>Official Host Website</label>
            <input
              name="officialWebsite"
              type="url"
              value={form.officialWebsite}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          {/* Deadline */}
          <div>
            <label className={labelClass}>Deadline *</label>
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          {/* Verification Status */}
          <div>
            <label className={labelClass}>Verification Status</label>
            <select name="verificationStatus" value={form.verificationStatus} onChange={handleChange} className={inputClass}>
              <option value="verified">Verified (Displays ✓ Badge)</option>
              <option value="official_source">Official Source</option>
              <option value="pending">Pending Moderation</option>
              <option value="unverified">Unverified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Status & Featured */}
          <div>
            <label className={labelClass}>Publication Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                name="isRemote"
                checked={form.isRemote}
                onChange={handleChange}
                className="h-4 w-4 rounded text-emerald-600"
              />
              Fully Remote
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded text-emerald-600"
              />
              Featured Highlight
            </label>
          </div>

          {/* Image Upload */}
          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <label className={labelClass}>Banner Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: URL.createObjectURL(file),
                  }));
                }
              }}
              className="w-full text-xs text-slate-500"
            />
            {form.imagePreview && (
              <img src={form.imagePreview} alt="Preview" className="mt-2 h-32 rounded-xl object-cover" />
            )}
            {!form.imageFile && form.image && (
              <img src={form.image} alt="Current banner" className="mt-2 h-32 rounded-xl object-cover" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] py-3.5 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Saving Opportunity..." : isEditing ? "Update Opportunity" : "Create Opportunity"}
        </button>
      </form>
    </div>
  );
}
