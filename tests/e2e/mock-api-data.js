const projects = [
  {
    id: 1,
    name: "Launchpad",
    description: "Coordinate the public rollout for the next workspace release.",
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-05-15T00:00:00.000Z",
    createdByUserId: 1,
  },
  {
    id: 2,
    name: "Ops Radar",
    description: "Track the internal reliability and support backlog.",
    startDate: "2026-04-10T00:00:00.000Z",
    endDate: "2026-06-01T00:00:00.000Z",
    createdByUserId: 1,
  },
];

const users = [
  {
    userId: 1,
    username: "Preview User",
    email: "preview@example.com",
    profilePictureUrl: "i1.jpg",
    authProviderId: "preview-user",
    teamId: 1,
  },
  {
    userId: 2,
    username: "Alex Morgan",
    email: "alex@example.com",
    profilePictureUrl: "i2.jpg",
    authProviderId: "alex-user",
    teamId: 1,
  },
];

const tasks = [
  {
    id: 101,
    title: "Design launch brief",
    description: "Prepare the customer-facing announcement outline.",
    status: "To Do",
    priority: "High",
    tags: "launch,copy",
    startDate: "2026-04-28T00:00:00.000Z",
    dueDate: "2026-05-02T00:00:00.000Z",
    points: 6,
    projectId: 1,
    authorUserId: 1,
    assignedUserId: 2,
    author: users[0],
    assignee: users[1],
    comments: [
      {
        id: 7001,
        text: "Draft is ready for review.",
        taskId: 101,
        userId: 2,
        user: users[1],
      },
    ],
    attachments: [],
  },
  {
    id: 102,
    title: "Finalize landing page QA",
    description: "Close the final accessibility and copy review checks.",
    status: "Completed",
    priority: "Medium",
    tags: "launch,qa",
    startDate: "2026-04-20T00:00:00.000Z",
    dueDate: "2026-04-26T00:00:00.000Z",
    points: 8,
    projectId: 1,
    authorUserId: 1,
    assignedUserId: 1,
    author: users[0],
    assignee: users[0],
    comments: [],
    attachments: [],
  },
  {
    id: 201,
    title: "Audit support backlog",
    description: "Review unresolved issues from the current sprint.",
    status: "Work In Progress",
    priority: "Urgent",
    tags: "ops,support",
    startDate: "2026-04-25T00:00:00.000Z",
    dueDate: "2026-05-05T00:00:00.000Z",
    points: 5,
    projectId: 2,
    authorUserId: 1,
    assignedUserId: 1,
    author: users[0],
    assignee: users[0],
    comments: [],
    attachments: [],
  },
];

const conversations = [
  {
    id: 1,
    type: "DIRECT",
    title: null,
    team: null,
    participants: [
      {
        id: 1,
        joinedAt: "2026-04-01T08:00:00.000Z",
        lastReadAt: "2026-04-28T09:00:00.000Z",
        user: users[0],
      },
      {
        id: 2,
        joinedAt: "2026-04-01T08:00:00.000Z",
        lastReadAt: null,
        user: users[1],
      },
    ],
    lastMessage: {
      id: 501,
      body: "Draft is ready for review.",
      createdAt: "2026-04-29T10:00:00.000Z",
      sender: users[1],
    },
    unreadCount: 1,
    lastReadAt: "2026-04-28T09:00:00.000Z",
    updatedAt: "2026-04-29T10:00:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
  },
];

const teams = [
  {
    id: 1,
    teamName: "Preview User's Team",
    productOwnerUserId: 1,
    projectManagerUserId: 1,
    productOwnerUsername: "Preview User",
    projectManagerUsername: "Preview User",
  },
];

module.exports = {
  projects,
  tasks,
  teams,
  users,
  conversations,
};
