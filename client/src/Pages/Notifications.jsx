import { useState, useEffect } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c9c4d]">
            Inbox
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#0a2b3c]">
            Notifications
          </h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="w-full rounded-xl bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.2)] sm:w-auto"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[0_18px_45px_rgba(10,43,60,0.06)]">
          <p className="text-lg font-semibold text-slate-700">
            No notifications yet.
          </p>
          <p className="mt-2 text-sm">
            When new opportunities match your profile, you will see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`rounded-2xl border p-4 shadow-[0_18px_45px_rgba(10,43,60,0.06)] ${notif.read ? "border-slate-200 bg-white" : "border-[#1c9c4d]/20 bg-[#1c9c4d]/5"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4
                    className={`text-lg font-bold ${!notif.read ? "text-[#0a2b3c]" : "text-slate-800"}`}
                  >
                    {notif.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notif.message}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <span className="rounded-full bg-[#1c9c4d] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    New
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {notif.opportunity && (
                  <Link
                    to={`/opportunity/${notif.opportunity._id}`}
                    className="text-sm font-semibold text-[#0a2b3c] hover:text-[#1c9c4d]"
                  >
                    View opportunity
                  </Link>
                )}
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
