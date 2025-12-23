import { expect, test } from "playwright/test";

test.describe("workspace e2e flows", () => {
  test("loads the preview workspace dashboard with seeded data", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Project Workspace" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Launchpad", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your Tasks" })).toBeVisible();
    await expect(page.getByText("Launchpad")).toBeVisible();
    await expect(page.getByText("Design launch brief")).toBeVisible();
    await expect(page.getByText("Finalize landing page QA")).toBeVisible();
    await expect(page.locator("span", { hasText: "2" }).first()).toBeVisible();
  });

  test("searches workspace data and filters completed tasks on a project page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const navbarSearch = page.getByPlaceholder("Search projects, tasks, teams...");
    await navbarSearch.fill("launch");
    await navbarSearch.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=launch$/);
    await expect(
      page.getByRole("heading", { name: "Tasks", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Projects", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Design launch brief")).toBeVisible();
    const projectResults = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Projects", exact: true }),
      });

    await expect(
      projectResults.getByRole("link", { name: /Launchpad/i }),
    ).toBeVisible();

    await projectResults.getByRole("link", { name: /Launchpad/i }).click();

    await expect(page).toHaveURL("/projects/1");
    await expect(page.getByRole("heading", { name: "Launchpad" })).toBeVisible();
    await expect(page.getByText("Finalize landing page QA")).toBeVisible();

    await page.getByTitle("Task filters").click();
    await page.getByRole("button", { name: "Hide completed tasks" }).click();

    await expect(page.getByText("Design launch brief")).toBeVisible();
    await expect(page.getByText("Finalize landing page QA")).toHaveCount(0);

    await page.getByRole("button", { name: "Table" }).click();
    await expect(page.getByRole("heading", { name: "Table" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Title" })).toBeVisible();
  });
});
