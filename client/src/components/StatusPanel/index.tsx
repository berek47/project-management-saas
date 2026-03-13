import { OrbitLoader } from "@/components/LoadingSkeletons";
import { AlertTriangle, Search, Sparkles } from "lucide-react";
import React from "react";

type Tone = "loading" | "warning" | "empty";

type Props = {
  title: string;
  description: string;
  tone?: Tone;
};

const toneStyles: Record<Tone, string> = {
  loading:
    "bg-sand-50 text-teal-600 dark:bg-dark-tertiary dark:text-teal-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  empty: "bg-sand-50 text-slate-700 dark:bg-dark-tertiary dark:text-slate-200",
};

const toneIcons: Record<Tone, React.ReactNode> = {
  loading: <Sparkles className="h-6 w-6" />,
  warning: <AlertTriangle className="h-6 w-6" />,
  empty: <Search className="h-6 w-6" />,
};

const StatusPanel = ({ title, description, tone = "loading" }: Props) => {
  return (
    <div className="glass-panel rounded-3xl p-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {tone === "loading" ? (
          <div className="mb-4 flex h-16 w-16 items-center justify-center">
            <OrbitLoader />
          </div>
        ) : (
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${toneStyles[tone]}`}
          >
            {toneIcons[tone]}
          </div>
        )}
        <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StatusPanel;
