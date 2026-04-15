import { Project } from "@/state/api";
import { CalendarRange, FolderKanban } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

type Props = {
  project: Project;
};

const ProjectCard = ({ project }: Props) => {
  const formattedStartDate = project.startDate
    ? format(new Date(project.startDate), "MMM d, yyyy")
    : "Not scheduled";
  const formattedEndDate = project.endDate
    ? format(new Date(project.endDate), "MMM d, yyyy")
    : "Open-ended";

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="glass-panel rounded-3xl p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              Project
            </p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {project.name}
            </h3>
          </div>
          <div className="rounded-2xl bg-sand-50 p-3 text-slate-700 dark:bg-dark-tertiary dark:text-slate-200">
            <FolderKanban className="h-5 w-5" />
          </div>
        </div>
        <p className="mb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {project.description || "No project description has been added yet."}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-100 bg-white/70 p-4 dark:border-stroke-dark dark:bg-dark-secondary/70">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <CalendarRange className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                Start
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {formattedStartDate}
            </p>
          </div>
          <div className="rounded-2xl border border-sand-100 bg-white/70 p-4 dark:border-stroke-dark dark:bg-dark-secondary/70">
            <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <CalendarRange className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                End
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {formattedEndDate}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
