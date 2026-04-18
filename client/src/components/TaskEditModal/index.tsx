"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Task, Priority, useUpdateTaskMutation } from "@/state/api";

type Props = {
  task: Task;
  onClose: () => void;
};

export default function TaskEditModal({ task, onClose }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<Priority | "">(
    (task.priority as Priority) ?? "",
  );
  const [points, setPoints] = useState(
    task.points !== undefined ? String(task.points) : "",
  );
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : "",
  );
  const [tags, setTags] = useState(task.tags ?? "");

  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTask({
      taskId: task.id,
      body: {
        title: title || task.title,
        description: description || undefined,
        priority: (priority as Priority) || undefined,
        points: points ? Number(points) : undefined,
        dueDate: dueDate || undefined,
        tags: tags || undefined,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-dark-secondary">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
              >
                <option value="">No Priority</option>
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Points
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min={0}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma-separated"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-tertiary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
