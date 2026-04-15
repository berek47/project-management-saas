import { Response } from "express";
import { getAccessibleProjectIds } from "../lib/access";
import { parseOptionalDate, requireNumber, requireString, sendError, HttpError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../lib/auth";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

export const getProjects = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const accessibleProjectIds = await getAccessibleProjectIds(currentUser);
    const projects = await prisma.project.findMany({
      where: accessibleProjectIds.length
        ? { id: { in: accessibleProjectIds } }
        : { createdByUserId: currentUser.userId },
      orderBy: { id: "asc" },
    });
    res.json(projects);
  } catch (error) {
    sendError(res, error);
  }
};

export const getProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");
    const accessibleProjectIds = await getAccessibleProjectIds(currentUser);

    if (!accessibleProjectIds.includes(projectId)) {
      throw new HttpError(403, "You do not have access to this project");
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    sendError(res, error);
  }
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const name = requireString(req.body.name, "name");
    const description = requireString(req.body.description, "description", {
      optional: true,
    });

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate: parseOptionalDate(req.body.startDate, "startDate"),
        endDate: parseOptionalDate(req.body.endDate, "endDate"),
        createdByUserId: currentUser.userId,
      },
    });

    if (currentUser.teamId) {
      await prisma.projectTeam.create({
        data: {
          projectId: newProject.id,
          teamId: currentUser.teamId,
        },
      });
    }

    res.status(201).json(newProject);
  } catch (error) {
    sendError(res, error);
  }
};

export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.createdByUserId !== currentUser.userId) {
      throw new HttpError(403, "Only the project creator can update this project");
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(req.body.name !== undefined
          ? { name: requireString(req.body.name, "name") }
          : {}),
        ...(req.body.description !== undefined
          ? {
              description: requireString(req.body.description, "description", {
                optional: true,
              }),
            }
          : {}),
        ...(req.body.startDate !== undefined
          ? { startDate: parseOptionalDate(req.body.startDate, "startDate") }
          : {}),
        ...(req.body.endDate !== undefined
          ? { endDate: parseOptionalDate(req.body.endDate, "endDate") }
          : {}),
      },
    });

    res.json(updatedProject);
  } catch (error) {
    sendError(res, error);
  }
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: { select: { id: true } }, projectTeams: { select: { id: true } } },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.createdByUserId !== currentUser.userId) {
      throw new HttpError(403, "Only the project creator can delete this project");
    }

    await prisma.$transaction([
      prisma.projectTeam.deleteMany({ where: { projectId } }),
      prisma.comment.deleteMany({ where: { task: { projectId } } }),
      prisma.attachment.deleteMany({ where: { task: { projectId } } }),
      prisma.taskAssignment.deleteMany({ where: { task: { projectId } } }),
      prisma.task.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ]);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    sendError(res, error);
  }
};
