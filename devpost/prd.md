---
doc: prd
status: approved
---

# agentlog — Product Requirements

A lab notebook for AI coding-agent sessions, for a solo builder who works with agents daily.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey

1. The builder opens agentlog (a local web page) after a coding-agent session.
2. On first ever use they see an empty log with a one-line invitation ("No sessions logged yet — add your first record") and the record form.
3. They fill the form: what they asked the agent for (one line), which agent, the outcome (shipped / partial / failed), the lesson in a sentence, and optional comma-separated tags.
4. They hit **Log it**. The record appears at the top of the log, newest first, with outcome shown as a colored marker.
5. The insights strip at the top updates immediately: total records, outcome mix (e.g. "5 shipped · 2 partial · 3 failed"), and the top failure pattern ("top failure tag: wrong-file edits ×3").
6. Later they return; everything is still there (it persists in the browser). They filter the log by outcome or search text/tag to revisit past lessons.
7. When they want the lessons outside the app — a repo NOTES.md, a retrospective — they hit **Export Markdown** and get a file (also copied to clipboard) of the whole log formatted as Markdown.
8. Success: records persist across reload, insights update live, and the export is paste-ready. All demonstrable on screen in under a minute.

## Screens and Layout

One page, three stacked zones:
- **Top: insights strip** — a horizontal band of stats (total, outcome mix, top failure tag). This is the kernel's home; it leads the page.
- **Middle: record form** — compact single-row-plus-textarea form, always visible; logging must take under 30 seconds.
- **Bottom: the log** — filter controls (outcome pills + a search box) above a newest-first list of record cards.

No navigation, no modals, no second screen.

## Look and Feel

Bench-tool aesthetic: dark background (near-black blue-grey), high-contrast off-white text, monospace for record content and stats, one accent color (signal green) for "shipped", amber for "partial", red for "failed". Dense but calm — generous line spacing, no gradients, no rounded-card SaaS look. Tone of copy: terse and honest ("3 failed" not "3 learning opportunities").

## Features and Behavior

### Logging a record

The form captures: `ask` (required one-liner), `agent` (free text with datalist of previously used agent names), `outcome` (shipped/partial/failed, required, default shipped), `lesson` (required sentence), `tags` (optional, comma-separated). Submitting adds the record and clears the form. Empty required fields block submit with an inline hint.

- As a daily agent user, I want to log a session in under 30 seconds so that logging never feels like a chore.
  - [ ] Record appears at top of log immediately on submit
  - [ ] Form clears and focus returns to the first field
  - [ ] Submitting with an empty `ask` or `lesson` shows an inline hint and does not add a record

### The log

Newest-first list of record cards: outcome marker + ask as the headline, lesson underneath, agent name, date, and tags as small chips. Source: `scope.md > The Core Loop`.

- [ ] Two records added in sequence render newest first
- [ ] Each card shows outcome marker, ask, lesson, agent, date, tags

### Insights strip (the kernel)

Live-computed from all records: total count, per-outcome counts, and the most frequent tag among `failed` records ("top failure tag"), hidden gracefully when there are no failures yet. Source: `scope.md > The Unique Kernel`.

- As a builder planning my next session, I want to see what keeps biting me so that I can adjust how I work with the agent.
  - [ ] Counts update in the same instant a record is added (no reload)
  - [ ] With two failed records sharing a tag, that tag is shown as the top failure tag
  - [ ] With zero failed records, the failure-pattern stat shows a neutral empty message

### Filter and search

Outcome filter pills (all/shipped/partial/failed) and a text search over ask, lesson, agent, and tags. Filters combine.

- [ ] Selecting "failed" shows only failed records
- [ ] Typing a tag in search narrows the list to matching records
- [ ] Clearing filters restores the full log

### Export to Markdown

One button renders the full (unfiltered) log as a Markdown document — title, generated date, then each record as a dated section — downloads it as `agentlog-export.md` and copies the same text to the clipboard with a confirmation hint.

- [ ] Downloaded file contains every record, formatted as Markdown
- [ ] Clipboard receives the identical text

## States and Boundaries

- **First use / empty log** — invitation line in the log area; insights strip shows zeros and a neutral failure-pattern message.
- **Persistence** — records live in the browser's localStorage; closing and reopening the page restores the full log. Clearing browser data erases the log (accepted PoC boundary; export is the escape hatch).
- **No filter matches** — the list area says "No records match" rather than showing nothing.
- **Clipboard unavailable** (e.g. non-secure context) — the download still happens; the hint says "downloaded" instead of "copied".
- **Single user, single browser** — no accounts, no sharing, no cross-device.

## Product Decisions

- **Manual entry over transcript import** — 30-second honest logging beats fragile per-agent parsing at PoC size (scope cut list).
- **localStorage over a file/database** — zero install, zero setup; export covers getting data out.
- **Outcomes limited to three values** — shipped/partial/failed is enough granularity to compute a meaningful mix; more states would dilute the pattern read-back.
- **Always-visible form over an "add" modal** — logging friction is the product's biggest risk; the form never hides.

## What We're Building

Single-page local web app: insights strip, record form, filterable/searchable newest-first log, Markdown export, localStorage persistence.

## Deferred From the POC

- Edit/delete of records — the PoC proves logging and read-back; curation waits.
- JSON import — export exists; round-tripping waits.
- Charts over time — later visualizations, not needed to prove the loop.

## Possible Later Enhancements

Streaks ("days logged this week"), per-project grouping, optional AI summary of the log (behind a user-supplied key).

## Non-Goals

- No AI API calls — $0 constraint and not the kernel.
- No accounts, sync, or backend of any kind.
- No parsing of real agent transcript formats.
- No mobile-specific layout work — desktop-first bench tool.

## Open Questions

None blocking. (Agent-name datalist seeding — starts empty and learns from entries; settled, no decision needed.)
