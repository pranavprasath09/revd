# Handoff: RevD — Pit Wall + Margin redesign

## Overview

RevD is being redesigned away from the generic dark-card-grid look into **two deliberate formats** that split the app by purpose:

- **Pit Wall** — a dense, hairline-ruled, monospace-numeric instrument format. Used for every route where the user reads data off the screen or makes a decision: dashboard, garage, builds, car specs, comparison, reliability, mods, pricing, forms.
- **Margin** — an editorial format: serif at print scale, asymmetric grid, photography given real room. Used for every route that is browsed, read, or shared outside the app: news, communities, photos, meets, profiles.

Both formats consume the **same theme tokens** already in `src/lib/themes.ts`, so a route can be moved between formats without touching data or state.

**Every route in the app is drawn** — 15 Pit Wall screens and 13 Margin screens, all interactive, in `RevD Home and Feed.dc.html`. The two format rulebooks are in `FORMATS.md`, the route-by-route notes in `ROUTES.md`, and an ordered build plan in `IMPLEMENTATION.md`. `SETUP.md` covers getting this onto your laptop and into the repo.

## About the design files

`RevD Home and Feed.dc.html` is a **design reference created in HTML** — a prototype demonstrating intended look and behaviour. It is **not production code to copy**. It is a single self-contained file with inline styles and a small runtime; none of that structure should survive into the app.

The task is to **recreate these designs inside the existing RevD codebase** — React 18 + TypeScript + Vite + Tailwind + React Router, using the app's established patterns: existing `src/components/ui/*` primitives, existing pages under `src/pages/`, existing hooks under `src/hooks/`, existing types under `src/types/`, and the CSS variables in `src/index.css` driven by `src/lib/themes.ts`.

Concretely: read the HTML for exact values, then express them as Tailwind utilities and `var(--color-*)` references the way the rest of the app already does. Do not introduce inline `style` attributes, a second styling system, or a component library.

## Fidelity

**High-fidelity throughout.** Every route has a drawn screen. Colors, type sizes, letter-spacing, row heights, grid column widths and hover behaviour are final and should be matched closely; exact values are in `FORMATS.md`. Read values off the HTML rather than eyeballing the screenshots.

Where a screen shows placeholder content (news headlines, forum posts, garage bays, albums), the *layout* is final and the *content* is not — see "Known blockers".

## What is already built (reference screens)

Open `RevD Home and Feed.dc.html` in a browser. It contains three frames, each 1440×920:

**Frame 1a — the current app, recreated.** Today's Home and Feed rebuilt faithfully from source, inside the real 220px sidebar. This exists only as a before/after baseline. **Do not implement this.**

Above frames 1b and 1c there is a **route strip** — one button per screen, labelled with its real route. Use it to move between screens; the app's own sidebar and masthead nav also work.

**Frame 1b — Pit Wall, 15 screens:**
| Route | Screen | What it demonstrates |
| --- | --- | --- |
| `/` | Dashboard | Telemetry strip, letterbox marquee, filter chips, sortable timing sheet |
| `/feed` | Feed | Timestamped session log with inline RSVP and vote controls |
| `/garage` | My Garage | Bays instead of cards; expand for the mod ledger and cost total |
| `/builds` | Builds | Sortable programme with entry-count bars and like toggles |
| `/builds/:id` | Build detail | Full ledger + entry stream, two-column |
| `/cars` | Cars | The sheet with tag and drivetrain filters, compare checkboxes, sticky tray |
| `/cars/:make/:model` | Car detail | Marquee + spec strip + engine sheet + subsystem bars + fault ledger + rail |
| `/compare` | Compare | Transposed sheet — specs as rows, winning cell per row in accent |
| `/reliability` | Reliability | Ranked sheet with wide score bars |
| `/reliability/:make` | Reliability detail | Expandable model rows revealing subsystems and faults |
| `/mods` | Mod guides | Sheet with five-segment difficulty bars |
| `/mods/:make/:model` | Mod guide | Numbered procedure rows + parts ledger with total |
| `/premium` | Premium | Spec-sheet pricing, not cards |
| `/builds/create` | Create form | Field styling, section rules, an error state |
| `/*` | 404 | Mono display error |

**Frame 1c — Margin, 13 screens:**
| Route | Screen | What it demonstrates |
| --- | --- | --- |
| `/` | Index | Opening spread, folio stats, index of 39 cars with sticky hover plate |
| `/feed` | Dispatches | Three-column editorial feed with marginal captions |
| `/news` | News | Lead story + three-column front of book, category words as filter |
| `/news/:slug` | Article | Three-column measure, margin metadata, pull quote breaking out |
| `/communities` | Departments | Numbered rooms, join toggles, pull-quote sidebar |
| `/communities/:slug` | Department | **Hybrid** — Margin header over a Pit Wall post table |
| `/communities/:slug/post/:postId` | Post | **Hybrid** — serif headline over a Pit Wall indented thread |
| `/photos` | Plates | Featured photographer, irregular grid, lightbox |
| `/photos/:id` | Album | Album header, plate grid, photographer footer |
| `/meets` | Meets | Month-grouped calendar of dispatches with serif date numerals |
| `/meets/:id` | Meet detail | Opening spread, folio stats, attendees as a hover index |
| `/profile/:username` | Profile | Contributor page — garage as an index, albums as plates |
| `/sign-in` | Sign in | Split-screen, full-bleed photograph, Pit Wall fields |

