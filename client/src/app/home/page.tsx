"use client";

import {
  Priority,
  Project,
  Task,
  useGetAuthUserQuery,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";

const taskColumns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    minWidth: 260,
    flex: 1.4,
    renderCell: (params) => (
      <div className="truncate font-medium text-slate-900 dark:text-white" title={params.value}>
        {params.value}
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 160,
    flex: 0.9,
  },
  {
    field: "priority",
    headerName: "Priority",
    minWidth: 140,
    flex: 0.8,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    minWidth: 180,
    flex: 0.9,
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery();
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();
  const { data: currentUser } = useGetAuthUserQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (tasksLoading || isProjectsLoading) {
    return (
      <div className="container app-shell min-h-[calc(100vh-7rem)] w-full bg-transparent p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <Header name="Project Workspace" />
          <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
            Modern Project Control
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand-50 text-teal-600 dark:bg-dark-tertiary dark:text-teal-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Loading your workspace
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Getting your projects, tasks, and dashboard insights ready.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tasksError || !tasks || !projects) {
    return (
      <div className="container app-shell min-h-[calc(100vh-7rem)] w-full bg-transparent p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <Header name="Project Workspace" />
          <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
            Modern Project Control
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="glass-panel rounded-3xl p-6 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                  Dashboard
                </p>
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  The dashboard is temporarily unavailable
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  The rest of the workspace is available, but the dashboard data
                  is still syncing. Your projects and tasks remain available.
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              Workspace Status
            </p>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              You can keep working
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Navigation, layout, and the local workspace data are all working
              normally.
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              What To Expect
            </p>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
              Live insights will appear later
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Once the data source is connected, this page will automatically
              show your project and task summaries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0 && tasks.length === 0) {
    return (
      <div className="container app-shell min-h-[calc(100vh-7rem)] w-full bg-transparent p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <Header name="Project Workspace" />
          <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
            Modern Project Control
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass-panel rounded-3xl p-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              Workspace Ready
            </p>
            <h2 className="mb-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Start building your first project
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Your account is connected, but this workspace does not have live
              project data yet. Create a project or open the teams and people
              surfaces to finish setting up your workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/timeline"
                className="inline-flex items-center rounded-full bg-blue-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
              >
                Open Timeline <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center rounded-full border border-sand-100 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:hover:text-teal-300"
              >
                View Team Setup
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="glass-panel rounded-3xl p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                Account
              </p>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                {currentUser?.userDetails?.username || "Workspace User"}
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {currentUser?.userDetails?.email || "No email connected"}
              </p>
            </div>
            <div className="glass-panel rounded-3xl p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                Next Step
              </p>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                Create work you can track
              </h3>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Once your first project and tasks exist, this page will switch
                from setup mode to a live dashboard automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const hasTasks = projectTasks.length > 0;
      const allTasksCompleted =
        hasTasks &&
        projectTasks.every((task) => task.status === "Completed");
      const status = allTasksCompleted ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container app-shell min-h-[calc(100vh-7rem)] w-full bg-transparent p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
          <Header name="Project Workspace" />
        <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
          Modern Project Control
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-3xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-300">
            Insight
          </p>
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-300">
            Snapshot
          </p>
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel rounded-3xl p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-300">
                Execution
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Tasks
              </h3>
            </div>
            <div className="rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-dark-tertiary dark:text-slate-200">
              Focus Queue
            </div>
          </div>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
