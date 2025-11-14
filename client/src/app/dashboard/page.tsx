"use client";

import { CheckCircle, Clock, AlertTriangle, Activity } from "lucide-react";
import {
  useGetWorkspaceAnalyticsQuery,
  useGetOverdueTasksQuery,
  useGetActivitySummaryQuery,
} from "@/state/api";

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm dark:bg-dark-secondary">
    <div className={`rounded-full p-3 ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: analytics } = useGetWorkspaceAnalyticsQuery();
  const { data: overdueTasks } = useGetOverdueTasksQuery();
  const { data: activitySummary } = useGetActivitySummaryQuery();

  const topActions = activitySummary
    ? Object.entries(activitySummary.byAction)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const recentDays = activitySummary
    ? Object.entries(activitySummary.byDay)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
    : [];

  const maxDayCount = Math.max(...recentDays.map(([, v]) => v), 1);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Workspace Dashboard
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="Total Tasks"
          value={analytics?.totalTasks ?? 0}
          color="bg-blue-100 dark:bg-blue-900"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          label="Completed This Week"
          value={analytics?.completedThisWeek ?? 0}
          color="bg-green-100 dark:bg-green-900"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          label="Overdue Tasks"
          value={analytics?.overdueCount ?? 0}
          color="bg-red-100 dark:bg-red-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-dark-secondary">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Activity Last 7 Days
            </h2>
          </div>
          {recentDays.length > 0 ? (
            <div className="flex items-end gap-1 h-24">
              {recentDays.map(([day, count]) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-purple-400 dark:bg-purple-600"
                    style={{ height: `${(count / maxDayCount) * 80}px` }}
                    title={`${day}: ${count} actions`}
                  />
                  <span className="text-[10px] text-gray-400">
                    {day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No activity yet.</p>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-dark-secondary">
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Top Actions (30 days)
          </h2>
          {topActions.length > 0 ? (
            <ul className="space-y-2">
              {topActions.map(([action, count]) => (
                <li key={action} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {action.replace(/_/g, " ")}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No actions recorded yet.</p>
          )}
        </div>

        {overdueTasks && overdueTasks.length > 0 && (
          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-dark-secondary lg:col-span-2">
            <h2 className="mb-4 font-semibold text-red-600 dark:text-red-400">
              Overdue Tasks ({overdueTasks.length})
            </h2>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border border-red-100 p-3 dark:border-red-900"
                >
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {task.title}
                  </span>
                  <span className="text-xs text-red-500">
                    Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
