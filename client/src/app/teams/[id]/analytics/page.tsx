"use client";

import { useParams } from "next/navigation";
import { Users, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { useGetTeamAnalyticsQuery } from "@/state/api";

export default function TeamAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const { data, isLoading, isError } = useGetTeamAnalyticsQuery(teamId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading analytics…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Failed to load team analytics.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Team Analytics
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Users, label: "Members", value: data.memberCount, color: "text-blue-600 bg-blue-100 dark:bg-blue-900" },
          { icon: CheckCircle, label: "Completed", value: data.completedTasks, color: "text-green-600 bg-green-100 dark:bg-green-900" },
          { icon: AlertTriangle, label: "Overdue", value: data.overdueTasks, color: "text-red-600 bg-red-100 dark:bg-red-900" },
          { icon: TrendingUp, label: "Completion %", value: `${data.completionRate}%`, color: "text-purple-600 bg-purple-100 dark:bg-purple-900" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-dark-secondary"
          >
            <div className={`rounded-full p-2 ${color.split(" ").slice(1).join(" ")}`}>
              <Icon className={`h-5 w-5 ${color.split(" ")[0]}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-dark-secondary">
        <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Member Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:border-dark-tertiary dark:text-gray-400">
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 font-medium">Assigned</th>
                <th className="pb-3 font-medium">Completed</th>
                <th className="pb-3 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-dark-tertiary">
              {data.perMember.map((member) => (
                <tr key={member.userId}>
                  <td className="py-3 text-gray-800 dark:text-gray-200">
                    {member.username}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {member.assigned}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {member.completed}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {member.assigned > 0
                      ? `${Math.round((member.completed / member.assigned) * 100)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
