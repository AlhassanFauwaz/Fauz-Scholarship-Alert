import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    profile: {
      educationLevel: "",
      fieldOfStudy: "",
      country: "",
      interests: "",
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

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        profile: {
          educationLevel: user.profile?.educationLevel || "",
          fieldOfStudy: user.profile?.fieldOfStudy || "",
          country: user.profile?.country || "",
          interests: user.profile?.interests?.join(", ") || "",
        },
        notificationPreferences: {
          email: user.notificationPreferences?.email ?? true,
          sms: user.notificationPreferences?.sms ?? false,
          inApp: user.notificationPreferences?.inApp ?? true,
          deadlineReminders:
            user.notificationPreferences?.deadlineReminders ?? true,
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
        profile: { ...prev.profile, [key]: value },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        profile: {
          ...form.profile,
          interests: form.profile.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        },
        notificationPreferences: form.notificationPreferences,
      };
      const res = await API.put("/users/me", payload);
      updateUser(res.data.user);
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
      setMessageType("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:border-[#1c9c4d] focus:bg-white";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
          Account
        </p>
        <h2 className="mt-2 text-3xl font-black text-[#0a2b3c]">
          Profile settings
        </h2>
        <p className="mt-1 text-slate-500">
          Update your info to improve your opportunity matches.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 ${messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
        >
          <span>{messageType === "success" ? "✓" : "⚠"}</span>
          <span>{message}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_70px_rgba(10,43,60,0.08)] md:p-8"
      >
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
            Personal information
          </h3>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Phone number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
            Academic profile
          </h3>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Education level</label>
              <select
                name="profile.educationLevel"
                value={form.profile.educationLevel}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select level</option>
                <option value="highschool">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="phd">PhD</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Field of study</label>
              <input
                name="profile.fieldOfStudy"
                value={form.profile.fieldOfStudy}
                onChange={handleChange}
                className={inputClass}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                name="profile.country"
                value={form.profile.country}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ghana"
              />
            </div>
            <div>
              <label className={labelClass}>Interests (comma separated)</label>
              <input
                name="profile.interests"
                value={form.profile.interests}
                onChange={handleChange}
                className={inputClass}
                placeholder="technology, engineering"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-[#0a2b3c]">
            <span className="inline-block h-5 w-1.5 rounded-full bg-[#1c9c4d]" />
            Notification preferences
          </h3>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                name="notif.email"
                checked={form.notificationPreferences.email}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c9c4d] focus:ring-[#1c9c4d]"
              />
              Email notifications
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                name="notif.sms"
                checked={form.notificationPreferences.sms}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c9c4d] focus:ring-[#1c9c4d]"
              />
              SMS notifications (only for alerts I choose to receive)
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                name="notif.inApp"
                checked={form.notificationPreferences.inApp}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c9c4d] focus:ring-[#1c9c4d]"
              />
              In-app notifications
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                name="notif.deadlineReminders"
                checked={form.notificationPreferences.deadlineReminders}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c9c4d] focus:ring-[#1c9c4d]"
              />
              Deadline reminders
            </label>
            <div className="pt-2">
              <label className={labelClass}>Frequency</label>
              <select
                name="notif.frequency"
                value={form.notificationPreferences.frequency}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-4 py-3 font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition hover:brightness-110"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
