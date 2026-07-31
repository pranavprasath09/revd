# Setup — laptop, repo, Claude Code

Written for macOS. If you are on Windows, the only differences are the terminal and the install command.

---

## 1. Get the repo onto your laptop

Skip to step 2 if you already have it cloned.

Open Terminal and check whether git is there:

```bash
git --version
```

If it prompts you to install developer tools, accept and wait for it to finish.

Then clone your repo — replace the URL with yours if the account name is different:

```bash
cd ~
mkdir -p code && cd code
git clone https://github.com/pranavprasath09/revd.git
cd revd
```

If it asks for a password, GitHub no longer accepts account passwords over HTTPS. Two options:
- Easiest: install the GitHub CLI (`brew install gh`), run `gh auth login`, pick GitHub.com → HTTPS → login with a browser. Then the clone works.
- Or create a personal access token at github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens, give it read/write on the `revd` repo, and paste it as the password.

Then install and confirm the app runs before changing anything:

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). If the app loads, you have a working baseline. Stop the server with `Ctrl+C`.

Note: the app talks to Supabase, so it needs `.env` with the Supabase URL and anon key. If those are missing, copy them out of the Vercel project → Settings → Environment Variables into a local `.env` file.

---

## 2. Put this handoff into the repo

Unzip the bundle you downloaded, then move the folder into the repo root:

```bash
cd ~/code/revd
mv ~/Downloads/design_handoff_pitwall_margin .
git checkout -b redesign/handoff
git add design_handoff_pitwall_margin
git commit -m "docs: add Pit Wall + Margin design handoff"
git push -u origin redesign/handoff
```

The folder is documentation only — it ships no code and cannot break the build.

---

## 3. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Then start it from inside the repo — this matters, it only sees the folder you launch it in:

```bash
cd ~/code/revd
claude
```

The first run walks you through signing in. Use the same account as this conversation so it is on your existing plan.

---

## 4. First prompt

Paste this verbatim:

> Read `design_handoff_pitwall_margin/README.md`, `FORMATS.md` and `ROUTES.md`. Then open `design_handoff_pitwall_margin/RevD Home and Feed.dc.html` in a browser so you can see the reference screens — frame 1b is the Pit Wall format, frame 1c is Margin, and frame 1a is the app as it exists today, which should NOT be implemented. Each of 1b and 1c has a route strip above it to switch screens.
>
> Then do phase 1 from `IMPLEMENTATION.md` only, and stop so I can review.

Review, then say `do phase 2 and stop`. And so on through phase 8.

**Do not tell it to do all the phases at once.** Phase 2 defines the primitives that every later screen is built from; if it gets those wrong the mistake is copied into 28 screens.

---

## 5. Reviewing each phase

After each phase:

```bash
npm run dev
```

Click through the routes that phase touched. Compare against the matching screen in the prototype, side by side, in the amber theme. Then check one light theme (Clean White) and one mid palette, because that is where hardcoded colors reveal themselves.

If something is off, describe it to Claude Code in plain words and point at the reference: *"the row height on /cars is too tall — the prototype uses 44px, and the reliability bar should be 52px wide not full width."*

---

## 6. Ship it

Per phase:

```bash
npm run build          # catches type errors Vercel might miss
git checkout -b redesign/phase-3-pitwall-workspace
git add -A
git commit -m "redesign(pitwall): rebuild garage as bays with mod ledger"
git push -u origin redesign/phase-3-pitwall-workspace
```

Then on github.com the push shows a **Compare & pull request** button. Open the PR. Vercel comments on it with a preview URL within a minute or two — open that and click every route the phase touched.

When the preview looks right, **Merge pull request**. Vercel promotes `main` to production automatically, so merging is deploying. There is no separate deploy step.

If production breaks: Vercel → the project → Deployments → find the last good one → the ⋯ menu → **Promote to Production**. That is an instant rollback. Then fix forward on a branch.

---

## Two things to decide before phase 4

1. **`/news` cannot ship as-is.** `src/data/news.json` is an empty array, and the headlines in the prototype are illustrative placeholders written to show the layout — they are not real articles. Either wire `newsFetcher.ts` to a real source, or hide the route behind a flag until you do.
2. **Phase 1 deletes the `--color-accent-red` aliases.** That is deliberate — those dead aliases are why the current Home page looks like it came from a different app. Anything still referencing them will need updating in the same pass.

---

## If you get stuck

Tell Claude Code what happened, including the exact error text. It can read the repo, run the build, and see the failure itself — you do not need to diagnose it first. Paste, don't paraphrase.
