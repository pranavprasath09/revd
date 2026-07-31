# Implementation plan

Written to be handed to Claude Code as-is. Work the phases in order — later phases assume the shared primitives from phase 2 exist.

## How to use this bundle

1. Unzip it into the repo root as `design_handoff_pitwall_margin/` and commit it on a branch. It is documentation; it ships no code.
2. Open the repo in Claude Code and start with:

   > Read `design_handoff_pitwall_margin/README.md`, `FORMATS.md` and `ROUTES.md`. Open `RevD Home and Feed.dc.html` in a browser to see the reference screens — frame 1b is Pit Wall, frame 1c is Margin, frame 1a is the current app for comparison and should not be implemented.
   >
   > Then do phase 1 from `IMPLEMENTATION.md` only, and stop so I can review.

3. Review after each phase. Do not let the whole plan run unattended — phase 2 defines the primitives every later phase depends on, and a wrong decision there propagates.

---

## Phase 1 — Clean the foundation

The current inconsistency is caused by dead CSS, so fix that before adding anything.

1. Remove the legacy aliases from `src/index.css` — `--color-accent-red` and any other old-system variable that now points at the amber accent.
2. Grep for and remove every use of them: `bg-accent-red`, `text-accent-red`, `font-display`, and the blanket `uppercase` on headings. `src/pages/HomePage.tsx` is the main offender.
3. Add the new tokens from `FORMATS.md` to `themes.ts` and `index.css` for all 13 palettes:
   - `--color-border-hair` (`rgba(255,255,255,0.06)`) and `--color-border-rule` (`rgba(255,255,255,0.12)`) — light palettes need the black equivalents, same as `borderAlpha` already does.
   - `--color-scrim-mid` and `--color-scrim-end`, derived from each palette's `bgBase` at 55% and 10% alpha. The marquee scrim depends on these; see `FORMATS.md` § "Letterbox marquee".
4. Add **Instrument Serif** to the font loader alongside Instrument Sans and JetBrains Mono. Expose it as a Tailwind family, e.g. `font-editorial`.
5. Add the three keyframes — `scan`, `pulse`, `sweep` — to the global stylesheet with the exact timings in `FORMATS.md`.
6. Verify all 13 themes still switch cleanly with no hardcoded hex anywhere in the app.

**Done when:** nothing looks different yet, `grep -r "accent-red" src/` is empty, and Instrument Serif renders.

## Phase 2 — Shared primitives

Build these once, in `src/components/pitwall/` and `src/components/margin/`. Every page below composes them; no page should hand-roll a table or a masthead.

**Pit Wall**
- `PitWallShell` — 196px sidebar, mono nav with the accent rail, theme swatch footer.
- `TelemetryStrip` — cell array in, sweep line included.
- `Marquee` — image, horizontal scrim, scan line, code-as-headline, stat row.
- `PageHeader` — kicker, mono display title, optional supporting line, optional right slot.
- `Sheet` — **the important one.** Takes a column definition (width, label, accessor, sortable, align, renderer) and rows. Owns the shared grid template, sort state, arrow glyph, hover, hairlines. Supports an `expandable` render prop for the bay pattern, and an optional `totalRow`.
- `ScoreBar` — width + data-driven color from a 0–100 score.
- `FilterBar` — label, chips, right-hand count.
- `Chip`, `Button` (primary/secondary/quiet), `VoteCluster`, `Field`.

**Margin**
- `Masthead` — issue line, serif wordmark, theme dots, nav words.
- `OpeningSpread` — text side + image side, caption scrim.
- `FolioStats` — serif numeral beside wrapped mono label, left borders.
- `IndexList` — the hover-underline-wipe rows plus the sticky plate panel, driven by a render prop for the panel contents. Retain the image element and swap `src`; never remount.
- `PlateGrid` — 6-column irregular grid taking per-item span and aspect ratio, with the lightbox (Escape to close, focus trap, `←`/`→` paging).
- `EditorialRow` — kicker rule, serif headline, italic byline, action slot, margin image with caption.
- `PullQuote`.

**Done when:** each primitive renders in isolation and matches the prototype at 1440px in the amber theme.

## Phase 3 — Rebuild the four Pit Wall workspace screens

`/`, `/feed`, `/garage`, `/builds` — these have high-fidelity references, so match them closely. Wire to the real hooks (`useGarage`, `useBuildLogs`, `useFeed`) and replace the prototype's placeholder content with Supabase data. Keep the optimistic toggles.

**Done when:** all four screens match frame 1b side by side, and sorting/filtering/expanding/liking work against real data.

## Phase 4 — Rebuild the three Margin screens

