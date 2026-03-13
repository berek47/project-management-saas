import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import {
  PageHeaderSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from "@/components/LoadingSkeletons";
import StatusPanel from "@/components/StatusPanel";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTasksQuery } from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  searchTerm: string;
  showCompletedTasks: boolean;
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

const TableView = ({
  id,
  setIsModalNewTaskOpen,
  searchTerm,
  showCompletedTasks,
}: Props) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) {
    return (
      <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
        <div className="pt-5">
          <PageHeaderSkeleton />
        </div>
        <div className="mb-5 flex justify-end">
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
        <TableSkeleton />
      </div>
    );
  }
  if (error || !tasks) {
    return (
      <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
        <StatusPanel
          title="We could not load the table"
          description="Please try again in a moment."
          tone="warning"
        />
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      [task.title, task.description, task.tags, task.status, task.priority]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        );
    const matchesCompletion =
      showCompletedTasks || task.status !== "Completed";
    return matchesSearch && matchesCompletion;
  });

  return (
    <div className="h-[540px] w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="Table"
          buttonComponent={
            <button
              className="flex items-center rounded-full bg-blue-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      {filteredTasks.length > 0 ? (
        <DataGrid
          rows={filteredTasks}
          columns={columns}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      ) : (
        <StatusPanel
          title="No tasks match this view"
          description="Try a different search or include completed tasks again."
          tone="empty"
        />
      )}
    </div>
  );
};

export default TableView;
