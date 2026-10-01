---
doc: spec
status: approved
---

# agentlog — Technical Spec

## How This Works, In Plain Language

agentlog is one web page made of three plain files: `index.html` (the page skeleton), `styles.css` (the bench-tool look), and `app.js` (all behavior). Opening the page loads your records from the browser's built-in storage (localStorage — a small key-value store every browser ships). When you hit "Log it", `app.js` adds the record to the list on screen and saves the whole list back to storage. The insights strip is just a function that reads the list and counts. Export builds a Markdown string in memory and hands it to the browser as a file download plus a clipboard copy. No server, no build step, no packages — that's why it can never break from a dependency, and why a judge can open it by double-clicking one file.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. User opens `index.html` → `app.js` runs `load()` → reads `agentlog.records` from localStorage → renders insights strip + log list (or the empty state).
2. User fills the form and hits **Log it** → submit handler validates `ask`/`lesson` → builds a record object `{id, ts, ask, agent, outcome, lesson, tags}` → unshifts it into the in-memory list → `save()` writes the list to localStorage → `render()` repaints insights + list.
3. User reloads → step 1 restores everything.
4. User picks a filter pill or types in search → `render()` re-runs with the active filter predicate.
5. User hits **Export Markdown** → `toMarkdown()` formats the full list → a Blob download starts → the same string goes to the clipboard (with fallback hint if clipboard is unavailable).

## Stack

- HTML + CSS + vanilla JavaScript (ES2020), no framework, no bundler, no runtime dependencies.
  Rationale (learner-agreed): the product is one page with local state; a framework adds install/build failure modes without proving anything. Tradeoff accepted: manual DOM updates instead of reactive rendering — fine at this size.
- Platform APIs: `localStorage`, `Blob`/`URL.createObjectURL`, `navigator.clipboard` ([MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [MDN Clipboard](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/clipboard)).
- Development/verification only (not shipped deps): Python 3 `http.server` to serve locally, Playwright headless Chromium for mechanical checks.

## Where It Runs and How Someone Tries It

Any modern browser. Either:
- double-click `index.html` (runs from `file://`), or
- `python3 -m http.server 8000` in the project folder and open `http://localhost:8000`.

No install, no keys, no network. Demo recording: serve locally, record the browser at 1280×720 doing the Core Journey. Deployment: none (optional per rules; skipped).

## Look and Feel

Implements `prd.md > Look and Feel`. Palette: background `#0d1117`, surface `#161b22`, text `#e6edf3`, muted `#8b949e`, accent shipped `#3fb950`, partial `#d29922`, failed `#f85149`, links/highlights `#58a6ff`. Typography: system sans for UI labels, monospace (`ui-monospace, SFMono-Regular, Menlo, Consolas`) for record content and stats. Single-column max-width 860px, dense but calm. No gradients, no shadows-as-decoration, no emoji in UI copy. Vanilla CSS honors all of this.

## Components

### Store
`load()` / `save()` around localStorage key `agentlog.records` (JSON array). Corrupt or missing data → treated as empty list.
PRD ref: `prd.md > States and Boundaries`.

### RecordForm
The always-visible form. Validates required fields, builds the record, calls Store, resets itself, manages the agent-name datalist from past entries.
PRD ref: `prd.md > Logging a record`.

### Insights
`computeInsights(records)` → `{total, shipped, partial, failed, topFailureTag}` where `topFailureTag` is the most frequent tag across records with outcome `failed` (null when no failures). Rendered live on every change.
PRD ref: `prd.md > Insights strip (the kernel)`.

### LogList
Renders filtered records newest-first as cards; owns the filter state (outcome pill + search text) and the "No records match" state.
PRD ref: `prd.md > The log`, `prd.md > Filter and search`.

### Exporter
`toMarkdown(records)` → Markdown string; triggers Blob download of `agentlog-export.md` and clipboard copy with graceful fallback hint.
PRD ref: `prd.md > Export to Markdown`.

## Data Model

One collection, stored whole:

```json
[{ "id": "rk_1730000000000_ab12",
   "ts": 1730000000000,
   "ask": "Refactor the router into smaller files",
   "agent": "Kimi Code",
   "outcome": "partial",
   "lesson": "Agent lost track of the old imports; ask for a plan first",
   "tags": ["refactor", "imports"] }]
```

Updates: full-list write on every add (list is tiny; PoC-simple). Leaving and returning: `load()` restores the list on page open.

## File Structure

```
agentlog/
├── index.html        # page skeleton: insights strip, form, filters, log list
├── styles.css        # bench-tool look and feel
├── app.js            # Store, RecordForm, Insights, LogList, Exporter
├── README.md         # what it is, how to run, how it's built
├── LICENSE           # MIT
├── .gitignore        # keeps learner profile + env files out of commits
├── skills-lock.json  # Devpost Learn Skill Pack install record
├── .agents/ agent/ .claude/   # installed skill pack (challengepost/learn-ai-basics)
└── devpost/          # planning workspace: scope.md, prd.md, spec.md, checklist.md, app-map.html
```

## External Services and Dependencies

None. No APIs, no databases, no hosting, no keys, no cost.

## Important Failure Modes

- **localStorage unavailable or corrupt** (private mode, cleared data, hand-edited JSON) → app starts with an empty log and keeps working in memory; a save failure shows a small notice instead of crashing.
- **Clipboard write rejected** (`file://` or permission denial) → download still fires; hint reads "downloaded" rather than "copied".
- **Invalid stored shape** (not an array, records missing fields) → `load()` filters to well-formed records only.

## What Was Simplified and Why

- **Full-list JSON write** instead of incremental storage — the log is dozens of records, not thousands; the fuller version would need an append store or IndexedDB for no visible benefit.
- **Client-computed insights** instead of a stats module/worker — arithmetic over a small array is instant; a separate pipeline would be ceremony.
- **Download + clipboard export** instead of Web Share / file-system handles — widest browser support; the fancier APIs add permission prompts for the same result.

## Decisions and Open Issues

- **No framework (learner choice)** — one local page doesn't earn one; accepted tradeoff is manual DOM rendering.
- **localStorage (learner choice)** — zero-setup persistence; accepted tradeoff is browser-bound data, mitigated by Markdown export.
- **Genuine uncertainty discussed:** whether `localStorage` and clipboard behave the same from `file://` as from `http://localhost` in Chromium. Agreed small investigation: the build's first slice is verified on *both* origins in headless Chromium; if `file://` storage misbehaves, the README will lead with the `http.server` instruction. Evidence lands in the slice-1 verification.
- No open issues carried from `prd.md > Open Questions`.
