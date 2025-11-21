"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";
import StatusPanel from "@/components/StatusPanel";
import { useGetAuthUserQuery, useGetProjectQuery } from "@/state/api";
import ModalManageProject from "../ModalManageProject";

type Props = {
  params: { id: string };
};

const Project = ({ params }: Props) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [isManageProjectOpen, setIsManageProjectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const projectId = Number(id);
  const { data: currentUser } = useGetAuthUserQuery();
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useGetProjectQuery(projectId);
  const canManageProject =
    Boolean(project?.createdByUserId) &&
    (!currentUser?.userDetails?.userId ||
      currentUser.userDetails.userId === project?.createdByUserId);

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      {project ? (
        <ModalManageProject
          isOpen={isManageProjectOpen}
          onClose={() => setIsManageProjectOpen(false)}
          project={project}
        />
      ) : null}
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showCompletedTasks={showCompletedTasks}
        setShowCompletedTasks={setShowCompletedTasks}
        title={project?.name || "Project Workspace"}
        subtitle={
          projectLoading
            ? "Loading project context..."
            : project?.description || "Track work, progress, and delivery from one focused workspace."
        }
        actionLabel="New Task"
        onPrimaryAction={() => setIsModalNewTaskOpen(true)}
        managementLabel={canManageProject ? "Manage Project" : undefined}
        onManagementAction={
          canManageProject ? () => setIsManageProjectOpen(true) : undefined
        }
      />
      {projectError ? (
        <div className="px-4 py-6 xl:px-6">
          <StatusPanel
            title="Project details are unavailable"
            description="The rest of the workspace is still available, but this project's metadata could not be loaded."
            tone="warning"
          />
        </div>
      ) : null}
      {activeTab === "Board" && (
        <Board
          id={id}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          searchTerm={searchTerm}
          showCompletedTasks={showCompletedTasks}
        />
      )}
      {activeTab === "List" && (
        <List
          id={id}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          searchTerm={searchTerm}
          showCompletedTasks={showCompletedTasks}
        />
      )}
      {activeTab === "Timeline" && (
        <Timeline
          id={id}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          searchTerm={searchTerm}
          showCompletedTasks={showCompletedTasks}
        />
      )}
      {activeTab === "Table" && (
        <Table
          id={id}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          searchTerm={searchTerm}
          showCompletedTasks={showCompletedTasks}
        />
      )}
    </div>
  );
};

export default Project;
