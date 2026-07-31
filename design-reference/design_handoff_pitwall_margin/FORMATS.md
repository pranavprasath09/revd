# The two formats

Everything here is measured off `RevD Home and Feed.dc.html`. Where a value is given as a token, use the CSS variable — never the literal hex. The literals in this document are the amber default and exist so you can verify your work.

---

## Shared foundation

Both formats read the same variables, already emitted by `src/lib/themes.ts` into `src/index.css`. There are **13 palettes — 7 dark, 6 light** (verified against `themes.ts`), all switchable per frame in the prototype:

| Variable | Amber default | Role |
| --- | --- | --- |
| `--color-bg-base` | `#0A0B0D` | Page |
| `--color-bg-surface` | `#111214` | Expanded rows, panels |
| `--color-bg-elevated` | `#1A1B1E` | Row hover, empty track of bars |
| `--color-text-primary` | `#E8E8ED` | Body and headings |
| `--color-text-secondary` | `#6B6F76` | Labels, meta, secondary numbers |
| `--color-text-muted` | `#3D4047` | Row numbers, disabled nav |
| `--color-border-alpha` | `rgba(255,255,255,0.08)` | Structural rules |
| `--color-accent` | `#F5A623` | Sole accent |
| `--color-accent-dim` | `rgba(245,166,35,0.12)` | Accent fills |
| `--color-signal-green` | `#00D4AA` | Good reliability, live |
| `--color-signal-red` | `#FF4757` | Poor reliability, downvote |

Two extra rules, used constantly, that are not currently tokens — add them:

| New token | Value | Role |
| --- | --- | --- |
| `--color-border-hair` | `rgba(255,255,255,0.06)` | Row separators inside a table |
| `--color-border-rule` | `rgba(255,255,255,0.12)` | Section rules under a heading |

**Reliability color is data-driven, in both formats:** `>= 80` green, `65–79` accent, `< 65` red.

**Type families**

| Family | Used for |
| --- | --- |
| Instrument Sans | Pit Wall body and row titles |
| JetBrains Mono | All labels, all numbers, all nav in Pit Wall; kickers and meta in Margin |
| Instrument Serif | Margin headlines, names, captions, pull quotes. **New — must be added.** |

**Motion** — 100–150ms on state changes (hover, active, fill), 200–280ms on reveals (underline wipe, lightbox), 400ms on image crossfade. Nothing slower. Easing is `ease` except the index underline, which is `cubic-bezier(0.16,1,0.3,1)`.

**Ambient animation** — three loops, all subtle, all optional but characterful:
- `scan` — a 1px accent line sweeping top to bottom over a marquee image, 6s linear infinite, fading in at 5% and out at 95%, peak opacity 0.4.
- `pulse` — opacity 0.35 → 1 → 0.35, 2s ease-in-out infinite. On live dots and the wordmark square.
- `sweep` — a 1px accent line, 25% of container width, translating `-100%` → `400%` across the telemetry strip, 4s linear infinite.

---

## Format A — Pit Wall

> The rule: if a number on the screen changes a decision, it is monospace, it is right-weighted, and it sits on a hairline. No cards, no radius, no drop shadows, no gradients except a single directional scrim over a photograph.

### Shell

| Element | Spec |
| --- | --- |
| Sidebar | `196px` fixed, right border `--color-border-alpha` |
| Sidebar header | `56px` tall, `0 16px`, bottom border. 7px accent square with `pulse`, then `REVD` in mono 13px/700, `letter-spacing: 0.22em`, uppercase |
| Nav section label | mono 9px, `0.24em`, uppercase, muted. Layout is `[number] — [1px rule, flex:1] — [label]`, `0 16px 8px` |
| Nav item | `30px` tall, `0 16px`, mono 11px, `0.08em`, uppercase, secondary. Icon 13px, muted. Active: elevated bg, primary text, accent icon, 2px full-height accent rail on the left edge |
| Nav item hover | text to primary only |
| Sidebar footer | top border, `12px 16px`. Theme swatches are 18px squares with an 8px accent square in the bottom-right corner; hover moves the border to accent |
| Content padding | `0 44px` horizontally, everywhere |

Nav sections and order are unchanged from `Sidebar.tsx`: Workspace `01`, Explore `02`, Community `03`, Account `04`.

### Telemetry strip

Sits directly under the sidebar header line, spanning the content column. `56px` tall, bottom border, `overflow: hidden`, with the `sweep` line on its top edge.

