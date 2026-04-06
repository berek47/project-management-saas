"use client";

import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/state/api";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Bell className="h-6 w-6" />
          Notifications
          {unread.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              {unread.length} unread
            </span>
          )}
        </h1>
        {unread.length > 0 && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            No notifications yet
          </p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
              n.isRead
                ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
