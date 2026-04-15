import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import StatusPanel from "@/components/StatusPanel";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import {
  CheckCheck,
  Clipboard,
  EllipsisVertical,
  MessageSquareMore,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/utils";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  searchTerm: string;
  showCompletedTasks: boolean;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({
  id,
  setIsModalNewTaskOpen,
  searchTerm,
  showCompletedTasks,
}: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <StatusPanel
          title="Loading board"
          description="Preparing the board for this project."
          tone="loading"
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4">
        <StatusPanel
          title="We could not load the board"
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
    <DndProvider backend={HTML5Backend}>
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={filteredTasks}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            />
          ))}
        </div>
      ) : (
        <div className="p-4">
          <StatusPanel
            title="No tasks match this view"
            description="Try a different search or include completed tasks again."
            tone="empty"
          />
        </div>
      )}
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [isColumnMenuOpen, setIsColumnMenuOpen] = React.useState(false);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`rounded-3xl py-2 xl:px-2 ${
        isOver ? "bg-teal-500/10 dark:bg-teal-400/10" : ""
      }`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="glass-panel flex w-full items-center justify-between rounded-e-3xl px-5 py-4">
          <h3 className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-sand-50 p-1 text-center text-sm leading-none text-slate-700 dark:bg-dark-tertiary dark:text-slate-200"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="relative flex items-center gap-1">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/70 dark:text-neutral-400 dark:hover:bg-dark-tertiary"
              onClick={() => setIsColumnMenuOpen((prev) => !prev)}
            >
              <EllipsisVertical size={26} />
            </button>
            {isColumnMenuOpen ? (
              <div className="absolute right-0 top-10 z-10 min-w-48 rounded-2xl border border-sand-100 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-stroke-dark dark:bg-dark-secondary/95">
                <button
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                  onClick={() => {
                    setIsColumnMenuOpen(false);
                    setIsModalNewTaskOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add task to {status}
                </button>
                <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {tasksCount} task{tasksCount === 1 ? "" : "s"} in this column
                </div>
              </div>
            ) : null}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-primary text-white transition hover:bg-teal-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} moveTask={moveTask} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  moveTask: (taskId: number, toStatus: string) => void;
};

const nextStatusByCurrent: Record<string, string | null> = {
  "To Do": "Work In Progress",
  "Work In Progress": "Under Review",
  "Under Review": "Completed",
  Completed: null,
};

const Task = ({ task, moveTask }: TaskProps) => {
  const [isTaskMenuOpen, setIsTaskMenuOpen] = React.useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;
  const nextStatus = task.status ? nextStatusByCurrent[task.status] : null;
  const visiblePeople = [task.assignee, task.author].filter(
    (person, index, people) =>
      Boolean(person) &&
      people.findIndex(
        (candidate) => candidate?.userId === person?.userId,
      ) === index,
  );

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700 dark:bg-red-500/20 dark:text-red-200"
          : priority === "High"
            ? "bg-yellow-200 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200"
            : priority === "Medium"
              ? "bg-green-200 text-green-700 dark:bg-green-500/20 dark:text-green-200"
              : priority === "Low"
                ? "bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                : "bg-gray-200 text-gray-700 dark:bg-slate-500/20 dark:text-slate-200"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`glass-panel relative mb-4 rounded-3xl ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={resolveImageUrl(task.attachments[0].fileURL)}
          alt={task.attachments[0].fileName || task.title}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-3xl"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-sand-50 px-2 py-1 text-xs text-slate-700 dark:bg-dark-tertiary dark:text-slate-200"
                >
                  {" "}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/70 dark:text-neutral-400 dark:hover:bg-dark-tertiary"
            onClick={() => setIsTaskMenuOpen((prev) => !prev)}
          >
            <EllipsisVertical size={26} />
          </button>
        </div>
        {isTaskMenuOpen ? (
          <div className="absolute right-4 top-14 z-10 min-w-52 rounded-2xl border border-sand-100 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-stroke-dark dark:bg-dark-secondary/95">
            <button
              className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
              onClick={async () => {
                await navigator.clipboard.writeText(task.title);
                setIsTaskMenuOpen(false);
              }}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy task title
            </button>
            {nextStatus ? (
              <button
                className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                onClick={() => {
                  moveTask(task.id, nextStatus);
                  setIsTaskMenuOpen(false);
                }}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Move to {nextStatus}
              </button>
            ) : (
              <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Task already completed
              </div>
            )}
          </div>
        ) : null}

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold text-slate-900 dark:text-white">
            {task.title}
          </h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold text-slate-700 dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-neutral-400">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {task.description}
        </p>
        <div className="mt-4 border-t border-sand-100 dark:border-stroke-dark" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {visiblePeople.map((person) => (
              <Image
                key={person!.userId}
                src={resolveImageUrl(person!.profilePictureUrl, "/i1.jpg")}
                alt={person!.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            ))}
          </div>
          <div className="flex items-center text-slate-500 dark:text-neutral-400">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