`/news`, `/communities`, `/photos`. Match frame 1c.

Two notes: the News headlines in the prototype are **illustrative and must not ship** — either wire `newsFetcher.ts` or put `/news` behind a flag; and the emoji community icons are deliberately replaced by department numbers, so remove the emoji field from the rendering path.

**Done when:** all three match frame 1c, join/lightbox/category filtering work, and `/news` either has real content or is flagged off.

## Phase 5 — The remaining Pit Wall routes

All of these have drawn references in frame 1b — use the route strip above the frame to find each one. Build in this order: `/cars` → `/cars/:make/:model` → `/compare` → `/reliability` + `/reliability/:make` → `/mods` + `/mods/:make/:model` → `/builds/:id` → `/premium` → `/builds/create` + `/meets/create` → `404`.

`/cars` first because it exercises `Sheet` hardest, and `/compare` right after because it is the transposed variant — getting both early proves the primitive. `/cars` also introduces the compare tray, which is the only piece of cross-page state in the Pit Wall set.

## Phase 6 — The remaining Margin routes

All drawn in frame 1c. Order: `/meets` → `/meets/:id` → `/news/:slug` → `/photos/:id` → `/profile/:username` → `/sign-in`, then the two hybrids `/communities/:slug` and `/communities/:slug/post/:postId` last, since they need both formats settled.

Note that `/meets/:id` and `/profile/:username` both reuse the `IndexList` primitive from the Margin home index — attendees and garage respectively. If you find yourself writing that hover-plate behaviour a third time, the primitive is wrong.

## Phase 7 — Responsive, accessibility, polish

The prototype is desktop-only at 1440px. This phase is real work, not cleanup.

- **Pit Wall tables below 1024px:** do not scroll horizontally and do not turn rows into cards. Drop to the 3–4 columns that matter (position, car, the sorted column) and move the rest into the expanded row. `/compare` is the exception — horizontal scroll with a sticky label column is correct there.
- **Sidebar:** keep the existing behaviour — 196px, collapsing to a 56px icon rail, then off-canvas behind a 48px top bar.
- **Margin below 1024px:** collapse to one column, drop the sticky plate panel (make index rows navigate instead of hover-preview), and let the plate grid fall to 2 columns while keeping the varied aspect ratios. Masthead nav becomes a scrolling mono row.
- Reduce every hero and display size roughly 40% at mobile. Nothing below 12px.
- **Hover is not the only affordance** — the index preview and plate hover both need a tap/focus equivalent.
- Sortable headers are `<button>` inside `<th>` with `aria-sort`. The expandable bay is a real disclosure with `aria-expanded`. The lightbox is a modal dialog with a focus trap and Escape. Vote clusters have accessible labels — `Upvote`, not `▲`.
- Respect `prefers-reduced-motion`: kill `scan`, `pulse` and `sweep`, keep instant state changes.
- Check accent-on-surface contrast in all 13 palettes, especially the light ones, where the accent doubles as the primary text color in Clean White.

## Phase 8 — Ship

1. Branch per phase, e.g. `redesign/phase-3-pitwall-workspace`.
2. Push and let Vercel build the preview. Check every route in the preview, in at least amber, Clean White and one mid palette.
3. `npm run build` locally too — Vercel previews can pass while a type error slips through in a route you did not visit.
4. Open a PR per phase against `main`. Small PRs; this touches every page.
5. Merge in order. Vercel promotes `main` to production automatically, so do not merge a phase you have not opened in preview.
6. Tag once phase 6 lands — that is the point where every route has a real design.

**Suggested commit style:** `redesign(pitwall): rebuild garage as bays with mod ledger`.

---

## Definition of done

- Every route in `ROUTES.md` implemented in its assigned format.
- No hardcoded hex anywhere; all 13 palettes switch correctly on every page.
- No radius, shadow or gradient in Pit Wall except the marquee scrim.
- No card grids anywhere in the app.
- `grep -r "accent-red\|font-display" src/` returns nothing.
- Keyboard-navigable: sortable headers, disclosures, lightbox, forms.
- Mobile: no horizontal scroll except `/compare`.
- `/news` has real content or is flagged off.

## Judgement calls to check with the designer

1. **Post detail is the one hybrid** — Margin masthead over a Pit Wall thread. If it reads as two designs stitched together, make the whole route Pit Wall.
2. **Meets went to Margin**, on the grounds that a meet is browsed and shared. If usage shows people scanning it for time and capacity, it becomes Pit Wall.
3. **`/premium` as a spec sheet** rather than pricing cards is a conversion risk. Worth an A/B test against a conventional layout.
