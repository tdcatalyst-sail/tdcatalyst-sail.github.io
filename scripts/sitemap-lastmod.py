#!/usr/bin/env python3
"""Stamp <lastmod> on every sitemap entry from git's record of that page.

Crawlers use <lastmod> to decide what is worth re-fetching; hand-maintained
dates go stale and get ignored, so this reads the real commit date of the file
each URL serves. Run it AFTER committing content changes and commit the sitemap
on its own — otherwise it stamps the previous commit's date.

Idempotent: a no-op when nothing has moved. Pages left out of the sitemap on
purpose (one-pager, the contact cards, /templates/) stay out; this only dates
entries that are already listed.
"""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "sitemap.xml"
BASE = "https://tdcatalyst.com"


def served_by(loc: str) -> pathlib.Path:
    """The file GitHub Pages serves for a URL (extensionless, or a directory index)."""
    path = loc[len(BASE):] if loc.startswith(BASE) else loc
    path = path.lstrip("/")
    return ROOT / (path + "index.html" if path.endswith("/") or not path else path + ".html")


def committed(path: pathlib.Path) -> str:
    out = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(path.relative_to(ROOT))],
        cwd=ROOT, capture_output=True, text=True,
    )
    return out.stdout.strip()


def main() -> int:
    text = SITEMAP.read_text(encoding="utf-8")
    lines, changed, missing = [], 0, []

    for line in text.split("\n"):
        m = re.search(r"<loc>([^<]+)</loc>", line)
        if not m:
            lines.append(line)
            continue
        f = served_by(m.group(1))
        if not f.exists():
            missing.append(m.group(1))
            lines.append(line)
            continue
        date = committed(f)
        if not date:
            lines.append(line)
            continue
        stamped = re.sub(r"<lastmod>[^<]*</lastmod>", "", line)
        stamped = stamped.replace("</loc>", f"</loc><lastmod>{date}</lastmod>")
        if stamped != line:
            changed += 1
        lines.append(stamped)

    for loc in missing:
        print(f"  warning: no file serves {loc}", file=sys.stderr)

    new = "\n".join(lines)
    if new == text:
        print("sitemap.xml: lastmod already current")
        return 0
    SITEMAP.write_text(new, encoding="utf-8")
    print(f"sitemap.xml: {changed} lastmod value(s) updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
