import { expect, test } from "playwright/test";
import { dataGridSxStyles, resolveImageUrl } from "../../client/src/lib/utils";

test.describe("client utils", () => {
  test("resolveImageUrl keeps absolute URLs and prefixes relative paths", () => {
    expect(resolveImageUrl("https://cdn.example.com/avatar.png")).toBe(
      "https://cdn.example.com/avatar.png",
    );
    expect(resolveImageUrl("avatars/user.png")).toBe("/avatars/user.png");
    expect(resolveImageUrl("/avatars/user.png")).toBe("/avatars/user.png");
  });

  test("resolveImageUrl falls back when the path is empty", () => {
    expect(resolveImageUrl(undefined)).toBe("/workspace-os-mark.svg");
    expect(resolveImageUrl("", "/fallback.png")).toBe("/fallback.png");
    expect(resolveImageUrl(null, "/fallback.png")).toBe("/fallback.png");
  });

  test("dataGridSxStyles switches palette between light and dark mode", () => {
    const lightStyles = dataGridSxStyles(false);
    const darkStyles = dataGridSxStyles(true);

    expect(lightStyles["& .MuiDataGrid-row"].borderBottom).toContain("#e6d2aa");
    expect(darkStyles["& .MuiDataGrid-row"].borderBottom).toContain("#223047");
    expect(lightStyles["& .MuiTablePagination-root"].color).toBe("");
    expect(darkStyles["& .MuiTablePagination-root"].color).toBe("#a3a3a3");
  });
});
