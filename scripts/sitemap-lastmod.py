#!/usr/bin/env python3
"""Stamp <lastmod> on every sitemap entry from git's record of that page.

Crawlers use <lastmod> to decide what is worth re-fetching; hand-maintained
dates go stale and get ignored, so this reads the real commit date of the file
each URL serves. Run it AFTER committing content changes and commit the sitemap
on its own — otherwise it stamps the previous commit's date.

Cache-buster commits do not count. Re-stamping /style.css?v=<hash> rewrites one
line in every HTML file without changing a word a visitor reads, so dating from
those would tell crawlers the whole site changed every time the CSS moved. A
commit whose diff for a page is nothing but ?v= stamps is skipped, and the page
keeps the date of its last real edit.

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


STAMP = re.compile(r"\?v=[0-9a-f]+")


def git(*args: str) -> str:
    out = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)
    return out.stdout


def stamp_only(sha: str, rel: str) -> bool:
    """True when this commit's changes to rel are nothing but ?v= cache-busters.

    Compares the added and removed lines with the stamp hashes blanked out: if
    they match, the commit rewrote the hash and nothing else. A commit that
    re-stamps AND edits the page fails the comparison and counts as real.
    """
    added, removed = [], []
    for line in git("show", sha, "--format=", "--unified=0", "--", rel).split("\n"):
        if line.startswith(("+++", "---")):
            continue
        if line.startswith("+"):
            added.append(STAMP.sub("?v=", line[1:]))
        elif line.startswith("-"):
            removed.append(STAMP.sub("?v=", line[1:]))
    return bool(added or removed) and sorted(added) == sorted(removed)


def committed(path: pathlib.Path) -> str:
    """The date of the page's last real edit, ignoring cache-buster-only commits."""
    rel = str(path.relative_to(ROOT))
    for entry in git("log", "--format=%H %cs", "--", rel).split("\n"):
        sha, _, date = entry.partition(" ")
        if not sha:
            continue
        if not stamp_only(sha, rel):
            return date.strip()
    return ""


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
