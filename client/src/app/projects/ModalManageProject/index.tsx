import Modal from "@/components/Modal";
import {
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  type Project,
} from "@/state/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

const ModalManageProject = ({ isOpen, onClose, project }: Props) => {
  const router = useRouter();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [projectName, setProjectName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setProjectName(project.name);
    setDescription(project.description || "");
    setStartDate(
      project.startDate ? format(new Date(project.startDate), "yyyy-MM-dd") : "",
    );
    setEndDate(
      project.endDate ? format(new Date(project.endDate), "yyyy-MM-dd") : "",
    );
  }, [project]);

  const inputStyles =
    "w-full rounded-2xl border border-sand-100 bg-white/80 p-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-white";

  const handleUpdate = async () => {
    try {
      setErrorMessage("");
      await updateProject({
        projectId: project.id,
        project: {
          name: projectName,
          description,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      }).unwrap();
      onClose();
    } catch (error) {
      setErrorMessage("Could not save project changes. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      setErrorMessage("");
      await deleteProject(project.id).unwrap();
      onClose();
      router.push("/");
    } catch (error) {
      setErrorMessage("Could not delete this project. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Manage Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleUpdate();
        }}
      >
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Project Controls
          </p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
            Project Name
          </label>
          <input
            type="text"
            className={inputStyles}
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
            Description
          </label>
          <textarea
            className={`${inputStyles} min-h-28`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
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
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              End Date
            </label>
            <input
              type="date"
              className={inputStyles}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {errorMessage}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-blue-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!projectName.trim() || isUpdating || isDeleting}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="rounded-full border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/10"
            onClick={() => void handleDelete()}
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalManageProject;
