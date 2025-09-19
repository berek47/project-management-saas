"use client";

import { useParams } from "next/navigation";
import { useGetProjectAnalyticsQuery } from "@/state/api";
import ProjectHeader from "@/app/projects/ProjectHeader";

export default function ProjectAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const { data, isLoading } = useGetProjectAnalyticsQuery(projectId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading analytics…</p>
      </div>
    );
  }

  if (!data) return null;

  const statusColors: Record<string, string> = {
    "To Do": "bg-gray-400",
    "Work In Progress": "bg-blue-500",
    "Under Review": "bg-yellow-500",
    Completed: "bg-green-500",
  };

  const priorityColors: Record<string, string> = {
    Urgent: "bg-red-600",
    High: "bg-orange-500",
    Medium: "bg-yellow-400",
    Low: "bg-green-400",
    Backlog: "bg-gray-300",
  };

  return (
    <div>
      <ProjectHeader activeTab="Analytics" />

      <div className="mx-auto max-w-5xl space-y-8 p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Tasks", value: data.totalTasks },
            { label: "Completion Rate", value: `${data.completionRate}%` },
            { label: "Total Points", value: data.totalPoints },
            { label: "Overdue Tasks", value: data.overdueTasks },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* By Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-white">
            Tasks by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{status}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${statusColors[status] ?? "bg-blue-400"}`}
                    style={{ width: `${(count / data.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Priority */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-white">
            Tasks by Priority
          </h2>
          <div className="space-y-3">
            {Object.entries(data.byPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{priority}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${priorityColors[priority] ?? "bg-gray-400"}`}
                    style={{ width: `${(count / data.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Assignee */}
        {data.tasksByAssignee.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-white">
              Tasks by Assignee
            </h2>
            <ul className="space-y-2">
              {data.tasksByAssignee.map(({ username, taskCount }) => (
                <li
                  key={username}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-2 dark:bg-gray-700"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {username}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
