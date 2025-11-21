import { HttpError } from "./http";
import { prisma } from "./prisma";

type CurrentUser = {
  teamId?: number | null;
  userId: number;
};

export const getAccessibleProjectIds = async (currentUser: CurrentUser) => {
  const projectIds = new Set<number>();

  if (currentUser.teamId) {
    const projectTeams = await prisma.projectTeam.findMany({
      where: { teamId: currentUser.teamId },
      select: { projectId: true },
    });
    projectTeams.forEach((entry) => projectIds.add(entry.projectId));
  }

  const personalProjects = await prisma.project.findMany({
    where: { createdByUserId: currentUser.userId },
    select: { id: true },
  });
  personalProjects.forEach((project) => projectIds.add(project.id));

  const relatedTasks = await prisma.task.findMany({
    where: {
      OR: [
        { authorUserId: currentUser.userId },
        { assignedUserId: currentUser.userId },
      ],
    },
    select: { projectId: true },
  });
  relatedTasks.forEach((task) => projectIds.add(task.projectId));

  return Array.from(projectIds);
};

export const ensureProjectAccess = async (
  currentUser: CurrentUser,
  projectId: number,
) => {
  const accessibleProjectIds = await getAccessibleProjectIds(currentUser);

  if (!accessibleProjectIds.includes(projectId)) {
    throw new HttpError(403, "You do not have access to this project");
  }
};

export const ensureSameTeamOrSelf = (
  currentUser: CurrentUser,
  targetUser: { teamId?: number | null; userId: number },
) => {
  const isSelf = currentUser.userId === targetUser.userId;
  const sameTeam =
    currentUser.teamId &&
    targetUser.teamId &&
    currentUser.teamId === targetUser.teamId;

  if (!isSelf && !sameTeam) {
    throw new HttpError(403, "You do not have access to this user");
  }
};
