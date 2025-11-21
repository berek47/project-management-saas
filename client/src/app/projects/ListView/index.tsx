import Header from "@/components/Header";
import StatusPanel from "@/components/StatusPanel";
import TaskCard from "@/components/TaskCard";
import { Task, useGetTasksQuery } from "@/state/api";
import React from "react";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  searchTerm: string;
  showCompletedTasks: boolean;
};

const ListView = ({
  id,
  setIsModalNewTaskOpen,
  searchTerm,
  showCompletedTasks,
}: Props) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (isLoading) {
    return (
      <div className="px-4 pb-8 xl:px-6">
        <StatusPanel
          title="Loading list"
          description="Preparing your tasks for this project."
          tone="loading"
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="px-4 pb-8 xl:px-6">
        <StatusPanel
          title="We could not load the list"
          description="Please try again in a moment."
          tone="warning"
        />
      </div>
    );
  }

  const filteredTasks =
    tasks?.filter((task) => {
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
    }) || [];

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          name="List"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
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

export default ListView;
