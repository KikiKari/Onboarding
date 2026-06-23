import { describe, expect, it } from "vitest";
import { projectBySlug, projects } from "../content";

describe("project content", () => {
  it("contains nine unique project pages", () => {
    expect(projects).toHaveLength(9);
    expect(new Set(projects.map(({ slug }) => slug)).size).toBe(9);
  });

  it("resolves every project slug", () => {
    for (const project of projects) expect(projectBySlug.get(project.slug)).toBe(project);
  });
});
