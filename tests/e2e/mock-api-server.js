const http = require("http");
const { URL } = require("url");
const {
  conversations,
  projects,
  tasks,
  teams,
  users,
} = require("./mock-api-data");

const sendJson = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1:3001",
    "access-control-allow-credentials": "true",
  });
  response.end(JSON.stringify(body));
};

const filterTasksByProject = (projectId) =>
  tasks.filter((task) => task.projectId === projectId);

const findProject = (projectId) =>
  projects.find((project) => project.id === projectId);

const server = http.createServer((request, response) => {
  if (!request.url) {
    sendJson(response, 400, { message: "Missing request URL" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "http://127.0.0.1:3001",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
    });
    response.end();
    return;
  }

  const url = new URL(request.url, "http://127.0.0.1:4010");
  const path = url.pathname;

  if (path === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (path === "/projects") {
    sendJson(response, 200, projects);
    return;
  }

  if (path.startsWith("/projects/")) {
    const projectId = Number(path.split("/")[2]);
    const project = findProject(projectId);
    sendJson(
      response,
      project ? 200 : 404,
      project || { message: "Project not found" },
    );
    return;
  }

  if (path === "/tasks") {
    const projectId = url.searchParams.get("projectId");
    sendJson(
      response,
      200,
      projectId ? filterTasksByProject(Number(projectId)) : tasks,
    );
    return;
  }

  if (path === "/conversations") {
    sendJson(response, 200, conversations);
    return;
  }

  if (path === "/teams") {
    sendJson(response, 200, teams);
    return;
  }

  if (path === "/users") {
    sendJson(response, 200, users);
    return;
  }

  if (path === "/search") {
    const query = url.searchParams.get("query")?.toLowerCase() || "";
    const includes = (value) => String(value || "").toLowerCase().includes(query);

    sendJson(response, 200, {
      tasks: tasks.filter(
        (task) =>
          includes(task.title) ||
          includes(task.description) ||
          includes(task.tags),
      ),
      projects: projects.filter(
        (project) =>
          includes(project.name) || includes(project.description),
      ),
      users: users.filter(
        (user) => includes(user.username) || includes(user.email),
      ),
    });
    return;
  }

  sendJson(response, 404, { message: "Mock route not found" });
});

server.listen(4010, "127.0.0.1", () => {
  console.log("Mock API listening on http://127.0.0.1:4010");
});
