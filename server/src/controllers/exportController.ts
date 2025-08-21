import { Response } from "express";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureProjectAccess } from "../lib/access";
import { HttpError, requireNumber, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) throw new HttpError(401, "Authentication required");
  return req.currentUser;
};

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportProjectTasksCsv = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const projectId = requireNumber(req.params.projectId, "projectId");

    await ensureProjectAccess(currentUser, projectId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        author: { select: { username: true } },
        assignee: { select: { username: true } },
        comments: true,
      },
      orderBy: { id: "asc" },
    });

    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Tags",
      "Points",
      "Start Date",
      "Due Date",
      "Author",
      "Assignee",
      "Comments",
    ];

    const rows = tasks.map((task) => [
      task.id,
      task.title,
      task.description ?? "",
      task.status ?? "",
      task.priority ?? "",
      task.tags ?? "",
      task.points ?? "",
      task.startDate ? task.startDate.toISOString().split("T")[0] : "",
      task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
      task.author.username,
      task.assignee?.username ?? "",
      task.comments.length,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="project-${projectId}-tasks.csv"`,
    );
    res.send(csv);
  } catch (error) {
    sendError(res, error);
  }
};
