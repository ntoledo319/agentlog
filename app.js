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

function render() {
  renderList();
  renderAgentNames();
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
  els.form.reset();
  els.ask.focus();
  render();
});
