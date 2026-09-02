import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";

const DEGREE_OPTIONS = [
  { label: "High School / Secondary", value: "highschool" },
  { label: "Diploma / Associate", value: "diploma" },
  { label: "Bachelor's / Undergraduate", value: "undergraduate" },
  { label: "Master's / Graduate", value: "graduate" },
  { label: "Postgraduate Diploma", value: "postgraduate" },
  { label: "MPhil", value: "mphil" },
  { label: "PhD / Doctorate", value: "phd" },
  { label: "Postdoctoral", value: "postdoctoral" },
  { label: "Professional Qualification", value: "professional" },
  { label: "Other", value: "other" },
];

const OPPORTUNITY_TYPES = [
  { label: "Scholarships", value: "scholarship" },
  { label: "Internships", value: "internship" },
  { label: "Grants", value: "grant" },
  { label: "Fellowships", value: "fellowship" },
  { label: "Jobs", value: "job" },
  { label: "Research", value: "research" },
  { label: "Training / Workshops", value: "training" },
  { label: "Competitions", value: "competition" },
  { label: "Exchange Programs", value: "exchange" },
  { label: "Conferences", value: "conference" },
];

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    profile: {
      country: "",
      nationality: "",
      city: "",
      educationLevel: "",
      degree: "",
      fieldOfStudy: "",
      institution: "",
      gpa: "",
      graduationYear: "",
      employmentStatus: "student",
      yearsOfExperience: 0,
      skills: "",
      certifications: "",
      interests: "",
      preferredOpportunityTypes: [],
      preferredCountries: "",
      preferredRegions: [],
      preferredFunding: [],
      isRemoteOnly: false,
    },
    notificationPreferences: {
      email: true,
      sms: false,
      inApp: true,
      deadlineReminders: true,
      frequency: "instant",
    },
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        profile: {
          country: user.profile?.country || "",
          nationality: user.profile?.nationality || "",
          city: user.profile?.city || "",
          educationLevel: user.profile?.educationLevel || "",
          degree: user.profile?.degree || "",
          fieldOfStudy: user.profile?.fieldOfStudy || "",
          institution: user.profile?.institution || "",
          gpa: user.profile?.gpa || "",
          graduationYear: user.profile?.graduationYear || "",
          employmentStatus: user.profile?.employmentStatus || "student",
          yearsOfExperience: user.profile?.yearsOfExperience || 0,
          skills: user.profile?.skills?.join(", ") || "",
          certifications: user.profile?.certifications?.join(", ") || "",
          interests: user.profile?.interests?.join(", ") || "",
          preferredOpportunityTypes: user.profile?.preferredOpportunityTypes || [],
          preferredCountries: user.profile?.preferredCountries?.join(", ") || "",
          preferredRegions: user.profile?.preferredRegions || [],
          preferredFunding: user.profile?.preferredFunding || [],
          isRemoteOnly: user.profile?.isRemoteOnly || false,
        },
        notificationPreferences: {
          email: user.notificationPreferences?.email ?? true,
          sms: user.notificationPreferences?.sms ?? false,
          inApp: user.notificationPreferences?.inApp ?? true,
          deadlineReminders: user.notificationPreferences?.deadlineReminders ?? true,
          frequency: user.notificationPreferences?.frequency || "instant",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("profile.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        profile: { ...prev.profile, [key]: type === "checkbox" ? checked : value },
      }));
    } else if (name.startsWith("notif.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeToggle = (typeValue) => {
    setForm((prev) => {
      const current = prev.profile.preferredOpportunityTypes;
      const next = current.includes(typeValue)
        ? current.filter((t) => t !== typeValue)
        : [...current, typeValue];
      return {
        ...prev,
        profile: { ...prev.profile, preferredOpportunityTypes: next },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        profile: {
          ...form.profile,
          skills: form.profile.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          certifications: form.profile.certifications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: form.profile.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
          preferredCountries: form.profile.preferredCountries
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          graduationYear: form.profile.graduationYear
            ? Number(form.profile.graduationYear)
            : undefined,
          gpa: form.profile.gpa ? Number(form.profile.gpa) : undefined,
          yearsOfExperience: form.profile.yearsOfExperience
            ? Number(form.profile.yearsOfExperience)
            : 0,
        },
        notificationPreferences: form.notificationPreferences,
      };

      const res = await API.put("/users/me", payload);
      updateUser(res.data.user);
      setMessage("Profile and matching preferences updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Profile update failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1c9c4d]">
          Account & Recommendations
        </p>
        <h2 className="mt-1 text-3xl font-black text-[#0a2b3c]">
          Profile Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The more details you provide, the more accurately our recommendation engine will pair you with global opportunities.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${
            messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{messageType === "success" ? "✓" : "⚠️"}</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(10,43,60,0.06)] md:p-10">
        {/* Section 1: Personal Information */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
            Personal Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+233..."
              />
            </div>

            <div>
              <label className={labelClass}>Country of Residence</label>
              <input
                name="profile.country"
                value={form.profile.country}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Ghana"
              />
            </div>

            <div>
              <label className={labelClass}>Nationality</label>
              <input
                name="profile.nationality"
                value={form.profile.nationality}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Ghanaian"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>City / Region</label>
              <input
                name="profile.city"
                value={form.profile.city}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Accra"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Profile */}
        <div className="border-t border-slate-100 pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-sky-500" />
            Academic Profile
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Current / Highest Education Level</label>
              <select
                name="profile.educationLevel"
                value={form.profile.educationLevel}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Level</option>
                {DEGREE_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Field of Study / Major</label>
              <input
                name="profile.fieldOfStudy"
                value={form.profile.fieldOfStudy}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Computer Science, Public Health"
              />
            </div>

            <div>
              <label className={labelClass}>Degree Title</label>
              <input
                name="profile.degree"
                value={form.profile.degree}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. BSc, MSc, Diploma"
              />
            </div>

            <div>
              <label className={labelClass}>Institution / University</label>
              <input
                name="profile.institution"
                value={form.profile.institution}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. University of Ghana"
              />
            </div>

            <div>
              <label className={labelClass}>Graduation Year</label>
              <input
                type="number"
                name="profile.graduationYear"
                value={form.profile.graduationYear}
                onChange={handleChange}
                className={inputClass}
                placeholder="2026"
              />
            </div>

            <div>
              <label className={labelClass}>Cumulative GPA / CGPA (Optional)</label>
              <input
                type="number"
                step="0.01"
                name="profile.gpa"
                value={form.profile.gpa}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 3.8"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Professional & Skills */}
        <div className="border-t border-slate-100 pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-violet-500" />
            Professional Profile & Skills
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Employment Status</label>
              <select
                name="profile.employmentStatus"
                value={form.profile.employmentStatus}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="self-employed">Self-Employed / Founder</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Years of Work Experience</label>
              <input
                type="number"
                name="profile.yearsOfExperience"
                value={form.profile.yearsOfExperience}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Skills (comma separated)</label>
              <input
                name="profile.skills"
                value={form.profile.skills}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Python, Data Analysis, Project Management, Writing"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Certifications & Licenses</label>
              <input
                name="profile.certifications"
                value={form.profile.certifications}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. AWS Certified, PMP, IELTS 8.0"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Opportunity Preferences */}
        <div className="border-t border-slate-100 pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-emerald-500" />
            Opportunity & Destination Preferences
          </h3>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Interested Opportunity Types</label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {OPPORTUNITY_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => handleTypeToggle(t.value)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                      form.profile.preferredOpportunityTypes.includes(t.value)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {form.profile.preferredOpportunityTypes.includes(t.value) ? "✓ " : "+ "}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Preferred Destination Countries (comma separated)</label>
              <input
                name="profile.preferredCountries"
                value={form.profile.preferredCountries}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Canada, Germany, United Kingdom, USA, Worldwide"
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  name="profile.isRemoteOnly"
                  checked={form.profile.isRemoteOnly}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Prioritize Remote / Online Opportunities
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Notification Preferences */}
        <div className="border-t border-slate-100 pt-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-amber-500" />
            Notification Alerts
          </h3>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="notif.email"
                checked={form.notificationPreferences.email}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Email Alerts for High-Match Opportunities (80%+ score)
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="notif.deadlineReminders"
                checked={form.notificationPreferences.deadlineReminders}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Approaching Deadline Reminders (7 days & 3 days before close)
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                name="notif.inApp"
                checked={form.notificationPreferences.inApp}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              In-App Notification Feed
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] py-4 text-base font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Saving Profile..." : "Save Profile & Update Recommendation Engine"}
        </button>
      </form>
    </div>
  );
}
