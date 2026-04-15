"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import StatusPanel from "@/components/StatusPanel";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash";
import { Search as SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const Search = () => {
  const searchParams = useSearchParams();
  const initialQuery = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    500,
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  useEffect(() => {
    setSearchInput(initialQuery);
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const totalResults =
    (searchResults?.tasks?.length || 0) +
    (searchResults?.projects?.length || 0) +
    (searchResults?.users?.length || 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <Header name="Search Studio" />
        <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
          Fast Discovery
        </div>
      </div>
      <div className="glass-panel mb-6 rounded-3xl p-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
          Explore
        </p>
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Search tasks, projects, and people
        </h2>
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
          <input
            type="text"
            placeholder="Try project names, task labels, or team members..."
            className="w-full rounded-full border border-sand-100 bg-white/80 p-4 pl-12 text-slate-900 shadow-sm outline-none placeholder:text-slate-500 focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:placeholder:text-slate-300"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e);
            }}
          />
        </div>
      </div>

      <div className="px-1">
        {searchTerm.length === 0 && (
          <StatusPanel
            title="Start with a keyword"
            description="Search across your current workspace projects, tasks, and people by name, description, or username."
            tone="empty"
          />
        )}
        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <div className="rounded-2xl border border-sand-100 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary/70 dark:text-slate-300">
            Add one more character to start searching.
          </div>
        )}
      </div>

      <div className="space-y-8 p-1">
        {isLoading && (
          <StatusPanel
            title="Searching your workspace"
            description="Looking through projects, tasks, and people for matches."
            tone="loading"
          />
        )}
        {isError && (
          <StatusPanel
            title="Search is unavailable right now"
            description="You can keep browsing the app and try your search again in a moment."
            tone="warning"
          />
        )}
        {!isLoading && !isError && searchTerm.length >= 2 && searchResults && totalResults === 0 && (
          <StatusPanel
            title="No matches found"
            description="Try a different keyword or a broader search phrase."
            tone="empty"
          />
        )}

        {!isLoading && !isError && searchResults && (
          <div className="space-y-8">
            {searchResults.tasks && searchResults.tasks.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                    Results
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Tasks
                  </h2>
                </div>
                {searchResults.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </section>
            )}

            {searchResults.projects && searchResults.projects.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                    Results
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Projects
                  </h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {searchResults.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {searchResults.users && searchResults.users.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                    Results
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    People
                  </h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {searchResults.users.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
