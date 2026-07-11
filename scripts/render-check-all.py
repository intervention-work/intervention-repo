"""Crawl EVERY WP page + post path on the running server and report render
health: HTTP status, console/page errors (incl. hydration), leaked raw markup,
and thin content. Usage: python scripts/render-check-all.py http://localhost:3100
"""
import sys, json, urllib.request
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
WP = "https://interventiodev.wpenginepowered.com/wp-json"
UA = {"User-Agent": "Mozilla/5.0 Chrome/120"}
BAD = ["data-elementor", "acf_fc_layout", "elementor-widget", "]]>"]

def wp_paths(kind):
    out = []
    for page in range(1, 6):
        req = urllib.request.Request(f"{WP}/wp/v2/{kind}?per_page=100&page={page}&status=publish&_fields=link", headers=UA)
        try:
            data = json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            break
        if not data:
            break
        for d in data:
            p = d["link"].replace("https://interventiodev.wpenginepowered.com", "").rstrip("/") or "/"
            out.append(p)
        if len(data) < 100:
            break
    return out

def check_one(browser, path):
    """Return (ok, flag_str). Ignores transient 500 (WP rate-limit)."""
    page = browser.new_page()
    errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errs.append(str(e)))
    try:
        resp = page.goto(BASE + path, wait_until="networkidle", timeout=60000)
        status = resp.status if resp else 0
        body = page.inner_text("body")
        html = page.content()
        is404 = "This page could not be found" in body
        leaked = [b for b in BAD if b in html]
        clen = len(body.strip())
        # A 500 is a transient upstream rate-limit, not a render failure.
        rate_limited = status == 500 or any("500" in e for e in errs)
        ok = status == 200 and not is404 and clen > 300 and not leaked and not errs
        flag = []
        if status not in (200,): flag.append(f"status={status}")
        if is404: flag.append("404")
        if leaked: flag.append("LEAK:" + ",".join(leaked))
        if clen <= 300: flag.append(f"THIN({clen})")
        if errs and not rate_limited: flag.append("ERR:" + errs[0][:90])
        return ok, rate_limited, " ".join(flag)
    except Exception as e:
        return False, False, f"EXC:{str(e)[:80]}"
    finally:
        page.close()

def main():
    import time
    paths = sorted(set(wp_paths("pages") + wp_paths("posts")))
    print(f"Crawling {len(paths)} paths\n")
    fails = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for path in paths:
            ok, rl, flag = check_one(browser, path)
            if not ok and rl:
                # transient rate-limit → pause and retry once
                time.sleep(6)
                ok, rl, flag = check_one(browser, path)
            if not ok:
                fails.append(f"{path}  {flag or ('RATE-LIMIT' if rl else '')}")
            time.sleep(0.8)
        browser.close()

    print(f"\n=== {len(paths)-len(fails)}/{len(paths)} clean ===")
    if fails:
        print(f"\n{len(fails)} FAILURES:")
        for f in fails:
            print("  " + f)
    else:
        print("ALL PAGES CLEAN")

main()
