# Pond-Hero — Final Report

**Status: COMPLETE.** Built, verified, committed, and pushed to `origin/pond-hero`.

## Push result
- Branch `pond-hero` pushed to `https://git-agent-proxy.perplexity.ai/KikiKari/Onboarding.git` (repo stays private).
- Commit: `937a942` — message exactly `feat: 3D-Teich-Hero mit interaktiven Glaskugeln + helle Projektliste`.
- Remote `refs/heads/pond-hero` = local HEAD `937a942` (verified via `git ls-remote`).
- No other branches touched. No Vercel deploy / publish_website performed.
- New branch on GitHub — PR can be opened at https://github.com/KikiKari/Onboarding/pull/new/pond-hero

## Author-email fix (one detour worth noting)
First push was rejected with `GH007: Your push would publish a private email address` because the commit used `karimkiki@gmx.de`. Amended the commit author to `KikiKari@users.noreply.github.com` (`--amend --reset-author --no-edit`, message preserved) and the push then succeeded.

## What was built
- **3D pond hero** (`components/site/pond-hero.tsx` + `components/site/pond/*`): React Three Fiber scene replacing the old `globe-hero.tsx`.
  - Water shader (2 Gerstner layers + radial splash ripple), 9 lily pads, transmissive glass orbs, particle splash, background bokeh blossoms, `Environment preset="park"`.
  - State machine: idle → rolling → splashing → emerging → distributed → focused. Master orb click opens the Projects repo; each orb maps to a project and opens its GitHub branch; a Framer Motion card overlay shows the focused project.
  - Robustness: dynamic import (`ssr:false`), WebGL detection with static `variante-C.webp` fallback, `<noscript>` fallback, reduced-motion path (starts in `distributed`), hydration-safe `mounted` guard.
- **Light project list** (`components/site/project-list.tsx`): numbered 01–09, platform badges (Claude=accent, Perplexity=teal), a connecting line with a marker orb that glides 0→100% on hover, "Öffnen →" links, decorative lotus on xl.
- **Wiring** (`app/page.tsx`): GlobeHero → PondHero (subline moved above, old CTA buttons removed); dark `#projekte` grid → light section (`bg-[var(--bg)]`) hosting `<ProjectList />`.
- **Footer** (`components/site/footer.tsx`): **mandatory Vecteezy attribution** added, links to https://www.vecteezy.com/ and https://api.vecteezy.com/free-photos/pad, styled with existing footer CSS vars.
- **content.ts**: additive `heroPond` export only — the `projects` array was NOT changed.
- **reveal.tsx**: fixed reduced-motion invisibility bug (whileInView always sets opacity:1).

## Constraints respected
- backend/ untouched; content `projects` array untouched; only additive changes; no new routes; assets reused from `public/media/pond/` (no new AI generation); legacy globe-frames not used.

## Verification
- `npm run build`: SUCCESS — 15 static pages, homepage 160 kB First Load JS (R3F code-split via dynamic import).
- Dev server on :3000 returns HTTP 200; Playwright screenshots saved in workspace:
  pond-01-hero-idle, -02-projectlist, -03-row-hover, -04-hero-v2, -05-splash, -06-distributed, -07-orb-hover, -08-mobile-hero, -09-mobile-list, -10-reduced-motion (.png).
- Lint: 0 errors, 1 intentional warning (`<img>` inside `<noscript>`).

## Lockfile / Vercel decision (open point — resolved defensively)
- `npm install` created `package-lock.json` (contains three@0.170.0 / @react-three/fiber / drei — committed).
- The repo also tracks a **stale `pnpm-lock.yaml`** that does NOT contain the new deps. pnpm 9 and 10 both refuse to regenerate it because the repo's `pnpm-workspace.yaml` has no `packages:` field (`ERROR packages field missing or empty`) — a pre-existing repo quirk, not something I introduced.
- Per Vercel docs, lockfile auto-detection checks `pnpm-lock.yaml` BEFORE `package-lock.json`, so Vercel would have run `pnpm install --frozen-lockfile` and failed the build with `ERR_PNPM_OUTDATED_LOCKFILE`.
- **Fix applied:** added `"installCommand": "npm install"` to `vercel.json` (alongside the existing `"buildCommand": "npm run build"`). `installCommand` in vercel.json overrides auto-detection, forcing npm with the correct `package-lock.json` regardless of the stale pnpm lockfile. This matches the brief's "npm install" instruction and is the minimal targeted change (no files deleted).
- **Recommendation for maintainers:** either delete the stale `pnpm-lock.yaml` (repo is effectively npm now) or fix `pnpm-workspace.yaml` (add `packages:` or remove the file) and regenerate the pnpm lock, if they want to standardize on pnpm. The `vercel.json` installCommand keeps deploys green in the meantime.