Each cell: `min-width: 132px`, `0 22px`, right border, two stacked lines — label in mono 9px `0.22em` uppercase secondary, value in mono 15px/600 primary. Right end of the strip holds a 6px green dot with `pulse` and the word `Live` in mono 10px `0.18em`.

Cells on Home: Session (a live clock), Cars on file, Meets / 7d, Builds active, Following.

### Letterbox marquee

The replacement for the full-bleed hero. `268px` tall, bottom border, `position: relative`.

- Image `object-fit: cover`, `object-position: 50% 42%`, `filter: grayscale(0.35) contrast(1.05)`.
- Scrim: horizontal, so type sits on the left over solid color. **All three stops derive from the theme base**, which is what makes it work on light palettes as well as dark:

  ```css
  background: linear-gradient(90deg,
    var(--color-bg-base) 0%,
    var(--color-scrim-mid) 45%,
    var(--color-scrim-end) 100%);
  ```

  Add two derived tokens in `themes.ts` alongside the others: `--color-scrim-mid` = `bgBase` at 55% alpha, `--color-scrim-end` = `bgBase` at 10% alpha. Convert the hex to `rgba()` when emitting them (or use `color-mix(in srgb, var(--color-bg-base) 55%, transparent)` if you would rather do it in CSS). **Never hardcode a dark literal here** — a fixed `rgba(10,11,13,…)` mid-stop puts a dark band across a light theme and destroys the contrast of the overlaid type, which is theme-aware and dark on those palettes.
- The `scan` line across the full width.
- Content, `0 44px`, vertically centred:
  - Kicker row — mono 10px `0.24em` uppercase accent, then a 46px 1px accent rule, then years and engine code in secondary.
  - **The generation code as the headline**: mono 96px/700, `line-height: 0.86`, `letter-spacing: -0.04em`. Beside it, baseline-aligned, the full car name in sans 30px/700 `-0.025em` secondary. `A80` reads bigger than `Toyota Supra` — that inversion is the whole idea.
  - A 40px-gap row of four stats, each label mono 9px `0.22em` uppercase secondary over value mono 18px/600.

### Filter bar

`18px 44px`, bottom border. Label `Filter` in mono 9px `0.24em` uppercase muted, then 6px-gap chips, then a right-aligned count in mono 10px `0.14em` uppercase reading `N entries · sorted by [key]`.

Chip: 1px `rgba(255,255,255,0.14)` border, transparent bg, secondary text, mono 10px `0.14em` uppercase, `6px 12px`, **no radius**. Hover moves border to accent. Active is a solid accent fill with base-colored text.

### The timing sheet

The signature component. Everything tabular in Pit Wall is a variant of this.

- Both header and body rows use the **same** `grid-template-columns`, so columns cannot drift.
- Home's sheet: `44px 1fr 88px 96px 92px 92px 88px 118px` → Pos, Car, Gen, Power, 0–100, Mass, Drive, Reliability.
- Header row: `34px` tall, **bottom border 1px accent**, mono 9px `0.2em` uppercase secondary. Sortable headers get `cursor: pointer` and turn accent on hover; the active one appends ` ↓` or ` ↑`.
- Body row: `44px` tall, bottom border `--color-border-hair`. Hover fills the row with elevated bg and turns the position number accent.
- Position: mono 11px muted, zero-padded (`01`).
- Car cell: a 46×28 thumbnail at `grayscale(0.4)`, the name in sans 14px/600 `-0.015em` with ellipsis overflow, then years in mono 10px muted.
- Generation: mono 12px/600 **accent** — the one colored value in the row.
- Numbers: mono 13px primary; de-emphasised numbers (mass) in secondary.
- Reliability: a 56×3px bar on elevated track, filled to `score%` in the data-driven color, then the score in mono 11px secondary.

### Expandable row (garage bay)

For rows that open. Row is taller — `min-height: 74px` — and gets three stacked lines in the title cell: nickname in mono 10px `0.18em` uppercase accent, title in sans 17px/600, spec line in mono 10px secondary. Far right holds a `+`/`−` caret in mono 13px accent.

Expanded panel: surface bg, `26px 44px 30px`, bottom border. Contains a `Notes` label + prose line, then a nested ledger table using the same header/body grid discipline (`40px 268px 1fr 108px 108px`, 28px header, 36px rows, `rgba(255,255,255,0.05)` separators) and closing with a **total row**: 40px tall, top border 1px accent, label in mono 9px `0.2em` uppercase secondary, figure in mono 15px/600 accent, both right-aligned in the last two columns.

