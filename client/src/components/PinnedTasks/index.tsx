"use client";

import { Pin, X } from "lucide-react";
import { useGetPinnedTasksQuery, useUnpinTaskMutation } from "@/state/api";

type Props = {
  projectId: number;
};

export default function PinnedTasks({ projectId }: Props) {
  const { data: pinnedTasks, isLoading } = useGetPinnedTasksQuery(projectId);
  const [unpinTask] = useUnpinTaskMutation();

  if (isLoading || !pinnedTasks || pinnedTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-800 dark:text-yellow-300">
        <Pin className="h-4 w-4" />
        Pinned Tasks
      </div>
      <div className="flex flex-wrap gap-2">
        {pinnedTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs shadow-sm dark:bg-dark-secondary"
          >
            <span className="text-gray-700 dark:text-gray-200">{task.title}</span>
            <button
              onClick={() => unpinTask(task.id)}
              className="ml-1 text-gray-400 hover:text-red-500"
              aria-label="Unpin task"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
