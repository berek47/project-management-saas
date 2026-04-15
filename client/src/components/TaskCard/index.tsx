import { Task } from "@/state/api";
import { resolveImageUrl } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { CalendarDays, Flag, MessageSquareMore, UserRound } from "lucide-react";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  const priorityTone =
    task.priority === "Urgent"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
      : task.priority === "High"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
        : task.priority === "Medium"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
          : "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200";

  return (
    <div className="glass-panel mb-4 rounded-3xl p-5 dark:text-white">
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-2xl">
          <Image
            src={resolveImageUrl(task.attachments[0].fileURL)}
            alt={task.attachments[0].fileName || task.title}
            width={400}
            height={200}
            className="h-48 w-full object-cover"
          />
        </div>
      )}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Task #{task.id}
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {task.title}
          </h3>
        </div>
        {task.priority && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone}`}
          >
            {task.priority}
          </span>
        )}
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {task.description || "No description provided."}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-dark-secondary dark:text-slate-200">
          {task.status || "No status"}
        </span>
        {(task.tags ? task.tags.split(",") : []).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-dark-tertiary dark:text-slate-200"
          >
            {tag.trim()}
          </span>
        ))}
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-2xl border border-sand-100 bg-white/70 p-3 dark:border-stroke-dark dark:bg-dark-secondary/70">
          <div className="mb-1 flex items-center gap-2 text-slate-500 dark:text-slate-300">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Start
            </span>
          </div>
          <p className="text-slate-900 dark:text-white">
            {task.startDate ? format(new Date(task.startDate), "PPP") : "Not set"}
          </p>
        </div>
        <div className="rounded-2xl border border-sand-100 bg-white/70 p-3 dark:border-stroke-dark dark:bg-dark-secondary/70">
          <div className="mb-1 flex items-center gap-2 text-slate-500 dark:text-slate-300">
            <Flag className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Due
            </span>
          </div>
          <p className="text-slate-900 dark:text-white">
            {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Not set"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          {task.author ? task.author.username : "Unknown author"}
        </span>
        <span className="inline-flex items-center gap-2">
          <MessageSquareMore className="h-4 w-4" />
          {task.assignee ? task.assignee.username : "Unassigned"}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
