"use client";

import Header from "@/components/Header";
import { useGetAuthUserQuery } from "@/state/api";
import Link from "next/link";
import React from "react";

const Settings = () => {
  const { data: currentUser } = useGetAuthUserQuery();
  const profile = {
    name: currentUser?.userDetails?.username || "Workspace User",
    email: currentUser?.userDetails?.email || "No email available",
    role: currentUser?.userDetails?.teamId
      ? `Team ${currentUser.userDetails.teamId}`
      : "No team assigned",
    authId: currentUser?.userDetails?.authProviderId || "Preview mode",
  };

  const labelStyles =
    "block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300";
  const textStyles =
    "glass-panel mt-2 block w-full rounded-2xl border border-sand-100 p-4 text-slate-900 dark:border-stroke-dark dark:text-white";
  const linkStyles = "text-teal-600 hover:underline dark:text-teal-300";

  return (
    <div className="p-8">
      <Header name="Settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelStyles}>Name</label>
          <div className={textStyles}>{profile.name}</div>
        </div>
        <div>
          <label className={labelStyles}>Email</label>
          <div className={textStyles}>{profile.email}</div>
        </div>
        <div>
          <label className={labelStyles}>Auth ID</label>
          <div className={textStyles}>{profile.authId}</div>
        </div>
        <div>
          <label className={labelStyles}>Role</label>
          <div className={textStyles}>{profile.role}</div>
        </div>
        <div>
          <label className={labelStyles}>Search</label>
          <div className={textStyles}>
            <Link href="/search" className={linkStyles}>
              Open workspace search
            </Link>
          </div>
        </div>
        <div>
          <label className={labelStyles}>Projects</label>
          <div className={textStyles}>
            <Link href="/" className={linkStyles}>
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