### Page header

`34px 44px 22px`. Kicker in mono 9px `0.24em` uppercase accent, then the page name as **mono 46px/700 `-0.035em` uppercase** — the mono display face is what makes Pit Wall pages feel like instruments rather than documents. Optional supporting line in sans 14px/1.6 secondary, max 560px.

The right side of a page header holds either a bordered stat cluster (cells of `12px 22px` with left borders, label over value) or a single primary action.

### Buttons

No radius, ever. Mono 10px `0.18em` uppercase.
- **Primary** — accent bg, base text, `11px 20px`.
- **Secondary** — 1px accent border, transparent bg, accent text, `9px 18px`.
- **Quiet/toggle** — 1px `--color-border-alpha`, transparent, secondary text; when on, inverts to accent fill with base text.
- **Vote cluster** — a bordered group with `▲`/`▼` in mono 11px and the score in mono 12px/600 between them, `min-width: 24px` so it does not jump. Active arrow takes accent (up) or signal-red (down).

---

## Format B — Margin

> The rule: if the page is something a person browses, reads, or sends to a friend, it gets a masthead, a serif, and air. Numbers become mono captions in the margin, not the subject.

### Masthead

Replaces the sidebar entirely. Bottom border.

- Row one, `20px 56px 14px`, three-part space-between: issue line (`No. 041 · Jul 2026`) in mono 10px `0.2em` uppercase muted; centred wordmark in **Instrument Serif 40px, `letter-spacing: 0.16em`, uppercase**, `Rev` in primary and `d` in accent; theme dots on the right — 13px circles filled with each palette's accent, `scale(1.35)` on hover.
- Row two, `0 56px 14px`, centred, 28px gap: nav words in mono 10px `0.2em` uppercase. Current page is accent; available pages secondary; unbuilt pages muted. Hover underlines with 4px offset.
- Content padding: `48px 56px 72px`.

### Opening spread (home)

A 1fr / 1fr split, bottom border.

- Left, `68px 56px 60px`, vertically centred: kicker in mono 9px `0.28em` uppercase accent; headline in **Instrument Serif 76px, `line-height: 0.96`, `-0.02em`, weight 400** with one italic accent word inside it; standfirst in sans 16px/1.65 secondary, max 460px, `text-wrap: pretty`; then two links in mono 11px `0.2em` uppercase, the primary one with a 1px accent bottom border and 4px padding.
- Right, `min-height: 460px`, full-bleed photograph with a bottom scrim carrying a caption in **Instrument Serif italic 15px** at 78% white.

  **This one scrim is deliberately not themed:** `linear-gradient(to top, rgba(10,11,13,0.92), transparent)` with white text. It sits over a full-bleed photograph, never over page background, so a fixed dark scrim with light type is correct and legible on every palette — unlike the Pit Wall marquee scrim, which does meet the page background and must derive from `--color-bg-base`. Same treatment on the meet detail, profile and sign-in photographs.

### Folio stats

A four-column band with left borders, `34px 32px` cells. Figure in Instrument Serif 46px accent, baseline-aligned beside a label in mono 9px `0.2em` uppercase muted, `max-width: 88px`, `line-height: 1.5` so it wraps to two lines. The serif numeral beside a cramped mono label is the point.

### The index

Margin's answer to a card grid, and the best thing in the format. Layout is `1fr 452px`.

Left column, `48px 0 64px 56px`:
- Heading row: `Instrument Serif 34px` + a flex 1px rule + a right-hand note in mono 9px `0.2em` uppercase muted.
- Rows: grid `46px 1fr 74px 116px 74px`, `13px 0`, bottom border `--color-border-hair`, `align-items: baseline`. Number in mono 10px muted; **name in Instrument Serif 25px**; generation in mono 11px accent; years in mono 10px muted; power in mono 11px secondary, right-aligned.
- On hover: the name turns accent, and a 1px accent underline wipes in from the left over 280ms `cubic-bezier(0.16,1,0.3,1)` via `transform: scaleX(0 → 1)` with `transform-origin: left`. Do not animate width.

