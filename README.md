# agentlog

**A lab notebook for AI coding-agent sessions.** Log what you asked your coding agent, how it went (shipped / partial / failed), and what you learned — then see your recurring failure patterns read back to you.

Built for the [Devpost *Build With AI: Basics* hackathon](https://learn-ai-basics.devpost.com/).

## Why

If you work with a coding agent every day, the sessions blur together and the lessons evaporate. agentlog turns thirty seconds of post-session logging into a feedback loop: an insights strip that counts your outcomes and names your top recurring failure pattern ("imports ×3 of 5 failed"), so the next session starts smarter.

## Run it

No install, no build step, no keys, no network:

- double-click `index.html`, **or**
- `python3 -m http.server 8000` in this folder and open <http://localhost:8000>

Your records live in the browser's localStorage. **Export Markdown** downloads the full log (`agentlog-export.md`) and copies it to the clipboard.

## What it does

- **Log a record in under 30 seconds** — what you asked, which agent, outcome (shipped/partial/failed), the lesson, tags. Always-visible form; agent names auto-complete from your history.
- **Insights strip (the point)** — total records, outcome mix, and the most frequent tag among your failures, updated the instant a record lands.
- **Filter & search** — outcome pills plus text search over ask, lesson, agent, and tags.
- **Markdown export** — the whole log as a paste-ready document for a repo NOTES.md or retrospective.
- **Local-first & honest about edges** — persists across reloads; degrades cleanly on corrupt storage, unavailable clipboard, or private-mode browsers.

## How it was built

Planned before code with the [Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics) (`npx skills add challengepost/learn-ai-basics --all -y`), running its skill sequence in the coding agent (Kimi Code CLI). The planning documents live in [`devpost/`](devpost/):

- [`devpost/scope.md`](devpost/scope.md) — the idea, the kernel, the PoC boundary
- [`devpost/prd.md`](devpost/prd.md) — product requirements: journey, behaviors, states
- [`devpost/spec.md`](devpost/spec.md) — technical plan: components, data model, failure modes
- [`devpost/checklist.md`](devpost/checklist.md) — the sliced build, each step verified and committed
- [`devpost/app-map.html`](devpost/app-map.html) — a take-home map of the finished code

Built in 5 verified slices (see the git log). Every slice was checked mechanically in headless Chromium — [`devpost/verify_app.py`](devpost/verify_app.py), 29 checks — before commit. AI assistance (Kimi Code) wrote code and docs under human direction; that collaboration is the subject of the tool itself.

## Verify it yourself

```
python3 -m venv .venv && .venv/bin/pip install playwright && .venv/bin/playwright install chromium
python3 devpost/verify_app.py all     # 29 checks
```

## Stack

Vanilla HTML/CSS/JavaScript. Zero runtime dependencies. Platform APIs only: localStorage, Blob, Clipboard.

## License

MIT — see [LICENSE](LICENSE).
