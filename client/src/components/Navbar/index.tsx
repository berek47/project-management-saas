import React from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { isPreviewAuthMode, useGetAuthUserQuery } from "@/state/api";
import { resolveImageUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [searchTerm, setSearchTerm] = useState("");

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