## Interactions demonstrated

All of these work in the prototype and are expected in the implementation:

- **Column sorting** — Pit Wall table headers toggle sort key, then direction. Arrow glyph (`↓`/`↑`) appears on the active column. Numeric keys sort descending first, except 0–100 time and mass which sort ascending first.
- **Filter chips** — Pit Wall, single-select, filters the sheet by tag and updates the entry count in the same bar.
- **Category words** — Margin's News filter, same behaviour, styled as an underlined word rather than a chip.
- **Bay expansion** — Pit Wall garage, single-open accordion. Caret switches `+`/`−`. Clicking the open bay closes it.
- **RSVP toggle** — increments the displayed count and inverts to a filled accent button.
- **Vote controls** — up/down are mutually exclusive and re-clickable to zero; score reflects the delta live.
- **Like toggle** — Builds, glyph switches `○`/`●`, count increments.
- **Join toggle** — Communities, inverts to filled accent, updates the "N of 7 joined" sidebar.
- **Index hover** — Margin's car index, meet attendees and profile garage all use it: hovering a row swaps the sticky plate image, caption and spec block, with a 400ms fade. An accent underline wipes in left-to-right over 280ms `cubic-bezier(0.16,1,0.3,1)`.
- **Compare tray** — checking a row on `/cars` adds it to a sticky bottom tray, capped at 4; the tray drives `/compare`.
- **Follow / join toggles** — profile and department headers, same invert-to-accent pattern as RSVP.
- **Lightbox** — Photos, click any plate to open a full-frame overlay, click anywhere to close.
- **Theme switching** — all 13 palettes from `src/lib/themes.ts` (7 dark, 6 light), switchable per frame. Every color in both formats resolves through a CSS variable, so this must keep working.

## State

Nothing here needs new global state. Everything is local component state or already covered by existing hooks:

| State | Scope | Existing hook |
| --- | --- | --- |
| sort key + direction | table component | — |
| active filter tag / category | page | — |
| expanded bay id | garage page | `useGarage` |
| RSVP status | meet row/card | `useMeets` |
| vote delta | post row | `useForum` |
| like status | build row | `useBuildLogs` |
| joined rooms | communities page | `useForum` |
| lightbox index | photos page | — |
| active theme | app | `useTheme` / `themes.ts` |

Optimistic UI on all toggles: update local state immediately, reconcile with the response, revert on error.

## Known blockers in the repo

1. **`src/data/news.json` is `[]`.** Home's Latest News grid and the entire `/news` route render nothing in production today. The News design in the prototype uses illustrative headlines that are **not real content** — do not ship them. Either wire `newsFetcher.ts` to a real source or ship `/news` behind a flag.
2. **`src/index.css` carries legacy aliases** — `--color-accent-red` maps to the amber accent, and `HomePage.tsx` still uses old-system classes (`font-display uppercase`, `bg-accent-red`). This is the direct cause of Home looking like a different app from the rest. Remove the aliases as part of this work; see `IMPLEMENTATION.md` step 1.
3. **Garage, builds, forum and photo content is placeholder.** The prototype's bays, build logs, departments and albums are illustrative but shaped to match `src/types/garage.ts`, `buildlog.ts`, `forum.ts` and `photo.ts`. Real data comes from Supabase.

## Assets

- **Car photography** — 24 Unsplash URLs, already in `src/data/cars.json` as `heroImage`. A trimmed copy is bundled at `cars-slim.json` for reference. No new imagery was introduced.
- **Fonts** — Instrument Sans and JetBrains Mono are already in use. **Margin adds Instrument Serif**, which must be added to the font loader; it is the whole basis of that format's identity.
- **Icons** — Lucide, already a dependency. Pit Wall uses them at 13–16px, `stroke-width: 1.5`. Margin uses almost none by design.

## Files in this bundle

| File | What it is |
| --- | --- |
| `README.md` | This document |
| `FORMATS.md` | The two format rulebooks — exact tokens, measurements, type scales, component recipes |
| `ROUTES.md` | Every route in the app, its format assignment, and its layout recipe |
| `IMPLEMENTATION.md` | Ordered build plan, plus the git and Vercel steps |
| `SETUP.md` | Getting this onto your laptop, into the repo, and in front of Claude Code |
| `RevD Home and Feed.dc.html` | The interactive prototype — open in a browser |
| `cars-slim.json` | Trimmed car data used by the prototype |
