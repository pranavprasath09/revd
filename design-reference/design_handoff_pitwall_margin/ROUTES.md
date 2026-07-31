# Every route

Route list taken from `src/App.tsx`. **PW** = Pit Wall, **MG** = Margin. Every route has a drawn reference in `RevD Home and Feed.dc.html` — use the route strip above frame 1b (Pit Wall) or 1c (Margin) to find it.

The recipes below the table describe intent and any detail the drawing does not make obvious. Where drawing and prose disagree, **the drawing wins.**

| Route | Page component | Format |
| --- | --- | --- |
| `/` | HomePage | PW |
| `/feed` | FeedPage | PW |
| `/garage` | GaragePage | PW |
| `/builds` | BuildsPage | PW |
| `/builds/:id` | BuildLogDetailPage | PW |
| `/builds/create` | CreateBuildLogPage | PW |
| `/cars` | CarsPage | PW |
| `/cars/:make/:model` | CarDetailPage | PW |
| `/compare` | ComparePage | PW |
| `/reliability` | ReliabilityPage | PW |
| `/reliability/:make` | ReliabilityDetailPage | PW |
| `/mods` | ModsPage | PW |
| `/mods/:make/:model` | ModGuidePage | PW |
| `/premium` | PremiumPage | PW |
| `/news` | NewsPage | MG |
| `/news/:slug` | ArticlePage | MG |
| `/communities` | CommunitiesPage | MG |
| `/communities/:slug` | CommunityDetailPage | MG + PW thread |
| `/communities/:slug/post/:postId` | PostDetailPage | MG + PW thread |
| `/photos` | PhotosPage | MG |
| `/photos/:id` | AlbumPage | MG |
| `/meets` | MeetsPage | MG |
| `/meets/:id` | MeetDetailPage | MG |
| `/meets/create` | CreateMeetPage | PW |
| `/profile/:username` | ProfilePage | MG |
| `/sign-in` | SignInPage | MG |
| `*` | NotFoundPage | PW |

**The deciding question for anything not listed:** does the user read a number off this screen to make a choice? Pit Wall. Do they browse, read, or share it? Margin. Forms are always Pit Wall.

---

## Pit Wall recipes

### `/cars` — CarsPage
The Home timing sheet, promoted to a full page and given real controls. Page header `CARS` with the count in the right-hand stat cluster. Filter bar gains a second row: make (chips), drivetrain (chips), and a power range. Same eight-column sheet, now paginated or virtualised at 39+ rows. Add a **compare checkbox** as a new first column — checking rows accumulates a fixed bottom tray, mono, showing selected car names and a `Compare N →` primary button routing to `/compare`. Cap at 4.

### `/cars/:make/:model` — CarDetailPage
1. Letterbox marquee, generation code as the headline, exactly as Home.
2. Telemetry strip repurposed as the headline spec row: Power, Torque, 0–100, Top speed, Mass, Power-to-weight.
3. A two-column body, `1fr 380px`. Left: engine variants as a timing sheet (`code, displacement, configuration, power, torque, years`); then a reliability block — the 56×3 bar pattern at larger scale per subsystem with the data-driven color; then common faults as hairline rows with a mono frequency column.
4. Right rail: a bordered fact panel (label/value pairs, mono), tag chips, and secondary buttons — `Add to garage`, `Compare`, `Mod guides`.
5. Bottom: `Related cars` as a compact 4-column sheet, not cards.

### `/compare` — ComparePage
The purest Pit Wall page. **Transpose the sheet**: specs become rows, cars become columns. Sticky first column holds spec labels in mono 9px `0.2em` uppercase secondary; each car column is headed by a 46×28 thumbnail, name in sans 14px/600 and generation in mono accent. Row height 44px, hairline separators, `1fr` per car up to 4.

The one addition: **highlight the winning cell per row in accent** (lowest for 0–100 and mass, highest for everything else) and dim the rest to secondary. Empty state is a mono instruction plus a car picker.

### `/reliability` + `/reliability/:make`
Index is a sheet sorted by score descending: `pos, make, model, gen, score bar, common faults count, reports`. The bar column is wider here — 96px — because it is the subject. Detail page is a page header with the make, a stat cluster (average score, reports, worst subsystem), then one expandable row per model using the garage bay pattern: expanding reveals subsystem scores and a fault ledger with a mono `frequency` column and a cost estimate total row.

### `/mods` + `/mods/:make/:model`
Index: sheet of guides — `pos, guide title, car, gen, difficulty, est. cost, gain`. Difficulty is a five-segment mono bar (`▪▪▪▫▫`), not stars. Detail: page header with the car, then numbered steps as hairline rows — step number in mono accent, title in sans 17px/600, body in sans 14px/1.6 secondary — with a right rail holding a parts ledger that totals in accent, exactly like a garage bay.

### `/builds/:id` — BuildLogDetailPage
Page header with the build title, owner and car; stat cluster showing entries, spend, likes. Then the **full mod ledger** from the garage bay pattern, unwrapped and always open, with the accent total row. Below it, entries in reverse-chronological hairline rows: mono timestamp, sans 16px/600 title, secondary body, and a small image strip. Like button in the header.

