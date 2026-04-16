"use client";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/LoadingSkeletons";
import StatusPanel from "@/components/StatusPanel";
import { useGetUsersQuery } from "@/state/api";
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
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "email",
    headerName: "Email",
    width: 240,
    valueGetter: (_, row) => row.email || "No email connected",
  },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={resolveImageUrl(params.value, "/i1.jpg")}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) {
    return (
      <div className="p-8">
        <PageHeaderSkeleton />
        <TableSkeleton rows={7} />
      </div>
    );
  }
  if (isError || !users) {
    return (
      <div className="p-8">
        <StatusPanel
          title="We could not load people"
          description="Please try again in a moment."
          tone="warning"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <Header name="People" />
        <div className="hidden rounded-full border border-sand-100 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur-md dark:border-stroke-dark dark:bg-dark-secondary/80 dark:text-slate-300 md:block">
          Team Directory
        </div>
      </div>
      {users.length > 0 ? (
        <div style={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.userId}
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
            Directory
          </p>
          <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-white">
            No people are visible in this workspace yet
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Team members will appear here once they join the same workspace or
            once your starter workspace finishes syncing.
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
