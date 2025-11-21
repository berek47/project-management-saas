import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdByUserId?: number;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username: string;
  email?: string;
  profilePictureUrl?: string;
  authProviderId?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName?: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  id: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
  productOwnerUsername?: string;
  projectManagerUsername?: string;
}

export interface AuthUserState {
  user: {
    username: string;
  };
  userSub?: string;
  userDetails: User;
}

type BackendUserResponse = User | { message: string; user: User };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isPreviewAuthMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "YOUR_SUPABASE_URL" ||
  supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

const previewUser: User = {
  userId: 1,
  username: "Preview User",
  email: "preview@example.com",
  profilePictureUrl: "i1.jpg",
  authProviderId: "preview-user",
  teamId: 1,
};

const normalizeUserDetails = (
  backendUser: Partial<User> | undefined,
  fallbackUser: User,
): User => ({
  userId: backendUser?.userId,
  username: backendUser?.username || fallbackUser.username,
  email: backendUser?.email || fallbackUser.email,
  profilePictureUrl:
    backendUser?.profilePictureUrl || fallbackUser.profilePictureUrl,
  authProviderId:
    backendUser?.authProviderId || fallbackUser.authProviderId,
  teamId: backendUser?.teamId,
});

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return error.error;
  }

  return fallbackMessage;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      if (isPreviewAuthMode) return headers;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query<AuthUserState, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        if (isPreviewAuthMode) {
          return {
            data: {
              user: { username: previewUser.username },
              userSub: "preview-user",
              userDetails: previewUser,
            },
          };
        }
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error("No session found");

          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error("No authenticated user found");

          const userSub = user.id;
          if (!userSub) throw new Error("No authenticated user id found");

          const fallbackUser: User = {
            username:
              user.user_metadata?.username ||
              user.user_metadata?.preferred_username ||
              user.email?.split("@")[0] ||
              "Workspace User",
            email: user.email || "",
            profilePictureUrl: "i1.jpg",
            authProviderId: userSub,
          };

          const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
          let userDetails: User | undefined;

          if ("data" in userDetailsResponse && userDetailsResponse.data) {
            userDetails = normalizeUserDetails(
              userDetailsResponse.data as User,
              fallbackUser,
            );
          } else if (
            "error" in userDetailsResponse &&
            userDetailsResponse.error &&
            typeof userDetailsResponse.error === "object" &&
            "status" in userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            const createUserResponse = await fetchWithBQ({
              url: "users",
              method: "POST",
              body: {
                username: fallbackUser.username,
                email: fallbackUser.email,
                authProviderId: userSub,
                profilePictureUrl: fallbackUser.profilePictureUrl,
              },
            });

            if ("error" in createUserResponse && createUserResponse.error) {
              return {
                error: {
                  status: "CUSTOM_ERROR",
                  error: getErrorMessage(
                    createUserResponse.error,
                    "Could not create your workspace profile",
                  ),
                },
              };
            }

            const createdUserPayload =
              createUserResponse.data as BackendUserResponse;
            const createdUser =
              "user" in createdUserPayload
                ? createdUserPayload.user
                : createdUserPayload;

            userDetails = normalizeUserDetails(createdUser, fallbackUser);
          } else {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: getErrorMessage(
                  "error" in userDetailsResponse
                    ? userDetailsResponse.error
                    : undefined,
                  "Could not load your workspace profile",
                ),
              },
            };
          }

          return {
            data: {
              user: { username: userDetails.username },
              userSub,
              userDetails,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: error.message || "Could not fetch user data",
            },
          };
        }
      },
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    getProject: build.query<Project, number>({
      query: (projectId) => `projects/${projectId}`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<
      Project,
      { projectId: number; project: Partial<Project> }
    >({
      query: ({ projectId, project }) => ({
        url: `projects/${projectId}`,
        method: "PUT",
        body: project,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        "Projects",
        { type: "Projects", id: projectId },
      ],
    }),
    deleteProject: build.mutation<{ message: string }, number>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects", "Tasks"],
    }),
    getTasks: build.query<Task[], { projectId?: number } | void>({
      query: (arg) =>
        arg?.projectId ? `tasks?projectId=${arg.projectId}` : "tasks",
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;
