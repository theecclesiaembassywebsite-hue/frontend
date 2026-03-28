"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { nation } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  time: string;
  createdAt?: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const notifs = await nation.getNotifications();
      setNotifications(notifs.map((n: any) => ({
        id: n.id,
        title: n.title || "Notification",
        message: n.message || n.content || "",
        read: n.read || false,
        time: formatTime(n.createdAt),
        createdAt: n.createdAt,
      })));
    } catch (err) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  async function markAllRead() {
    try {
      await nation.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await nation.markNotificationRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:text-lavender transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-heading font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-[8px] bg-white shadow-lg border border-gray-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-border">
              <h4 className="font-heading text-sm font-bold text-slate">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-heading font-semibold text-purple-vivid hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-gray-text text-sm">
                  Loading...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full px-4 py-3 border-b border-gray-border last:border-0 text-left transition-colors hover:bg-off-white ${
                      !n.read ? "bg-purple-light/20" : ""
                    }`}
                  >
                    <p className="font-heading text-xs font-semibold text-slate">
                      {n.title}
                    </p>
                    <p className="font-body text-[11px] text-gray-text mt-0.5">
                      {n.message}
                    </p>
                    <p className="font-body text-[10px] text-gray-text mt-1">
                      {n.time}
                    </p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-text text-sm">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
