export const dataGridClassNames =
  "glass-panel rounded-2xl border border-sand-100 bg-white/70 shadow-xl dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-gray-200";

export const resolveImageUrl = (
  path?: string | null,
  fallback = "/workspace-os-mark.svg",
) => {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? "#0f1a2b" : "rgba(255,255,255,0.4)"}`,
        borderColor: `${isDarkMode ? "#223047" : "#e6d2aa"}`,
      },
    },
    "& .MuiIconbutton-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-selectIcon": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiDataGrid-cell": {
      border: "none",
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#223047" : "#e6d2aa"}`,
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: `${isDarkMode ? "#223047" : "#e6d2aa"}`,
    },
  };
};
