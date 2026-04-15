import { User } from "@/state/api";
import { resolveImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import React from "react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="glass-panel flex items-center gap-4 rounded-3xl p-5">
      {user.profilePictureUrl && (
        <div className="overflow-hidden rounded-2xl ring-2 ring-sand-100 dark:ring-stroke-dark">
          <Image
            src={resolveImageUrl(user.profilePictureUrl, "/i1.jpg")}
            alt="profile picture"
            width={60}
            height={60}
            className="h-[60px] w-[60px] object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
          Team Member
        </p>
        <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
          {user.username}
        </h3>
        <p className="truncate text-sm text-slate-600 dark:text-slate-300">
          {user.email || "No email available"}
        </p>
      </div>
      <div className="hidden flex-col gap-2 md:flex">
        <button className="rounded-full bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white dark:bg-dark-secondary dark:text-slate-200">
          <Mail className="h-4 w-4" />
        </button>
        <button className="rounded-full bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white dark:bg-dark-secondary dark:text-slate-200">
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UserCard;
