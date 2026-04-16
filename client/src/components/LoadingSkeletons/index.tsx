import React from "react";

type SkeletonBlockProps = {
  className?: string;
};

export const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
  return <div className={`skeleton-block ${className}`.trim()} />;
};

export const OrbitLoader = ({ className = "" }: SkeletonBlockProps) => {
  return (
    <div className={`loader-orbit ${className}`.trim()}>
      <span className="loader-orbit-ring" />
      <span className="loader-orbit-ring loader-orbit-ring-delay" />
      <span className="loader-orbit-core" />
    </div>
  );
};

export const PageHeaderSkeleton = () => {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="h-10 w-64 rounded-2xl" />
      </div>
      <SkeletonBlock className="hidden h-11 w-44 rounded-full md:block" />
    </div>
  );
};

export const StatusPanelSkeleton = () => {
  return (
    <div className="glass-panel rounded-3xl p-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <OrbitLoader className="mb-5" />
        <SkeletonBlock className="mb-3 h-7 w-56 rounded-2xl" />
        <SkeletonBlock className="mb-2 h-4 w-80 max-w-full rounded-full" />
        <SkeletonBlock className="h-4 w-64 max-w-full rounded-full" />
      </div>
    </div>
  );
};

export const CardGridSkeleton = ({
  cards = 3,
}: {
  cards?: number;
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="glass-panel rounded-3xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-16 rounded-full" />
              <SkeletonBlock className="h-7 w-14 rounded-full" />
              <SkeletonBlock className="h-7 w-12 rounded-full" />
            </div>
            <SkeletonBlock className="h-8 w-8 rounded-full" />
          </div>
          <SkeletonBlock className="mb-4 h-8 w-52 rounded-2xl" />
          <SkeletonBlock className="mb-3 h-4 w-40 rounded-full" />
          <SkeletonBlock className="mb-2 h-4 w-full rounded-full" />
          <SkeletonBlock className="mb-2 h-4 w-11/12 rounded-full" />
          <SkeletonBlock className="mb-5 h-4 w-8/12 rounded-full" />
          <div className="flex items-center justify-between border-t border-sand-100 pt-4 dark:border-stroke-dark">
            <SkeletonBlock className="h-9 w-9 rounded-full" />
            <SkeletonBlock className="h-5 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BoardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <div
          key={columnIndex}
          className="relative overflow-visible rounded-3xl py-2 xl:px-2"
        >
          <div className="mb-3 flex w-full">
            <SkeletonBlock className="w-2 rounded-s-lg" />
            <div className="glass-panel flex w-full items-center justify-between rounded-e-3xl px-5 py-4">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-7 w-32 rounded-2xl" />
                <SkeletonBlock className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <SkeletonBlock className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, cardIndex) => (
              <div key={cardIndex} className="glass-panel rounded-3xl p-5">
                <div className="mb-5 flex justify-between gap-3">
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-7 w-16 rounded-full" />
                    <SkeletonBlock className="h-7 w-14 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                </div>
                <SkeletonBlock className="mb-4 h-8 w-40 rounded-2xl" />
                <SkeletonBlock className="mb-2 h-4 w-24 rounded-full" />
                <SkeletonBlock className="mb-2 h-4 w-full rounded-full" />
                <SkeletonBlock className="mb-5 h-4 w-10/12 rounded-full" />
                <div className="flex items-center justify-between border-t border-sand-100 pt-4 dark:border-stroke-dark">
                  <SkeletonBlock className="h-9 w-9 rounded-full" />
                  <SkeletonBlock className="h-5 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl p-4">
      <div className="mb-4 flex gap-3">
        <SkeletonBlock className="h-10 w-28 rounded-full" />
        <SkeletonBlock className="h-10 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 rounded-2xl" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-3">
            <SkeletonBlock className="h-14 rounded-2xl" />
            <SkeletonBlock className="h-14 rounded-2xl" />
            <SkeletonBlock className="h-14 rounded-2xl" />
            <SkeletonBlock className="h-14 rounded-2xl" />
            <SkeletonBlock className="h-14 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TimelineSkeleton = () => {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <SkeletonBlock className="h-8 w-52 rounded-2xl" />
        <SkeletonBlock className="h-12 w-40 rounded-full" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4"
          >
            <SkeletonBlock className="h-8 rounded-2xl" />
            <SkeletonBlock
              className={`h-8 rounded-full ${index % 2 === 0 ? "w-9/12" : "w-7/12"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessageShellSkeleton = () => {
  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="glass-panel rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-28 rounded-full" />
            <SkeletonBlock className="h-7 w-40 rounded-2xl" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
        <div className="mb-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-sand-100 p-4 dark:border-stroke-dark">
              <div className="mb-3 flex items-center gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                <div className="w-full space-y-2">
                  <SkeletonBlock className="h-4 w-32 rounded-full" />
                  <SkeletonBlock className="h-3 w-24 rounded-full" />
                </div>
              </div>
              <SkeletonBlock className="h-3 w-40 rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-sand-100 p-4 dark:border-stroke-dark">
          <SkeletonBlock className="mb-3 h-3 w-36 rounded-full" />
          <SkeletonBlock className="h-4 w-full rounded-full" />
        </div>
      </aside>
      <section className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-56 rounded-2xl" />
          </div>
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>
        <div className="mb-4 flex min-h-[420px] flex-col gap-4 rounded-[2rem] border border-sand-100 bg-white/35 p-4 dark:border-stroke-dark dark:bg-dark-tertiary/30">
          <div className="mr-auto max-w-[70%] rounded-[1.75rem] p-4">
            <SkeletonBlock className="mb-3 h-3 w-28 rounded-full" />
            <SkeletonBlock className="mb-2 h-4 w-44 rounded-full" />
            <SkeletonBlock className="h-4 w-36 rounded-full" />
          </div>
          <div className="ml-auto max-w-[70%] rounded-[1.75rem] p-4">
            <SkeletonBlock className="mb-3 h-3 w-32 rounded-full" />
            <SkeletonBlock className="mb-2 h-4 w-40 rounded-full" />
            <SkeletonBlock className="h-4 w-28 rounded-full" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <OrbitLoader />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <SkeletonBlock className="h-24 flex-1 rounded-[1.75rem]" />
          <SkeletonBlock className="h-12 w-24 rounded-full" />
        </div>
      </section>
    </div>
  );
};

export const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <div className="mb-4 space-y-2">
            <SkeletonBlock className="h-3 w-20 rounded-full" />
            <SkeletonBlock className="h-8 w-36 rounded-2xl" />
          </div>
          <CardGridSkeleton cards={sectionIndex === 0 ? 3 : 2} />
        </section>
      ))}
    </div>
  );
};

export const AuthLoadingScreen = () => {
  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-amber" />
      <div className="auth-orb auth-orb-indigo" />
      <div className="glass-panel w-full max-w-5xl rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="mb-8 flex items-center justify-between">
              <SkeletonBlock className="h-10 w-40 rounded-full" />
              <OrbitLoader />
            </div>
            <div className="space-y-4">
              <SkeletonBlock className="h-5 w-36 rounded-full" />
              <SkeletonBlock className="h-14 w-10/12 rounded-[1.5rem]" />
              <SkeletonBlock className="h-5 w-full rounded-full" />
              <SkeletonBlock className="h-5 w-9/12 rounded-full" />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[1.5rem] border border-sand-100 p-5 dark:border-stroke-dark">
                  <SkeletonBlock className="mb-4 h-10 w-10 rounded-2xl" />
                  <SkeletonBlock className="mb-3 h-4 w-24 rounded-full" />
                  <SkeletonBlock className="h-4 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="mb-6 flex justify-between gap-3">
              <SkeletonBlock className="h-12 flex-1 rounded-full" />
              <SkeletonBlock className="h-12 flex-1 rounded-full" />
            </div>
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-20 rounded-full" />
              <SkeletonBlock className="h-14 w-full rounded-[1.25rem]" />
              <SkeletonBlock className="h-4 w-24 rounded-full" />
              <SkeletonBlock className="h-14 w-full rounded-[1.25rem]" />
              <SkeletonBlock className="h-12 w-full rounded-full" />
            </div>
            <div className="mt-8 rounded-[1.5rem] border border-sand-100 p-5 dark:border-stroke-dark">
              <SkeletonBlock className="mb-3 h-4 w-28 rounded-full" />
              <SkeletonBlock className="h-4 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
