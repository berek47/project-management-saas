import { Response } from "express";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../lib/auth";
import { ensureSameTeamOrSelf } from "../lib/access";
import { HttpError, requireNumber, requireString, sendError } from "../lib/http";
import { prisma } from "../lib/prisma";

const requireCurrentUser = (req: AuthenticatedRequest) => {
  if (!req.currentUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.currentUser;
};

const userSelect = {
  userId: true,
  username: true,
  email: true,
  profilePictureUrl: true,
  teamId: true,
} as const;

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: userSelect,
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  },
  team: {
    select: {
      id: true,
      teamName: true,
    },
  },
  messages: {
    take: 1,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: {
        select: userSelect,
      },
    },
  },
} as const;

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

const serializeConversation = async (
  conversation: ConversationWithRelations,
  currentUserId: number,
) => {
  const selfParticipant = conversation.participants.find(
    (participant) => participant.userId === currentUserId,
  );

  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderUserId: { not: currentUserId },
      ...(selfParticipant?.lastReadAt
        ? { createdAt: { gt: selfParticipant.lastReadAt } }
        : {}),
    },
  });

  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    team: conversation.team,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
    unreadCount,
    lastReadAt: selfParticipant?.lastReadAt || null,
    lastMessage: conversation.messages[0]
      ? {
          id: conversation.messages[0].id,
          body: conversation.messages[0].body,
          createdAt: conversation.messages[0].createdAt,
          sender: conversation.messages[0].sender,
        }
      : null,
    participants: conversation.participants.map((participant) => ({
      id: participant.id,
      joinedAt: participant.joinedAt,
      lastReadAt: participant.lastReadAt,
      user: participant.user,
    })),
  };
};

const getConversationForUser = async (
  conversationId: number,
  currentUserId: number,
) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: currentUserId,
        },
      },
    },
    include: conversationInclude,
  });

  if (!conversation) {
    throw new HttpError(404, "Conversation not found");
  }

  return conversation;
};

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: currentUser.userId,
          },
        },
      },
      include: conversationInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const serialized = await Promise.all(
      conversations.map((conversation) =>
        serializeConversation(conversation, currentUser.userId),
      ),
    );

    res.json(serialized);
  } catch (error) {
    sendError(res, error);
  }
};

export const createDirectConversation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const participantUserId = requireNumber(
      req.body.participantUserId,
      "participantUserId",
    );

    if (participantUserId === currentUser.userId) {
      throw new HttpError(400, "Choose another user to start a conversation");
    }

    const targetUser = await prisma.user.findUnique({
      where: { userId: participantUserId },
      select: userSelect,
    });

    if (!targetUser) {
      throw new HttpError(404, "Participant not found");
    }

    ensureSameTeamOrSelf(currentUser, targetUser);

    const existingCandidates = await prisma.conversation.findMany({
      where: {
        type: "DIRECT",
        participants: {
          some: {
            userId: currentUser.userId,
          },
        },
        AND: {
          participants: {
            some: {
              userId: participantUserId,
            },
          },
        },
      },
      include: conversationInclude,
    });

    const existingConversation = existingCandidates.find(
      (conversation) =>
        conversation.participants.length === 2 &&
        conversation.participants.every((participant) =>
          [currentUser.userId, participantUserId].includes(participant.userId),
        ),
    );

    const conversation =
      existingConversation ||
      (await prisma.conversation.create({
        data: {
          type: "DIRECT",
          createdByUserId: currentUser.userId,
          participants: {
            create: [
              { userId: currentUser.userId, lastReadAt: new Date() },
              { userId: participantUserId },
            ],
          },
        },
        include: conversationInclude,
      }));

    res.status(existingConversation ? 200 : 201).json(
      await serializeConversation(conversation, currentUser.userId),
    );
  } catch (error) {
    sendError(res, error);
  }
};

export const createTeamConversation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);

    if (!currentUser.teamId) {
      throw new HttpError(400, "You need a team before creating a team chat");
    }

    const team = await prisma.team.findUnique({
      where: { id: currentUser.teamId },
      include: {
        user: {
          select: { userId: true },
          orderBy: { userId: "asc" },
        },
      },
    });

    if (!team) {
      throw new HttpError(404, "Team not found");
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: "TEAM",
        teamId: currentUser.teamId,
      },
      include: conversationInclude,
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (existingConversation) {
      const hasParticipant = existingConversation.participants.some(
        (participant) => participant.userId === currentUser.userId,
      );

      const conversation = hasParticipant
        ? existingConversation
        : await prisma.conversation.update({
            where: { id: existingConversation.id },
            data: {
              participants: {
                create: {
                  userId: currentUser.userId,
                  lastReadAt: new Date(),
                },
              },
            },
            include: conversationInclude,
          });

      res.json(await serializeConversation(conversation, currentUser.userId));
      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        type: "TEAM",
        title: `${team.teamName} Channel`,
        teamId: team.id,
        createdByUserId: currentUser.userId,
        participants: {
          create: team.user.map((member) => ({
            userId: member.userId,
            ...(member.userId === currentUser.userId
              ? { lastReadAt: new Date() }
              : {}),
          })),
        },
      },
      include: conversationInclude,
    });

    res.status(201).json(await serializeConversation(conversation, currentUser.userId));
  } catch (error) {
    sendError(res, error);
  }
};

export const getConversationMessages = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const conversationId = requireNumber(
      req.params.conversationId,
      "conversationId",
    );

    await getConversationForUser(conversationId, currentUser.userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: userSelect,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(messages);
  } catch (error) {
    sendError(res, error);
  }
};

export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const conversationId = requireNumber(
      req.params.conversationId,
      "conversationId",
    );
    const body = requireString(req.body.body, "body");

    await getConversationForUser(conversationId, currentUser.userId);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderUserId: currentUser.userId,
        body,
      },
      include: {
        sender: {
          select: userSelect,
        },
      },
    });

    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: currentUser.userId,
        },
        data: {
          lastReadAt: new Date(),
        },
      }),
    ]);

    res.status(201).json(message);
  } catch (error) {
    sendError(res, error);
  }
};

export const markConversationRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = requireCurrentUser(req);
    const conversationId = requireNumber(
      req.params.conversationId,
      "conversationId",
    );

    await getConversationForUser(conversationId, currentUser.userId);

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: currentUser.userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    sendError(res, error);
  }
};
