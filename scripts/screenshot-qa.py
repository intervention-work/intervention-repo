"""Full-page screenshots of a set of pages for visual QA.
Usage: python scripts/screenshot-qa.py http://localhost:3100 [slug1 slug2 ...]
If no slugs given, screenshots a default review set. Saves PNGs to /tmp/qa/.
"""
import sys, os
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
ARGS = sys.argv[2:]
OUT = "/tmp/qa"
os.makedirs(OUT, exist_ok=True)

DEFAULT = [
    "/", "/about", "/intervention", "/services", "/resources",
    "/intervention/drug-intervention", "/intervention/alcohol-intervention",
    "/intervention/eating-disorder",
    "/services/breakfree-journey", "/services/recovery-coach-companion",
    "/interventionists-by-state", "/family-class", "/insurance",
    "/intervention-blog", "/free-resources", "/resources-3",
    "/trainings/breakfree-addiction-intervention-skills-training",
    "/does-my-loved-one-need-a-drug-intervention",
    "/intervention-blog/10-relatable-recovery-memes",
]
PATHS = ["/" + a.strip("/") for a in ARGS] if ARGS else DEFAULT

def main():
    results = []
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        for path in PATHS:
            pg = b.new_page(viewport={"width": 1440, "height": 1000})
            errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            name = (path.strip("/").replace("/", "__") or "home")
            try:
                r = pg.goto(BASE + path, wait_until="networkidle", timeout=60000)
                pg.wait_for_timeout(600)
                pg.screenshot(path=f"{OUT}/{name}.png", full_page=True)
                hyd = any("418" in e or "hydrat" in e.lower() for e in errs)
                results.append((path, r.status if r else 0, hyd, len(errs)))
            except Exception as e:
                results.append((path, f"ERR:{str(e)[:40]}", False, 0))
            pg.close()
        b.close()
    print(f"\nScreenshots in {OUT}/")
    for path, status, hyd, ne in results:
        mark = "OK " if status == 200 and not hyd and ne == 0 else "XX "
        print(f"{mark}{path:<58} status={status} hydration={'YES' if hyd else 'no'} errs={ne}")

main()
