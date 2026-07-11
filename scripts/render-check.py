"""Crawl a diverse sample of pages on the running server and report render health:
HTTP status, console errors, whether main content rendered, and any leaked raw
HTML/Elementor artifacts. Usage: python scripts/render-check.py http://localhost:3100
"""
import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"

PATHS = [
    "/",
    "/about",
    "/intervention",
    "/intervention/alcohol-intervention",   # CPT detail
    "/intervention/eating-disorder",         # WP-page fallback (was 404)
    "/services",
    "/services/breakfree-journey",
    "/interventionists-by-state",            # chip grid
    "/interventionists-by-state/california", # state page (catch-all)
    "/intervention-blog",                    # blog index + pagination
    "/intervention-blog/invitational-interventions",  # blog post (catch-all)
    "/family-class",
    "/insurance",
    "/resources-3",                          # catch-all WP page
    "/trainings/breakfree-intervention-skills-training",
    "/about-us",
]

BAD_MARKERS = ["elementor", "data-elementor", "acf_fc_layout", "&lt;p&gt;", "]]>"]

def main():
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for path in PATHS:
            page = browser.new_page()
            errors = []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            url = BASE + path
            try:
                resp = page.goto(url, wait_until="networkidle", timeout=45000)
                status = resp.status if resp else 0
                body_text = page.inner_text("body")
                html = page.content()
                is404 = "This page could not be found" in body_text or "404" == body_text.strip()[:3]
                content_len = len(body_text.strip())
                leaked = [mk for mk in BAD_MARKERS if mk in html]
                ok = status == 200 and not is404 and content_len > 400 and not leaked and not errors
                results.append((path, status, content_len, is404, leaked, errors[:2], ok))
            except Exception as e:
                results.append((path, "ERR", 0, False, [], [str(e)[:80]], False))
            page.close()
        browser.close()

    print(f"\n{'PATH':<52} {'STATUS':<7} {'LEN':<7} FLAGS")
    print("-" * 100)
    allok = True
    for path, status, clen, is404, leaked, errs, ok in results:
        flags = []
        if is404: flags.append("404")
        if leaked: flags.append("LEAK:" + ",".join(leaked))
        if errs: flags.append("ERR:" + " | ".join(errs))
        if clen <= 400: flags.append("THIN")
        mark = "OK " if ok else "XX "
        if not ok: allok = False
        print(f"{mark}{path:<49} {str(status):<7} {clen:<7} {'; '.join(flags)}")
    print("\n" + ("ALL OK" if allok else "SOME FAILED"))

main()
