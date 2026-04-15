import Header from "@/components/Header";
import {
  Clock,
  Filter,
  Grid3x3,
  List,
  PencilLine,
  PlusSquare,
  Search,
  Share2,
  Table,
} from "lucide-react";
import React from "react";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showCompletedTasks: boolean;
  setShowCompletedTasks: (value: boolean) => void;
  title: string;
  subtitle?: string;
  actionLabel: string;
  onPrimaryAction: () => void;
  managementLabel?: string;
  onManagementAction?: () => void;
};

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  showCompletedTasks,
  setShowCompletedTasks,
  title,
  subtitle,
  actionLabel,
  onPrimaryAction,
  managementLabel,
  onManagementAction,
}: Props) => {
  const [shareLabel, setShareLabel] = React.useState("Share");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = React.useState(false);
  const filterMenuRef = React.useRef<HTMLDivElement | null>(null);
  const shareMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(target)
      ) {
        setIsFilterMenuOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(target)) {
        setIsShareMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: subtitle || title,
          url: shareUrl,
        });
        setShareLabel("Shared");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareLabel("Copied");
      }
      window.setTimeout(() => setShareLabel("Share"), 1500);
    } catch {
      setShareLabel("Share failed");
      window.setTimeout(() => setShareLabel("Share"), 1500);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("Copied");
    } catch {
      setShareLabel("Copy failed");
    } finally {
      setIsShareMenuOpen(false);
      window.setTimeout(() => setShareLabel("Share"), 1500);
    }
  };

  return (
    <div className="px-4 xl:px-6">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-600 dark:text-teal-300">
              Project Workspace
            </p>
            <Header
              name={title}
              buttonComponent={
                <div className="flex flex-wrap items-center gap-3">
                  {managementLabel && onManagementAction ? (
                    <button
                      className="flex items-center rounded-full border border-sand-100 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:hover:text-teal-300"
                      onClick={onManagementAction}
                    >
                      <PencilLine className="mr-2 h-5 w-5" /> {managementLabel}
                    </button>
                  ) : null}
                  <button
                    className="flex items-center rounded-full bg-blue-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
                    onClick={onPrimaryAction}
                  >
                    <PlusSquare className="mr-2 h-5 w-5" /> {actionLabel}
                  </button>
                </div>
              }
            />
            {subtitle ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300">
            Live project view
          </div>
        </div>
      </div>

      <div className="glass-panel relative z-30 flex flex-wrap gap-3 overflow-visible rounded-3xl border border-sand-100 px-4 py-3 dark:border-stroke-dark md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <TabButton
            name="Board"
            icon={<Grid3x3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="List"
            icon={<List className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<Table className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={filterMenuRef}>
            <button
              className={`rounded-full p-2 transition ${
                !showCompletedTasks || isFilterMenuOpen
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-neutral-400 dark:hover:bg-dark-tertiary dark:hover:text-white"
              }`}
              onClick={() => {
                setIsFilterMenuOpen((prev) => !prev);
                setIsShareMenuOpen(false);
              }}
              title="Task filters"
            >
              <Filter className="h-5 w-5" />
            </button>
            {isFilterMenuOpen ? (
              <div className="absolute right-0 top-12 z-[120] min-w-64 whitespace-nowrap rounded-2xl border border-sand-100 bg-white/95 p-2 shadow-2xl backdrop-blur dark:border-stroke-dark dark:bg-dark-secondary/95">
                <button
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                  onClick={() => {
                    setShowCompletedTasks(true);
                    setIsFilterMenuOpen(false);
                  }}
                >
                  Show all tasks
                  {showCompletedTasks ? (
                    <span className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                      Active
                    </span>
                  ) : null}
                </button>
                <button
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                  onClick={() => {
                    setShowCompletedTasks(false);
                    setIsFilterMenuOpen(false);
                  }}
                >
                  Hide completed tasks
                  {!showCompletedTasks ? (
                    <span className="text-xs uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                      Active
                    </span>
                  ) : null}
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative" ref={shareMenuRef}>
            <button
              className={`rounded-full p-2 transition ${
                isShareMenuOpen
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-neutral-400 dark:hover:bg-dark-tertiary dark:hover:text-white"
              }`}
              onClick={() => {
                setIsShareMenuOpen((prev) => !prev);
                setIsFilterMenuOpen(false);
              }}
              title="Share this project"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {isShareMenuOpen ? (
              <div className="absolute right-0 top-12 z-[120] min-w-64 whitespace-nowrap rounded-2xl border border-sand-100 bg-white/95 p-2 shadow-2xl backdrop-blur dark:border-stroke-dark dark:bg-dark-secondary/95">
                <button
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                  onClick={() => {
                    void handleShare();
                    setIsShareMenuOpen(false);
                  }}
                >
                  Open share sheet
                </button>
                <button
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-sand-50 dark:text-slate-200 dark:hover:bg-dark-tertiary"
                  onClick={() => void handleCopyLink()}
                >
                  Copy project link
                </button>
              </div>
            ) : null}
          </div>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 md:block">
            {shareLabel}
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks"
              className="rounded-full border border-sand-100 bg-white/80 py-2 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 rounded-full px-3 py-2 text-slate-500 transition hover:bg-white/70 hover:text-teal-600 dark:text-neutral-400 dark:hover:bg-dark-tertiary dark:hover:text-white sm:px-3 lg:px-4 ${
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
