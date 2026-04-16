import { Prisma, PrismaClient } from "@prisma/client";

type SequenceClient =
  | PrismaClient
  | Prisma.TransactionClient;

export const getNextUserId = async (client: SequenceClient) => {
  const result = await client.user.aggregate({
    _max: { userId: true },
  });

  return (result._max.userId ?? 0) + 1;
};

export const getNextTeamId = async (client: SequenceClient) => {
  const result = await client.team.aggregate({
    _max: { id: true },
  });

  return (result._max.id ?? 0) + 1;
};

export const getNextProjectId = async (client: SequenceClient) => {
  const result = await client.project.aggregate({
    _max: { id: true },
  });

  return (result._max.id ?? 0) + 1;
};

export const getNextProjectTeamId = async (client: SequenceClient) => {
  const result = await client.projectTeam.aggregate({
    _max: { id: true },
  });

  return (result._max.id ?? 0) + 1;
};

export const getNextTaskId = async (client: SequenceClient) => {
  const result = await client.task.aggregate({
    _max: { id: true },
  });

  return (result._max.id ?? 0) + 1;
};
