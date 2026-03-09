"use client";

import { useGetOverdueTasksQuery } from "@/state/api";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const priorityColor: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Backlog: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function OverduePage() {
  const { data: tasks = [], isLoading } = useGetOverdueTasksQuery();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        Overdue Tasks
        {tasks.length > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
            {tasks.length}
          </span>
        )}
      </h1>

      {isLoading && (
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300">
            No overdue tasks. You are all caught up!
          </p>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => {
          const daysOverdue = task.dueDate
            ? Math.floor(
                (Date.now() - new Date(task.dueDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0;

          return (
            <div
              key={task.id}
              className="flex items-start justify-between rounded-lg border border-red-100 bg-white p-4 shadow-sm dark:border-red-900/30 dark:bg-gray-800"
            >
              <div className="flex-1">
                <Link
                  href={`/projects/${task.projectId}`}
                  className="font-medium text-gray-900 hover:underline dark:text-white"
                >
                  {task.title}
                </Link>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                    {task.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {task.priority && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        priorityColor[task.priority] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                  <span className="text-xs text-red-500">
                    {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
