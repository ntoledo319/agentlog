"use strict";

/* agentlog — a lab notebook for AI coding-agent sessions.
   Single-page, local-first. All state lives in `records` and (slice 2) localStorage. */

const els = {
  form: document.getElementById("record-form"),
  ask: document.getElementById("f-ask"),
  agent: document.getElementById("f-agent"),
  lesson: document.getElementById("f-lesson"),
  tags: document.getElementById("f-tags"),
  hint: document.getElementById("form-hint"),
  agentNames: document.getElementById("agent-names"),
  list: document.getElementById("log-list"),
  empty: document.getElementById("empty-state"),
  nomatch: document.getElementById("nomatch-state"),
  statTotal: document.getElementById("stat-total"),
  statMix: document.getElementById("stat-mix"),
  statFailure: document.getElementById("stat-failure"),
  search: document.getElementById("f-search"),
  filterOutcome: document.getElementById("filter-outcome"),
  exportBtn: document.getElementById("export-btn"),
  exportHint: document.getElementById("export-hint"),
};

let records = [];
const filter = { outcome: "all", q: "" };

/* Store — load/save around localStorage key "agentlog.records".
   Missing, unparsable, or malformed data degrades to an empty list. */
const STORE_KEY = "agentlog.records";

function isWellFormed(r) {
  return (
    r &&
    typeof r === "object" &&
    typeof r.id === "string" &&
    typeof r.ts === "number" &&
    typeof r.ask === "string" &&
    typeof r.lesson === "string" &&
    ["shipped", "partial", "failed"].includes(r.outcome) &&
    Array.isArray(r.tags)
  );
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isWellFormed);
  } catch {
    return [];
  }
}

let saveFailed = false;
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(records));
  } catch {
    if (!saveFailed) {
      saveFailed = true;
      els.hint.textContent = "browser storage is unavailable — records will last only until this tab closes; use Export Markdown";
      els.hint.hidden = false;
    }
  }
}

function makeRecord(fields) {
  return {
    id: "rk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    ts: Date.now(),
    ask: fields.ask,
    agent: fields.agent || "unspecified",
    outcome: fields.outcome,
    lesson: fields.lesson,
    tags: fields.tags,
  };
}

function parseTags(raw) {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function visibleRecords() {
  const q = filter.q.trim().toLowerCase();
  return records.filter((r) => {
    if (filter.outcome !== "all" && r.outcome !== filter.outcome) return false;
    if (!q) return true;
    const hay = [r.ask, r.lesson, r.agent, r.tags.join(" ")].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

function renderList() {
  const shown = visibleRecords();
  els.list.innerHTML = shown
    .map(
      (r) => `
    <li class="card ${esc(r.outcome)}">
      <div class="card-head">
        <span class="marker">${esc(r.outcome)}</span>
        <span class="ask">${esc(r.ask)}</span>
        <span class="meta">${esc(r.agent)} · ${fmtDate(r.ts)}</span>
      </div>
      <p class="lesson">${esc(r.lesson)}</p>
      ${
        r.tags.length
          ? `<div class="tags">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
          : ""
      }
    </li>`
    )
    .join("");
  els.empty.hidden = records.length !== 0;
  els.nomatch.hidden = !(records.length > 0 && shown.length === 0);
}

function renderAgentNames() {
  const names = [...new Set(records.map((r) => r.agent))].filter((n) => n !== "unspecified");
  els.agentNames.innerHTML = names.map((n) => `<option value="${esc(n)}">`).join("");
}

function computeInsights(recs) {
  const counts = { shipped: 0, partial: 0, failed: 0 };
  const failTags = new Map();
  for (const r of recs) {
    counts[r.outcome] = (counts[r.outcome] || 0) + 1;
    if (r.outcome === "failed") {
      for (const t of r.tags) failTags.set(t, (failTags.get(t) || 0) + 1);
    }
  }
  let topFailureTag = null;
  let topCount = 0;
  for (const [tag, n] of failTags) {
    if (n > topCount) {
      topFailureTag = tag;
      topCount = n;
    }
  }
  return { total: recs.length, ...counts, topFailureTag, topFailureCount: topCount };
}

function renderInsights() {
  const s = computeInsights(records);
  els.statTotal.textContent = String(s.total);
  els.statMix.textContent = `${s.shipped} shipped · ${s.partial} partial · ${s.failed} failed`;
  els.statFailure.textContent =
    s.failed === 0
      ? "no failures logged yet"
      : s.topFailureTag
        ? `${s.topFailureTag} ×${s.topFailureCount} of ${s.failed} failed`
        : `${s.failed} failed · no tags yet`;
}

function render() {
  renderList();
  renderAgentNames();
  renderInsights();
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ask = els.ask.value.trim();
  const lesson = els.lesson.value.trim();
  if (!ask || !lesson) {
    els.hint.textContent = "a record needs at least what you asked and what you learned";
    els.hint.hidden = false;
    return;
  }
  els.hint.hidden = true;
  const outcome = els.form.querySelector('input[name="outcome"]:checked').value;
  records.unshift(
    makeRecord({
      ask,
      agent: els.agent.value.trim(),
      outcome,
      lesson,
      tags: parseTags(els.tags.value),
    })
  );
  save();
  els.form.reset();
  els.ask.focus();
  render();
});

/* Exporter — the full (unfiltered) log as a Markdown document. */
function toMarkdown(recs) {
  const lines = [
    "# agentlog export",
    "",
    `_generated ${new Date().toISOString().slice(0, 10)} · ${recs.length} record${recs.length === 1 ? "" : "s"}_`,
    "",
  ];
  for (const r of recs) {
    lines.push(`## ${fmtDate(r.ts)} — ${r.ask}`);
    lines.push("");
    lines.push(`- **outcome:** ${r.outcome}`);
    lines.push(`- **agent:** ${r.agent}`);
    lines.push(`- **lesson:** ${r.lesson}`);
    if (r.tags.length) lines.push(`- **tags:** ${r.tags.join(", ")}`);
    lines.push("");
  }
  return lines.join("\n");
}

els.exportBtn.addEventListener("click", async () => {
  const md = toMarkdown(records);
  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "agentlog-export.md";
  a.click();
  URL.revokeObjectURL(a.href);
  let copied = false;
  try {
    await navigator.clipboard.writeText(md);
    copied = true;
  } catch {
    copied = false;
  }
  els.exportHint.textContent = copied
    ? `exported ${records.length} record${records.length === 1 ? "" : "s"} — downloaded and copied to clipboard`
    : `exported ${records.length} record${records.length === 1 ? "" : "s"} — downloaded (clipboard unavailable here)`;
  els.exportHint.hidden = false;
  setTimeout(() => {
    els.exportHint.hidden = true;
  }, 4000);
});

/* filters */
els.filterOutcome.addEventListener("click", (e) => {
  const btn = e.target.closest(".fpill");
  if (!btn) return;
  filter.outcome = btn.dataset.outcome;
  for (const b of els.filterOutcome.querySelectorAll(".fpill")) b.classList.toggle("active", b === btn);
  renderList();
});

els.search.addEventListener("input", () => {
  filter.q = els.search.value;
  renderList();
});

/* boot */
records = load();
render();
