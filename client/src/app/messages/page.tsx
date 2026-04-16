"use client";

import Header from "@/components/Header";
import { MessageShellSkeleton } from "@/components/LoadingSkeletons";
import StatusPanel from "@/components/StatusPanel";
import {
  ConversationSummary,
  User,
  useCreateDirectConversationMutation,
  useDeleteMessageMutation,
  useCreateMessageMutation,
  useCreateTeamConversationMutation,
  useGetAuthUserQuery,
  useGetConversationMessagesQuery,
  useGetConversationsQuery,
  useGetUsersQuery,
  useMarkConversationReadMutation,
  useUpdateMessageMutation,
} from "@/state/api";
import { formatDistanceToNow } from "date-fns";
import {
  EllipsisVertical,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import { resolveImageUrl } from "@/lib/utils";

const getConversationLabel = (
  conversation: ConversationSummary,
  currentUserId?: number,
) => {
  if (conversation.type === "TEAM") {
    return conversation.title || conversation.team?.teamName || "Team Channel";
  }

  const peer = conversation.participants.find(
    (participant) => participant.user.userId !== currentUserId,
  );

  return peer?.user.username || "Direct Message";
};

const MessagesPage = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const currentUserId = authUser?.userDetails?.userId;
  const currentTeamId = authUser?.userDetails?.teamId;
  const { data: conversations, isLoading, error } = useGetConversationsQuery();
  const { data: users } = useGetUsersQuery();
  const [createDirectConversation, { isLoading: isStartingDirect }] =
    useCreateDirectConversationMutation();
  const [createTeamConversation, { isLoading: isCreatingTeamChannel }] =
    useCreateTeamConversationMutation();
  const [createMessage, { isLoading: isSendingMessage }] =
    useCreateMessageMutation();
  const [updateMessage, { isLoading: isUpdatingMessage }] =
    useUpdateMessageMutation();
  const [deleteMessage, { isLoading: isDeletingMessage }] =
    useDeleteMessageMutation();
  const [markConversationRead] = useMarkConversationReadMutation();
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    number | null
  >(null);
  const [composerValue, setComposerValue] = React.useState("");
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(
    null,
  );
  const [editingValue, setEditingValue] = React.useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    if (!selectedConversationId && conversations?.length) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation =
    conversations?.find(
      (conversation) => conversation.id === selectedConversationId,
    ) || null;

  const { data: messages, isLoading: isMessagesLoading } =
    useGetConversationMessagesQuery(selectedConversationId as number, {
      skip: !selectedConversationId,
    });
  const hasMessages = Array.isArray(messages) && messages.length > 0;

  React.useEffect(() => {
    if (selectedConversationId) {
      void markConversationRead({ conversationId: selectedConversationId });
    }
  }, [markConversationRead, selectedConversationId]);

  const teammates = React.useMemo(
    () =>
      (users || []).filter(
        (user) => user.userId && user.userId !== currentUserId && user.teamId === currentTeamId,
      ),
    [currentTeamId, currentUserId, users],
  );

  const handleStartDirectConversation = async (userId: number) => {
    const conversation = await createDirectConversation({
      participantUserId: userId,
    }).unwrap();
    setSelectedConversationId(conversation.id);
  };

  const handleEnsureTeamChannel = async () => {
    const conversation = await createTeamConversation().unwrap();
    setSelectedConversationId(conversation.id);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = composerValue.trim();

    if (!selectedConversationId || !nextMessage) {
      return;
    }

    setComposerValue("");

    try {
      await createMessage({
        conversationId: selectedConversationId,
        body: nextMessage,
      }).unwrap();
    } catch {
      setComposerValue(nextMessage);
    }
  };

  const handleStartEditing = (messageId: number, body: string) => {
    setOpenMessageMenuId(null);
    setEditingMessageId(messageId);
    setEditingValue(body);
  };

  const handleCancelEditing = () => {
    setEditingMessageId(null);
    setEditingValue("");
  };

  const handleSaveMessage = async (
    event: React.FormEvent<HTMLFormElement>,
    messageId: number,
  ) => {
    event.preventDefault();

    if (!selectedConversationId || !editingValue.trim()) {
      return;
    }

    const nextBody = editingValue.trim();
    setEditingMessageId(null);
    setEditingValue("");

    try {
      await updateMessage({
        conversationId: selectedConversationId,
        messageId,
        body: nextBody,
      }).unwrap();
    } catch {
      setEditingMessageId(messageId);
      setEditingValue(nextBody);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedConversationId) {
      return;
    }

    setOpenMessageMenuId(null);
    await deleteMessage({
      conversationId: selectedConversationId,
      messageId,
    }).unwrap();
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 xl:px-6">
        <MessageShellSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 xl:px-6">
        <StatusPanel
          title="Messages are unavailable"
          description="The messaging workspace could not be loaded right now."
          tone="warning"
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 xl:px-6">
      <Header name="Messages" />
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="glass-panel rounded-3xl p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                Workspace Inbox
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Conversations
              </h2>
            </div>
            <button
              className="inline-flex items-center rounded-full bg-blue-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-600"
              onClick={() => void handleEnsureTeamChannel()}
              disabled={isCreatingTeamChannel}
            >
              <Users className="mr-2 h-4 w-4" />
              Team Channel
            </button>
          </div>

          <div className="mb-5 space-y-2">
            {conversations?.length ? (
              conversations.map((conversation) => {
                const label = getConversationLabel(conversation, currentUserId);
                const peer = conversation.participants.find(
                  (participant) => participant.user.userId !== currentUserId,
                )?.user;

                return (
                  <button
                    key={conversation.id}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedConversationId === conversation.id
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-sand-100 bg-white/75 hover:border-teal-300 dark:border-stroke-dark dark:bg-dark-secondary/75"
                    }`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {conversation.type === "TEAM" ? (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-primary/10 text-blue-primary">
                            <Users className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-11 w-11 overflow-hidden rounded-2xl bg-sand-50">
                            <Image
                              src={resolveImageUrl(peer?.profilePictureUrl, "/i1.jpg")}
                              alt={peer?.username || label}
                              width={44}
                              height={44}
                              className="h-11 w-11 object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {label}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                            {conversation.lastMessage?.body || "No messages yet"}
                          </p>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 ? (
                        <span className="rounded-full bg-teal-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </button>
                );
              })
            ) : (
              <StatusPanel
                title="No conversations yet"
                description="Start a direct message or create a team channel to begin."
                tone="empty"
              />
            )}
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              Start Direct Message
            </p>
            <div className="space-y-2">
              {teammates.length ? (
                teammates.map((user) => (
                  <button
                    key={user.userId}
                    className="flex w-full items-center justify-between rounded-2xl border border-sand-100 bg-white/75 px-4 py-3 text-left transition hover:border-teal-300 dark:border-stroke-dark dark:bg-dark-secondary/75"
                    onClick={() => void handleStartDirectConversation(user.userId!)}
                    disabled={isStartingDirect}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-2xl bg-sand-50">
                        <Image
                          src={resolveImageUrl(user.profilePictureUrl, "/i1.jpg")}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {user.email || "Workspace member"}
                        </p>
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                  </button>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-sand-100 px-4 py-4 text-sm text-slate-500 dark:border-stroke-dark dark:text-slate-300">
                  Invite teammates to unlock direct messaging inside the workspace.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="glass-panel flex min-h-[70vh] flex-col rounded-3xl">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-sand-100 px-6 py-5 dark:border-stroke-dark">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                    {selectedConversation.type === "TEAM"
                      ? "Team Channel"
                      : "Direct Conversation"}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {getConversationLabel(selectedConversation, currentUserId)}
                  </h2>
                </div>
                <div className="rounded-full border border-sand-100 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-stroke-dark dark:bg-dark-secondary/70 dark:text-slate-300">
                  {selectedConversation.participants.length} member
                  {selectedConversation.participants.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {isMessagesLoading && !hasMessages ? (
                  <StatusPanel
                    title="Loading conversation"
                    description="Pulling the latest messages for this channel."
                    tone="loading"
                  />
                ) : hasMessages ? (
                  messages.map((message) => {
                    const isOwnMessage = message.senderUserId === currentUserId;
                    const isEditing = editingMessageId === message.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                            isOwnMessage
                              ? "bg-blue-primary text-white"
                              : "border border-sand-100 bg-white/85 text-slate-900 dark:border-stroke-dark dark:bg-dark-secondary/85 dark:text-white"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs opacity-80">
                              <span className="font-semibold">
                                {message.sender.username}
                              </span>
                              <span>
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            {isOwnMessage && !isEditing ? (
                              <div className="relative">
                                <button
                                  type="button"
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/20"
                                  onClick={() =>
                                    setOpenMessageMenuId((current) =>
                                      current === message.id ? null : message.id,
                                    )
                                  }
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </button>
                                {openMessageMenuId === message.id ? (
                                  <div className="absolute right-0 top-9 z-10 min-w-32 rounded-2xl border border-white/15 bg-[#0f766e] p-2 shadow-xl">
                                    <button
                                      type="button"
                                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-white/10"
                                      onClick={() =>
                                        handleStartEditing(message.id, message.body)
                                      }
                                    >
                                      <Pencil className="mr-2 h-3 w-3" />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-semibold text-white transition hover:bg-white/10"
                                      onClick={() => void handleDeleteMessage(message.id)}
                                      disabled={isDeletingMessage}
                                    >
                                      <Trash2 className="mr-2 h-3 w-3" />
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          {isEditing ? (
                            <form
                              className="space-y-3"
                              onSubmit={(event) =>
                                void handleSaveMessage(event, message.id)
                              }
                            >
                              <textarea
                                value={editingValue}
                                onChange={(event) =>
                                  setEditingValue(event.target.value)
                                }
                                className={`min-h-[88px] w-full rounded-2xl border px-3 py-2 text-sm leading-6 outline-none transition ${
                                  isOwnMessage
                                    ? "border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:border-white/60"
                                    : "border-sand-100 bg-white text-slate-900 focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white"
                                }`}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold transition ${
                                    isOwnMessage
                                      ? "bg-white/15 text-white hover:bg-white/20"
                                      : "bg-sand-50 text-slate-700 hover:bg-sand-100 dark:bg-dark-tertiary dark:text-slate-200"
                                  }`}
                                  onClick={handleCancelEditing}
                                >
                                  <X className="mr-1 h-3 w-3" />
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isUpdatingMessage || !editingValue.trim()}
                                  className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    isOwnMessage
                                      ? "bg-white text-blue-primary hover:bg-slate-100"
                                      : "bg-blue-primary text-white hover:bg-teal-600"
                                  }`}
                                >
                                  <Pencil className="mr-1 h-3 w-3" />
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {message.body}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <StatusPanel
                    title="No messages yet"
                    description="Send the first message to start the conversation."
                    tone="empty"
                  />
                )}
              </div>

              <form
                className="border-t border-sand-100 px-6 py-5 dark:border-stroke-dark"
                onSubmit={(event) => void handleSendMessage(event)}
              >
                <div className="flex items-end gap-3">
                  <textarea
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    placeholder="Write a message to your team..."
                    className="min-h-[96px] flex-1 rounded-3xl border border-sand-100 bg-white/75 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary/75 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !composerValue.trim()}
                    className="inline-flex items-center rounded-full bg-blue-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-primary/10 text-blue-primary">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Select a conversation
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Choose an existing thread on the left or start a new direct conversation with a teammate.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
