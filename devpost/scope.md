---
doc: scope
status: approved
---

# agentlog

One line: a lab notebook for AI coding-agent sessions — log what you asked, how it went, and what you learned, and see your recurring failure patterns.

## The Unique Kernel
Every entry is an *experiment record* (ask → outcome → lesson), not a diary note — and the app reads the pile back to you: an insights strip that counts outcomes and surfaces your top recurring failure tags ("'wrong-file edits' caused 3 of your last 5 failures"). A journal without the pattern read-back is generic; the feedback loop is the product.

## Who It's For
A solo builder who works with a coding agent every day. Today they finish a session, move on, and two weeks later repeat the same mistake because nothing captured the lesson. Their current alternative is a scattered notes file they never re-read.

## The Core Loop
After a work session: open agentlog → add a record (what you asked for, which agent, outcome: shipped/partial/failed, lesson, tags) → it lands in the log, newest first → the insights strip updates instantly. When planning the next session, they glance at the strip to remember what bites them. They come back because the log gets *more* useful as it grows.

## Inspiration & Identity
Engineering lab notebooks and flight recorders: terse, honest, instrument-like. Dark, calm, dense-but-readable; monospace accents for the records; no marketing chrome. It should feel like a bench tool, not a startup landing page.

## Why This Matters to the Learner
"I run agents on real repos daily. The sessions blur together and the lessons evaporate. I want the tool I'd actually open after a session — thirty seconds of logging for a pattern I can see."

## What "Working" Looks Like
Open the app, add two records with different outcomes and tags, reload the page — records persist and the insights strip shows the outcome mix and the top failure tag. Filter to just the failures, then export the whole log to Markdown. The "oh, that's cool" beat: the insights strip updating the moment the second record lands.

## The POC Boundary
In: a single-page local web app — add record, log list, insights strip, tag/outcome filter, Markdown export, localStorage persistence. Out: everything that needs a backend, an account, or an API key.

## Later
CSV/JSON import, charts over time, per-project grouping, sync.

## Explicitly Cut
- **AI auto-summary of entries** — needs a paid API; violates the $0 constraint and adds nothing to the kernel.
- **Accounts/cloud sync** — backend scope creep; localStorage proves the loop.
- **Prompt capture from real agent transcripts** — format-specific plumbing; manual 30-second entry is the honest PoC.
