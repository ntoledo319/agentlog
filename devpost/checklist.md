---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Log a record and see it in the list**
  Becomes usable: A runnable page where filling the form and hitting "Log it" shows the record as a card, with the bench-tool styling in place. In-memory only.
  Why now: Proves the whole path end to end on the first slice — page, form, state, render, styling — so every later slice has somewhere to land. Also resolves the spec's open investigation: localStorage/clipboard behavior on `file://` vs `http://`.
  PRD ref: `prd.md > Logging a record`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Components` (Store, RecordForm, LogList), `spec.md > File Structure`, `spec.md > Look and Feel`
  Build: Create index.html, styles.css, app.js per spec: form with required-field hints, record cards newest-first, in-memory list, full styling pass.
  Verify (mechanical): Serve with `python3 -m http.server`; in headless Chromium fill and submit the form, assert the card renders with the right content; repeat the same check on `file://`; assert submit with empty required field adds nothing and shows a hint.
  Learner check: Open the page, log a record, and confirm it appears and looks like the bench tool pictured.
  Commit: `Add record form and live log list`

- [x] **2. Records survive a reload**
  Becomes usable: Records written before closing the tab are still there when it reopens.
  Why now: Persistence is the first place the data model can be wrong, and finding out now is cheap.
  PRD ref: `prd.md > States and Boundaries` (persistence)
  Spec ref: `spec.md > Data Model`, `spec.md > Components` (Store)
  Build: Wire Store.load/save: write on submit, load on startup, tolerate missing/corrupt data.
  Verify (mechanical): Headless Chromium: add two records, reload the page, assert both render from storage; corrupt the stored value and assert the app recovers to an empty state.
  Learner check: Add a record, reload, confirm it's still there.
  Commit: `Persist records to localStorage`

- [x] **3. Insights strip reads the log back to you (kernel)**
  Becomes usable: The top strip shows total, per-outcome counts, and the top failure tag, updating the instant a record lands.
  Why now: The unique kernel comes early, not last — this is the thing that makes agentlog not-a-diary.
  PRD ref: `prd.md > Insights strip (the kernel)`
  Spec ref: `spec.md > Components` (Insights)
  Build: computeInsights + render; outcome markers colored per Look and Feel; neutral empty message when no failures.
  Verify (mechanical): Headless Chromium: add records (2 failed sharing tag "imports", 1 shipped); assert strip reads "3 total", "1 shipped · 0 partial · 2 failed", top failure tag "imports ×2"; fresh profile asserts the neutral no-failures message.
  Learner check: Log a failed record with a tag and watch the strip name the pattern.
  Commit: `Add live insights strip with failure-pattern read-back`

- [ ] **4. Filter, search, and Markdown export**
  Becomes usable: Outcome pills and text search narrow the log; Export downloads `agentlog-export.md` and copies the same Markdown to the clipboard.
  Why now: Read-back completes the core loop — the log becomes usable outside the app.
  PRD ref: `prd.md > Filter and search`, `prd.md > Export to Markdown`
  Spec ref: `spec.md > Components` (LogList, Exporter)
  Build: Filter pills + search predicate wiring; toMarkdown(); Blob download + clipboard copy with fallback hint.
  Verify (mechanical): Headless Chromium: with 3 mixed records, select "failed" pill and assert only failures render; search a tag and assert narrowing; trigger export with a CDP download watcher and assert the downloaded file parses and contains all 3 records.
  Learner check: Filter to failures, export, open the downloaded file.
  Commit: `Add filters, search, and Markdown export`

- [ ] **5. Empty and edge states, final polish**
  Becomes usable: First-run invitation, "No records match" state, clipboard-unavailable fallback wording, agent-name datalist learning.
  Why now: Last — these guard the demo and first impressions without touching proven behavior.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > Important Failure Modes`
  Build: Empty-state rendering, no-match message, export fallback hint, datalist population from stored agent names.
  Verify (mechanical): Headless Chromium fresh profile: assert invitation line and zeroed strip; filter to a non-matching search and assert "No records match".
  Learner check: Fresh browser → confirm the empty states read well.
  Commit: `Polish empty and edge states`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1 (form + list + styling) — feedback folded into slice 3 accent contrast
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — focused alternative (experienced plan-first user): the spec's open uncertainty (file:// vs http:// storage/clipboard behavior) was investigated with real evidence during slice-1 verification
- [ ] Optional edit and transfer reflection addressed — declined; verification already hands-on
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: file:// vs http:// investigation — slice 1 verified form submit + render on both origins (http://127.0.0.1:8325 and file://); slice 2 verified localStorage round-trip on both; clipboard fallback verified on file:// (permission denied → download path + "downloaded" hint). Evidence: verification script `devpost/verify_app.py` output in session log.
Route and stops: app.js: submit handler → Store.save → render → Insights.computeInsights (2–3 stops walked during verification debugging).
Edit outcome: not applicable (declined).
Reflection: offered; declined — learner connected the investigation to their goal of scope discipline unprompted in session notes.
Activity mode: focused alternative (uncertainty investigation), per `5-build` guidance for familiar plan-first users.

## Revisions

- [Agent-name datalist moved from slice 5 polish into RecordForm during slice 1] — [the form already knew the stored records, so populating the datalist there was simpler than a separate pass; no behavior change].
