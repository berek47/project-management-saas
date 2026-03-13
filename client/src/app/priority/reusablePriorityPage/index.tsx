"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "@/components/LoadingSkeletons";
import ModalNewTask from "@/components/ModalNewTask";
import StatusPanel from "@/components/StatusPanel";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetAuthUserQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.row.author?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.row.assignee?.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: currentUser } = useGetAuthUserQuery();
  const userId = currentUser?.userDetails?.userId ?? null;
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId || 0, {
    skip: userId === null,
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  if (isTasksError || !tasks) {
    return (
      <div className="m-5 p-4">
        <StatusPanel
          title="We could not load these tasks"
          description="Please try again in a moment."
          tone="warning"
        />
      </div>
    );
  }

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name={`${priority} Priority`}
        buttonComponent={
          <button
            className="mr-3 rounded-full bg-blue-primary px-4 py-2 font-semibold text-white transition hover:bg-teal-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />
      <div className="mb-5 flex justify-start">
        <button
          className={`rounded-l-full border border-sand-100 px-4 py-2 text-sm font-medium ${
            view === "list"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-white/75 text-slate-700 dark:border-stroke-dark dark:bg-dark-secondary dark:text-slate-200"
          }`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`rounded-r-full border border-l-0 border-sand-100 px-4 py-2 text-sm font-medium ${
            view === "table"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-white/75 text-slate-700 dark:border-stroke-dark dark:bg-dark-secondary dark:text-slate-200"
          }`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>
      {isLoading ? (
        view === "list" ? (
          <CardGridSkeleton />
        ) : (
          <TableSkeleton rows={6} />
        )
      ) : view === "list" ? (
        <>
          {filteredTasks && filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                No {priority.toLowerCase()} tasks
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nothing is in this priority right now.
              </p>
            </div>
          )}
        </>
      ) : (
        view === "table" &&
        filteredTasks && (
          <div className="z-0 w-full">
            <DataGrid
              rows={filteredTasks}
              columns={columns}
              checkboxSelection
              getRowId={(row) => row.id}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;
