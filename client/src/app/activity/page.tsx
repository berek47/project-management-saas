"use client";

import { useGetProjectActivityQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ActivityIcon } from "lucide-react";

function ActivityFeedInner() {
  const searchParams = useSearchParams();
  const projectId = Number(searchParams.get("projectId") ?? "0");

  const { data: logs = [], isLoading } = useGetProjectActivityQuery(projectId, {
    skip: !projectId,
  });

  const actionLabel: Record<string, string> = {
    task_created: "created a task",
    task_updated: "updated a task",
    task_status_changed: "changed task status",
    task_comment_added: "commented on a task",
    task_deleted: "deleted a task",
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
        <ActivityIcon className="h-6 w-6" />
        Activity Feed
      </h1>

      {!projectId && (
        <p className="text-gray-500 dark:text-gray-400">
          No project selected. Add ?projectId=X to the URL.
        </p>
      )}

      {isLoading && (
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      )}

      {!isLoading && logs.length === 0 && projectId > 0 && (
        <p className="text-gray-500 dark:text-gray-400">No activity yet.</p>
      )}

      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {logs.map((log) => (
          <li key={log.id} className="mb-6 ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </span>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {log.user.username}
                </span>
                <time className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {actionLabel[log.action] ?? log.action}
                {log.task && (
                  <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                    "{log.task.title}"
                  </span>
                )}
              </p>
              {log.details && (
                <p className="mt-1 text-xs text-gray-400">{log.details}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityFeedInner />
    </Suspense>
  );
}