### `/premium` — PremiumPage
Resist the pricing-card instinct. Two columns as a **spec-sheet comparison**: features as rows, Free and Pro as columns, hairline separators, `✓` in accent and `—` in muted. Pro column header carries the price in mono 46px/700. One primary button under the Pro column. Feature groups get mono `0.2em` uppercase section labels on an accent top border.

### Forms — `/builds/create`, `/meets/create`
Pit Wall for all of them. Label above input, mono 9px `0.24em` uppercase secondary. Input: transparent bg, 1px `--color-border-alpha`, **no radius**, `10px 12px`, sans 14px primary; focus moves the border to accent with no glow or ring. Two-column grid where fields are short. Errors are signal-red mono 10px beneath the field, and the field border goes signal-red. Submit is a primary button; cancel is a plain mono word.

### `*` — NotFoundPage
A page header where the kicker reads `Error` and the mono display line reads `404`, with a one-line secondary explanation and two mono links. Nothing else.

---

## Margin recipes

### `/news/:slug` — ArticlePage
Masthead, then a three-column measure: `220px 1fr 220px`, content column capped near 680px.
- Kicker row, then Instrument Serif 62px headline `line-height: 1.02`, then a sans 19px/1.6 standfirst in secondary, then a mono byline/date rule.
- A full-measure lead image with an Instrument Serif italic 13px caption.
- Body in **sans 17px/1.75** (not serif — serif is for display here), paragraphs separated by margin not indent, `text-wrap: pretty`.
- Pull quotes break into the left margin: Instrument Serif italic 30px, no border, no background.
- Left margin holds the mono section label and a running read time; right margin holds related links as mono words.
- Close with `More from RevD` as three Margin cards.

### `/photos/:id` — AlbumPage
Masthead, then album title in Instrument Serif 62px with a mono meta line (photographer, plate count, location, date) and an italic description. Then the **irregular plate grid** from `/photos`, with the same lightbox. Add keyboard `←`/`→` paging inside the lightbox. A bordered photographer block at the bottom mirroring the featured-photographer layout at reduced scale.

### `/meets` — MeetsPage
Margin, structured as a **calendar of dispatches**. Group by month: month name in Instrument Serif 46px on a 1px accent top border. Within a month, each meet is `108px 1fr 208px`:
- Left: the date as Instrument Serif 40px numeral over a mono 9px `0.2em` uppercase weekday.
- Middle: Instrument Serif 30px title, italic 15px location line, mono 10px meta (time, attendee count, capacity).
- Right: 4:3 image, and beneath it the RSVP toggle.
A map view is a later addition; the list is the design.

### `/meets/:id` — MeetDetailPage
Masthead, then a `1fr 1fr` opening spread: left holds date/time/location as a serif block plus an italic description; right holds a full-bleed image. Then a folio band of four stats (attending, capacity, spots left, hosted by). Then attendees as an index — mono number, Instrument Serif 25px name, mono car, with the hover underline wipe. Primary RSVP action pinned in the opening spread, and again at the bottom.

### `/profile/:username` — ProfilePage
Treat a member as a contributor page. Masthead, then a `1fr 1fr` opening spread: left is Instrument Serif 62px display name, mono 10px stats line (followers, albums, builds, joined), an italic bio pull quote and a follow button; right is their best photograph, full-bleed with an italic caption.

Then a folio stat band, then their garage as **the index pattern** — mono number, Instrument Serif 25px car name, mono generation and power, hover-swapping a sticky plate of that car on the right. Then recent albums as a small irregular plate grid, and build logs as mono-metadata editorial rows.

### `/communities/:slug` — CommunityDetailPage
Hybrid. Margin masthead and header: department number in mono, Instrument Serif 62px name, italic description, mono member count, join toggle. Then **switch to Pit Wall for the post list**: hairline rows of `vote cluster · title (sans 16px/600) · author (mono) · replies (mono) · timestamp (mono)`, sortable by votes, replies or recency. Posts are data; the room is editorial.

### `/communities/:slug/post/:postId` — PostDetailPage
Margin masthead, mono breadcrumb, Instrument Serif 44px title, mono byline rule, body in sans 17px/1.75, with the Pit Wall vote cluster beside the title. Then a Pit Wall thread: hairline rows, mono timestamps, vote cluster per comment, indentation by depth (24px per level) with a 1px left rule instead of nested cards. Reply box uses Pit Wall form styling.

### `/sign-in` — SignInPage
Margin, and use the format's confidence. Full-height `1fr 1fr`: right side is a single full-bleed photograph with an Instrument Serif italic caption; left side is centred at max 400px — the wordmark at masthead scale, an Instrument Serif 44px line (`The home base for car culture.`), then Pit Wall-styled fields (a form is a form) and a primary button. Provider buttons are secondary. Toggle to sign-up is a mono word link.
