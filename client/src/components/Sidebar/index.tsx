"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  isPreviewAuthMode,
  useGetAuthUserQuery,
  useGetProjectsQuery,
  useGetTeamsQuery,
} from "@/state/api";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { resolveImageUrl } from "@/lib/utils";

const Sidebar = () => {
  const router = useRouter();
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const { data: projects } = useGetProjectsQuery();
  const { data: teams } = useGetTeamsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const { data: currentUser } = useGetAuthUserQuery();
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
  const activeTeam = teams?.[0];

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between border-r border-sand-100 shadow-xl
    transition-all duration-300 h-full z-40 overflow-y-auto bg-white dark:border-stroke-dark dark:bg-black
    ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[72px] w-64 items-center justify-between border-b border-sand-100 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-600 dark:text-teal-300">
              Workspace OS
            </p>
            <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              PROJECTS
            </div>
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className="rounded-full p-2 transition hover:bg-white/80 dark:hover:bg-dark-tertiary"
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
            >
              <X className="h-5 w-5 text-slate-700 dark:text-white" />
            </button>
          )}
        </div>
        {/* TEAM */}
        <div className="mx-4 mt-4 flex items-center gap-4 rounded-2xl border border-sand-100 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80">
          <Image
            src="/workspace-os-mark.svg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-xl ring-2 ring-sand-100 dark:ring-stroke-dark"
          />
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-gray-200">
              {activeTeam?.teamName || `${currentUserDetails?.username}'s Team`}
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <LockIcon className="mt-[0.1rem] h-3 w-3 text-teal-600 dark:text-teal-300" />
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                Private Workspace
              </p>
            </div>
          </div>
        </div>
        {/* NAVBAR LINKS */}
        <nav className="z-10 mt-4 w-full space-y-1 px-3">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users} label="Teams" href="/teams" />
        </nav>

        {/* PROJECTS LINKS */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="mt-6 flex w-full items-center justify-between px-8 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          <span className="">Projects</span>
          {showProjects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {/* PROJECTS LIST */}
        {showProjects &&
          projects?.map((project) => (
            <SidebarLink
              key={project.id}
              icon={Briefcase}
              label={project.name}
              href={`/projects/${project.id}`}
            />
          ))}

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="mt-4 flex w-full items-center justify-between px-8 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          <span className="">Priority</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Urgent"
              href="/priority/urgent"
            />
            <SidebarLink
              icon={ShieldAlert}
              label="High"
              href="/priority/high"
            />
            <SidebarLink
              icon={AlertTriangle}
              label="Medium"
              href="/priority/medium"
            />
            <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
            <SidebarLink
              icon={Layers3}
              label="Backlog"
              href="/priority/backlog"
            />
          </>
        )}
      </div>
      <div className="z-10 mx-4 mb-4 mt-12 flex w-auto flex-col items-center gap-4 rounded-2xl border border-sand-100 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 md:hidden">
        <div className="flex w-full items-center">
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
              <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
            )}
          </div>
          <span className="mx-3 text-sm font-semibold text-slate-900 dark:text-white">
            {currentUserDetails?.username}
          </span>
          {!isPreviewAuthMode && (
            <button
              className="self-start rounded-full bg-blue-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-600 md:block"
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

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 rounded-2xl px-5 py-3 transition-colors ${
          isActive
            ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg"
            : "text-slate-700 hover:bg-white/70 dark:text-gray-100 dark:hover:bg-dark-tertiary"
        } justify-start`}
      >
        {isActive && (
          <div className="absolute left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-white/80" />
        )}

        <Icon
          className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-700 dark:text-gray-100"}`}
        />
        <span
          className={`font-medium ${isActive ? "text-white" : "text-slate-800 dark:text-gray-100"}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
