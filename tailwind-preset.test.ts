import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, describe, expect, it } from "vitest"

/**
 * `bg-success-soft` and `text-success` working while `ring-success/30` falls
 * back to Tailwind's own default indigo is invisible to every other test
 * here: they all check which CLASS NAME a component renders, never what
 * CSS that class name compiles to. Only running the real Tailwind CLI
 * against the real preset catches a bug that lives in the config, not in
 * any component. This is slow for a unit test (it shells out); it earns
 * that cost by being the only thing that would have caught 9ab5f67's
 * predecessor before every ring-toned component shipped a blue border.
 */
describe("withAlpha opacity-modified colors", () => {
  const repoRoot = dirname(fileURLToPath(import.meta.url))
  const dir = mkdtempSync(join(tmpdir(), "ui-web-tw-preset-"))

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it("compiles an opacity-modified tone color to color-mix, not Tailwind's default indigo", () => {
    const fixture = join(dir, "fixture.html")
    writeFileSync(
      fixture,
      '<div class="ring-success/30 ring-danger/40 border-primary/30 bg-success-soft text-success">x</div>',
    )
    const config = join(dir, "tailwind.config.mjs")
    writeFileSync(
      config,
      `import preset from ${JSON.stringify(join(repoRoot, "tailwind-preset.ts"))};\n` +
        `export default { presets: [preset], content: [${JSON.stringify(fixture)}] };\n`,
    )

    const css = execFileSync(
      "npx",
      ["tailwindcss", "-c", config, "-i", "-", "--content", fixture],
      { input: "@tailwind utilities;", cwd: repoRoot, encoding: "utf-8" },
    )

    expect(css).toContain("color-mix(in srgb, var(--color-success) 30%, transparent)")
    expect(css).toContain("color-mix(in srgb, var(--color-danger) 40%, transparent)")
    expect(css).toContain("color-mix(in srgb, var(--color-primary) 30%, transparent)")
    // The regression this pins: Tailwind's built-in default ring/border color.
    expect(css).not.toMatch(/59[ ,]130[ ,]246/)

    // An unmodified color must still be the plain token, not wrapped in
    // color-mix — and specifically not with a NaN percentage: textColor and
    // backgroundColor default their opacity modifier to a CSS-variable
    // INDIRECTION rather than `undefined`, which the first version of this
    // fix did not account for and which silently produces a fully
    // transparent color that still looks legitimate in a class-name-only test.
    expect(css).not.toContain("NaN")
    expect(css).toMatch(/\.text-success\s*\{[^}]*color:\s*var\(--color-success\)/)
  })
}, 30_000)
