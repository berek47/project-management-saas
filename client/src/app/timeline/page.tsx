"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import { useGetProjectsQuery } from "@/state/api";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import React, { useMemo, useState } from "react";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery();

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    return (
      projects
        ?.filter((project) => project.startDate && project.endDate)
        .map((project) => ({
          start: new Date(project.startDate as string),
          end: new Date(project.endDate as string),
          name: project.name,
          id: `Project-${project.id}`,
          type: "project" as TaskTypeItems,
          progress: 50,
          isDisabled: false,
        })) || []
    );
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="glass-panel rounded-3xl p-6 text-slate-600 dark:text-slate-300">
          Loading timeline...
        </div>
      </div>
    );
  }
  if (isError || !projects) {
    return (
      <div className="p-8">
        <div className="glass-panel rounded-3xl p-6 text-slate-600 dark:text-slate-300">
          We could not load the timeline right now. Please try again shortly.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full p-8">
      <header className="mb-6 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className="block w-full appearance-none rounded-full border border-sand-100 bg-white/80 px-4 py-3 pr-8 text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

      {ganttTasks.length > 0 ? (
        <div className="glass-panel overflow-hidden rounded-3xl dark:text-white">
          <div className="timeline">
            <Gantt
              tasks={ganttTasks}
              {...displayOptions}
              columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
              listCellWidth="100px"
              projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
              projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
              projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
            />
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 text-slate-600 dark:text-slate-300">
          No timeline items yet. Create or load a project with start and end dates to populate this view.
        </div>
      )}
    </div>
  );
};

export default Timeline;
