#!/usr/bin/env python3
"""Mechanical verification for agentlog slices (headless Chromium via Playwright).

Usage: python3 devpost/verify_app.py sliceN
Runs real browser checks against http://127.0.0.1 and file:// and prints PASS/FAIL lines.
"""
import http.server
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = 8325
HTTP = f"http://127.0.0.1:{PORT}/index.html"
FILE = "file://" + str(ROOT / "index.html")


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    import os
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Q) as httpd:
        httpd.serve_forever()


def fill_and_submit(pg, ask, agent, outcome, lesson, tags):
    pg.fill("#f-ask", ask)
    pg.fill("#f-agent", agent)
    pg.click(f'input[name="outcome"][value="{outcome}"] + span.pill')
    pg.fill("#f-lesson", lesson)
    pg.fill("#f-tags", tags)
    pg.click("#log-btn")


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    t = threading.Thread(target=serve, daemon=True)
    t.start()

    results = []

    def check(name, cond):
        results.append((name, bool(cond)))
        print(("PASS " if cond else "FAIL ") + name)

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        if which in ("slice1", "all"):
            for origin_name, url in (("http", HTTP), ("file", FILE)):
                pg = browser.new_context().new_page()
                pg.goto(url)
                fill_and_submit(pg, "Refactor the router", "Kimi Code", "partial",
                                "Ask for a plan before edits", "refactor, imports")
                card = pg.wait_for_selector("#log-list .card", timeout=5000)
                check(f"slice1/{origin_name}: record card renders after submit", card is not None)
                check(f"slice1/{origin_name}: card shows ask text",
                      "Refactor the router" in pg.inner_text("#log-list"))
                check(f"slice1/{origin_name}: card shows outcome marker",
                      "partial" in pg.inner_text("#log-list .card .marker").lower())
                # required-field validation
                pg.fill("#f-ask", "")
                pg.fill("#f-lesson", "")
                pg.click("#log-btn")
                check(f"slice1/{origin_name}: empty submit blocked",
                      pg.locator("#log-list .card").count() == 1)
                check(f"slice1/{origin_name}: validation hint shown",
                      pg.is_visible("#form-hint"))
                pg.close()

        if which in ("slice2", "all"):
            for origin_name, url in (("http", HTTP), ("file", FILE)):
                ctx = browser.new_context()
                pg = ctx.new_page()
                pg.goto(url)
                fill_and_submit(pg, "Add dark mode", "Kimi Code", "shipped",
                                "CSS variables made it trivial", "css")
                fill_and_submit(pg, "Fix timezone bug", "Claude Code", "failed",
                                "Agent edited the wrong file", "wrong-file, dates")
                pg.reload()
                pg.wait_for_selector("#log-list .card", timeout=5000)
                check(f"slice2/{origin_name}: 2 records survive reload",
                      pg.locator("#log-list .card").count() == 2)
                check(f"slice2/{origin_name}: newest first",
                      "Fix timezone bug" in pg.inner_text("#log-list .card >> nth=0"))
                # corrupt storage recovery
                pg.evaluate("() => localStorage.setItem('agentlog.records', '{oops')")
                pg.reload()
                check(f"slice2/{origin_name}: corrupt storage recovers to empty state",
                      pg.is_visible("#empty-state") and pg.locator("#log-list .card").count() == 0)
                ctx.close()

        if which in ("slice3", "all"):
            pg = browser.new_context().new_page()
            pg.goto(HTTP)
            check("slice3: zero state shows neutral failure message",
                  "no failures logged yet" in pg.inner_text("#stat-failure"))
            fill_and_submit(pg, "Migrate config loader", "Kimi Code", "failed",
                            "Old imports broke", "imports, refactor")
            fill_and_submit(pg, "Split utils module", "Kimi Code", "failed",
                            "Wrong file edited again", "imports")
            fill_and_submit(pg, "Add export button", "Kimi Code", "shipped",
                            "Small PRs work better", "export")
            check("slice3: total = 3", pg.inner_text("#stat-total").strip() == "3")
            check("slice3: outcome mix correct",
                  pg.inner_text("#stat-mix").strip() == "1 shipped · 0 partial · 2 failed")
            check("slice3: top failure tag surfaced",
                  "imports" in pg.inner_text("#stat-failure") and "×2" in pg.inner_text("#stat-failure"))
            pg.close()

        if which in ("slice4", "all"):
            ctx = browser.new_context(accept_downloads=True)
            pg = ctx.new_page()
            pg.goto(HTTP)
            fill_and_submit(pg, "Migrate config loader", "Kimi Code", "failed",
                            "Old imports broke", "imports, refactor")
            fill_and_submit(pg, "Split utils module", "Kimi Code", "failed",
                            "Wrong file edited again", "imports")
            fill_and_submit(pg, "Add export button", "Kimi Code", "shipped",
                            "Small PRs work better", "export")
            pg.click('#filter-outcome .fpill[data-outcome="failed"]')
            check("slice4: failed pill filters to 2",
                  pg.locator("#log-list .card").count() == 2)
            pg.fill("#f-search", "refactor")
            check("slice4: search narrows within filter to 1",
                  pg.locator("#log-list .card").count() == 1)
            pg.fill("#f-search", "")
            pg.click('#filter-outcome .fpill[data-outcome="all"]')
            check("slice4: clearing filters restores 3",
                  pg.locator("#log-list .card").count() == 3)
            with pg.expect_download(timeout=5000) as dl:
                pg.click("#export-btn")
            path = dl.value.path()
            text = Path(path).read_text()
            check("slice4: export contains all 3 records",
                  text.count("## ") == 3 and "Migrate config loader" in text and "Add export button" in text)
            check("slice4: export is markdown with title",
                  text.lstrip().startswith("# agentlog"))
            ctx.close()

        if which in ("slice5", "all"):
            pg = browser.new_context().new_page()
            pg.goto(HTTP)
            check("slice5: fresh profile shows invitation",
                  pg.is_visible("#empty-state"))
            check("slice5: fresh strip shows zeros",
                  pg.inner_text("#stat-total").strip() == "0")
            fill_and_submit(pg, "Tune prompt for diffs", "Kimi Code", "shipped",
                            "Smaller asks land better", "prompting")
            pg.fill("#f-search", "zzz-no-such-thing")
            check("slice5: no-match state appears",
                  pg.is_visible("#nomatch-state"))
            check("slice5: datalist learned agent name",
                  pg.locator('#agent-names option[value="Kimi Code"]').count() == 1)
            pg.close()

        browser.close()

    failed = [n for n, ok in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