Right column, `48px 56px 64px 40px`, `position: sticky; top: 0`:
- A single bordered plate — 4:3 image, then `20px 22px 22px` of caption: `Plate NN` in mono 9px `0.24em` uppercase accent, name in Instrument Serif 28px, caption in Instrument Serif italic 15px secondary, then a 2×2 spec grid (mono 9px labels over mono 14px values) above a top border.
- Below it, a hint in mono 9px `0.14em` uppercase muted.
- Hovering any index row swaps the plate with a 400ms fade. Swap the `src` on a retained element and restart the animation; do not remount, and give the element a real initial `src` so the first paint is not empty.

### Editorial feed (dispatches)

Three columns, `200px 1fr 200px`, 44px gap — the outer two are deliberately near-empty margins holding mono metadata. Center column: Instrument Serif 62px title, italic 19px standfirst, then entries on a 1px accent top border.

Entry: `1fr 208px`, 32px gap, `30px 0`, bottom border. Left is kicker row (mono 9px `0.2em` accent, 30px rule, timestamp muted) → Instrument Serif 32px headline → italic 15px byline → action row. Right is a 4:3 image with an Instrument Serif italic 12px caption beneath.

### Front of book (news)

- Header: bottom border **1px accent**, page name in Instrument Serif 66px beside right-aligned category words. Category word: mono 10px `0.16em` uppercase, `border-bottom: 1px solid transparent`, 3px padding; active turns text and border accent; hover turns text accent.
- Lead story: `1fr 1fr`, 44px gap, `40px 0`. Left is kicker row → Instrument Serif 50px `line-height: 1.04` → sans 16px/1.65 standfirst → mono source line. Right is a 3:2 image with an italic caption.
- Then a three-column well, `column-gap: 40px`: 3:2 image, kicker row, Instrument Serif 27px headline, italic 14px source. Bottom border per item.
- Pagination is centred words and a serif numeral, not buttons.

### Department list (communities)

`1fr 380px`, 56px gap.

Rows are grid `52px 1fr 132px 128px`, `24px 0`, bottom border, `align-items: start`. Number in mono 10px muted with 10px top padding to sit on the serif baseline; name in **Instrument Serif 30px** (accent on row hover) with an optional `Pro` chip beside it (mono 9px `0.18em` uppercase accent in a 1px accent border, `2px 6px`); description in Instrument Serif italic 15px/1.5 secondary; slug in mono 10px muted; member count in mono 12px secondary; join toggle right-aligned.

**Emoji icons are removed** and replaced by the department number. That single substitution is most of what stops the page reading as generic.

Sidebar: left border, 36px left padding. A pull quote in **Instrument Serif italic 30px, `line-height: 1.22`** with real typographic quotes, its attribution in mono 10px, then a joined count in serif 22px above a full-width secondary button.

### Plates (photos)

- Featured photographer block: `1fr 1fr`, 48px gap, bottom border 1px accent, `44px` bottom padding. Left is kicker → Instrument Serif 62px name → mono 10px stats line → **Instrument Serif italic 19px pull quote in primary** → underlined mono link. Right is a `2fr 1fr` mosaic with 10px gaps, the narrow column split into two rows.
- Section heading: Instrument Serif 34px + flex rule + mono note (`Click to enlarge`).
- The grid: **6 columns, `22px 24px` gaps, deliberately irregular.** Each plate declares its own `grid-column` span and its own `aspect-ratio`. The working rhythm in the prototype: `span 3` at 3/2 twice, then three `span 2` at 4/5, then `span 4` at 16/9, `span 2` at 1/1, and a `span 6` at 21/9 to close. Never a uniform grid — the varying shapes are the design.
- Caption under each: mono 9px accent number, Instrument Serif 19px title (accent on hover), then italic 13px byline. Image drops to `opacity: 0.75` on hover.
- Lightbox: absolutely positioned over the frame, `rgba(6,6,8,0.94)`, 200ms fade in, image `max-height: 660px` `object-fit: contain`, caption row beneath (mono accent plate number, serif 28px title, serif italic byline), then a mono close hint. Click anywhere closes. In the real app also close on Escape and trap focus.

---

## The hybrid exception

**Post detail** (`/communities/:slug/post/:postId`) is the only route that needs both. Use a Margin masthead, an Instrument Serif headline and a serif body for the post itself, then switch to a Pit Wall thread below it: hairline-separated rows, mono timestamps, the Pit Wall vote cluster, indentation by depth rather than nested cards. Votes and reply counts are data and should look like data.
