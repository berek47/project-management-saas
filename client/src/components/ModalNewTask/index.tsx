import Modal from "@/components/Modal";
import {
  Priority,
  Project,
  Status,
  useCreateTaskMutation,
  useGetAuthUserQuery,
  useGetProjectsQuery,
  useGetUsersQuery,
} from "@/state/api";
import React, { useEffect, useState } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: currentUser } = useGetAuthUserQuery();
  const { data: users } = useGetUsersQuery();
  const { data: projects } = useGetProjectsQuery();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState(id || "");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(Priority.Backlog);
    setTags("");
    setStartDate("");
    setDueDate("");
    setAssignedUserId("");
    setProjectId(id || "");
  };

  useEffect(() => {
    setProjectId(id || "");
  }, [id, isOpen]);

  const handleSubmit = async () => {
    if (!title || !description || !(id !== null || projectId))
      return;

    const formattedStartDate = startDate
      ? formatISO(new Date(startDate), {
          representation: "complete",
        })
      : undefined;
    const formattedDueDate = dueDate
      ? formatISO(new Date(dueDate), {
          representation: "complete",
        })
      : undefined;

    await createTask({
      title,
      description,
      status,
      priority,
      tags,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
      projectId: id !== null ? Number(id) : Number(projectId),
    });
    resetForm();
    onClose();
  };

  const isFormValid = () => {
    return Boolean(title && description && (id !== null || projectId));
  };

  const selectStyles =
    "mb-4 block w-full rounded-2xl border border-sand-100 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-white";

  const inputStyles =
    "w-full rounded-2xl border border-sand-100 bg-white/80 p-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Details
          </p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
            Task Title
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
            Description
          </label>
          <textarea
            className={`${inputStyles} min-h-28`}
            placeholder="Describe what needs to be done..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Status
            </label>
            <select
              className={selectStyles}
              value={status}
              onChange={(e) =>
                setStatus(Status[e.target.value as keyof typeof Status])
              }
            >
              <option value="">Select status</option>
              <option value={Status.ToDo}>To Do</option>
              <option value={Status.WorkInProgress}>Work In Progress</option>
              <option value={Status.UnderReview}>Under Review</option>
              <option value={Status.Completed}>Completed</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Priority
            </label>
            <select
              className={selectStyles}
              value={priority}
              onChange={(e) =>
                setPriority(Priority[e.target.value as keyof typeof Priority])
              }
            >
              <option value="">Select priority</option>
              <option value={Priority.Urgent}>Urgent</option>
              <option value={Priority.High}>High</option>
              <option value={Priority.Medium}>Medium</option>
              <option value={Priority.Low}>Low</option>
              <option value={Priority.Backlog}>Backlog</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
            Tags
          </label>
          <input
            type="text"
            className={inputStyles}
            placeholder="Tags, separated by commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Start Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Due Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Assignee
            </label>
            <select
              className={selectStyles}
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              <option value="">Assign later</option>
              {users?.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Created By
            </label>
            <div className="rounded-2xl border border-sand-100 bg-white/80 p-3 text-sm font-medium text-slate-700 shadow-sm dark:border-stroke-dark dark:bg-dark-tertiary dark:text-slate-200">
              {currentUser?.userDetails?.username || "Current user"}
            </div>
          </div>
        </div>
        {id === null && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Project
            </label>
            <select
              className={selectStyles}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select project</option>
              {projects?.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-300">
          Fill in the title and description to create the task. It will be
          created under your workspace identity, and you can assign it now or
          leave assignment for later.
        </p>
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-full border border-transparent bg-blue-primary px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Saving task..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
