import React from "react";
import {
  Bell,
  Menu,
  MessageSquareMore,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import {
  isPreviewAuthMode,
  useGetAuthUserQuery,
  useGetConversationsQuery,
  useGetTasksQuery,
} from "@/state/api";
import { resolveImageUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: currentUser } = useGetAuthUserQuery();
  const { data: conversations } = useGetConversationsQuery();
  const { data: tasks } = useGetTasksQuery();
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!currentUser) return null;
  const currentUserDetails = currentUser?.userDetails;
  const currentUserId = currentUserDetails?.userId;

  const conversationNotifications =
    conversations
      ?.filter((conversation) => conversation.unreadCount > 0)
      .map((conversation) => ({
        id: `conversation-${conversation.id}`,
        kind: "conversation" as const,
        label:
          conversation.type === "TEAM"
            ? conversation.title || conversation.team?.teamName || "Team Channel"
            : conversation.participants.find(
                (participant) => participant.user.userId !== currentUserId,
              )?.user.username || "Direct Message",
        preview: conversation.lastMessage?.body || "Unread messages waiting",
        timestamp: conversation.updatedAt,
        count: conversation.unreadCount,
      })) || [];

  const taskNotifications =
    tasks
      ?.flatMap((task) => {
        const externalComments =
          task.comments?.filter((comment) => comment.userId !== currentUserId) || [];
        const latestComment = externalComments.at(-1);

        if (!latestComment) {
          return [];
        }

        return [
          {
            id: `task-${task.id}-${latestComment.id}`,
            kind: "task" as const,
            label: task.title,
            preview: latestComment.text,
            timestamp: `${latestComment.id}`,
            count: externalComments.length,
          },
        ];
      })
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp)) || [];

  const notifications = [...conversationNotifications, ...taskNotifications];
  const totalNotificationCount = notifications.reduce(
    (sum, notification) => sum + notification.count,
    0,
  );

  const submitSearch = () => {
    const query = searchTerm.trim();
    if (!query) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="glass-panel sticky top-0 z-30 mx-4 mt-4 flex items-center justify-between rounded-2xl border border-sand-100 px-4 py-3 dark:border-stroke-dark">
      {/* Search Bar */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            className="rounded-full bg-white/70 p-2 text-slate-900 shadow-sm transition hover:bg-white dark:bg-dark-tertiary dark:text-white dark:hover:bg-dark-secondary"
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <div className="relative flex h-min w-[220px] md:w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
          <input
            className="w-full rounded-full border border-sand-100 bg-white/80 p-2.5 pl-10 text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:placeholder:text-slate-300"
            type="search"
            placeholder="Search projects, tasks, teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
          />
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            className="relative rounded-full p-2 transition hover:bg-white/80 dark:hover:bg-dark-tertiary"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
          >
            <Bell className="h-5 w-5 cursor-pointer text-slate-900 dark:text-white" />
            {totalNotificationCount > 0 ? (
              <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-semibold text-white">
                {totalNotificationCount}
              </span>
            ) : null}
          </button>
          {isNotificationsOpen ? (
            <div className="absolute right-0 top-12 z-40 w-[320px] rounded-3xl border border-sand-100 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-stroke-dark dark:bg-dark-secondary/95">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                    Notifications
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Workspace Activity
                  </h3>
                </div>
                <span className="rounded-full bg-sand-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-dark-tertiary dark:text-slate-200">
                  {totalNotificationCount}
                </span>
              </div>
              <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-2xl border border-sand-100 bg-white/80 p-4 dark:border-stroke-dark dark:bg-dark-tertiary/70"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-primary/10 text-blue-primary">
                            {notification.kind === "conversation" ? (
                              <Bell className="h-4 w-4" />
                            ) : (
                              <MessageSquareMore className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {notification.label}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                              {notification.preview}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-teal-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {notification.count}
                        </span>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {notification.kind === "conversation"
                          ? formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                            })
                          : "Task discussion activity"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-sand-100 px-4 py-6 text-center text-sm text-slate-500 dark:border-stroke-dark dark:text-slate-300">
                    No unread chat or task discussion activity right now.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="rounded-full p-2 transition hover:bg-white/80 dark:hover:bg-dark-tertiary"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 cursor-pointer text-white" />
          ) : (
            <Moon className="h-5 w-5 cursor-pointer text-slate-900" />
          )}
        </button>
        <Link
          href="/settings"
          className="h-min w-min rounded-full p-2 transition hover:bg-white/80 dark:hover:bg-dark-tertiary"
        >
          <Settings className="h-5 w-5 cursor-pointer text-slate-900 dark:text-white" />
        </Link>
        <div className="ml-2 mr-4 hidden min-h-[2.25rem] w-px bg-sand-100 dark:bg-stroke-dark md:inline-block"></div>
        <div className="hidden items-center rounded-full bg-white/80 px-2 py-1 shadow-sm dark:bg-dark-secondary md:flex">
          <div className="align-center flex h-9 w-9 justify-center overflow-hidden rounded-full ring-2 ring-sand-100 dark:ring-stroke-dark">
            {!!currentUserDetails?.profilePictureUrl ? (
              <Image
                src={resolveImageUrl(currentUserDetails?.profilePictureUrl, "/i1.jpg")}
                alt={currentUserDetails?.username || "User Profile Picture"}
                width={100}
                height={50}
                className="h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 self-center rounded-full text-slate-700 dark:text-white" />
            )}
          </div>
          <div className="mx-3 leading-tight">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              Workspace
            </p>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentUserDetails?.username}
            </span>
          </div>
          {!isPreviewAuthMode && (
            <button
              className="hidden rounded-full bg-blue-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-600 md:block"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
