"use client";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/LoadingSkeletons";
import StatusPanel from "@/components/StatusPanel";
import { useGetTeamsQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "Team ID", width: 100 },
  { field: "teamName", headerName: "Team Name", width: 200 },
  { field: "productOwnerUsername", headerName: "Product Owner", width: 200 },
  {
    field: "projectManagerUsername",
    headerName: "Project Manager",
    width: 200,
  },
];

const Teams = () => {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <div className="p-8">
        <PageHeaderSkeleton />
        <TableSkeleton rows={6} />
      </div>
    );
  }
  if (isError || !teams) {
    return (
      <div className="p-8">
        <StatusPanel
          title="We could not load teams"
          description="Please try again in a moment."
          tone="warning"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <Header name="Teams" />
        <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
          Collaboration Map
        </div>
      </div>
      {teams.length > 0 ? (
        <div style={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={teams}
            columns={columns}
            pagination
            slots={{
              toolbar: CustomToolbar,
            }}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Team Setup
          </p>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Your workspace does not have a visible team yet
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            The app will populate this area once your account is attached to a
            workspace team. Refresh after sign-in or create your first project to
            trigger the starter workspace flow.
          </p>
        </div>
      )}
    </div>
  );
};

export default Teams;
