#!/usr/bin/env python3
"""Cache-bust the shared assets by stamping a content hash onto every
reference to /style.css and /script.js across the site's HTML.

Why: GitHub Pages serves style.css / script.js with a ~10 min cache and
gives no way to set custom Cache-Control headers. Without versioning, a
returning visitor can load fresh HTML against a stale cached stylesheet
during that window. Adding ?v=<hash> ties each asset's cache key to its
content: browsers refetch the moment (and only when) the file changes.

Run this before committing any change to style.css or script.js:

    python scripts/version-assets.py

It rewrites href="/style.css" -> href="/style.css?v=<hash>" (and the same
for script.js) in place across all HTML, replacing any existing ?v= stamp.
Idempotent: running it with no asset change produces no diff. Line endings
are preserved per file.
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ASSETS = {
    "style.css": ("href", re.compile(r'href="/style\.css(?:\?v=[^"]*)?"')),
    "script.js": ("src", re.compile(r'src="/script\.js(?:\?v=[^"]*)?"')),
}


def short_hash(path: Path) -> str:
    # Hash LF-normalized bytes so the stamp matches the git blob (the repo
    # normalizes line endings) regardless of CRLF/LF in the local checkout.
    return hashlib.md5(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()[:8]


def main() -> int:
    versions = {}
    for name in ASSETS:
        p = ROOT / name
        if not p.exists():
            print(f"ERROR: {name} not found at {p}", file=sys.stderr)
            return 1
        versions[name] = short_hash(p)
        print(f"{name}: v={versions[name]}")

    changed = 0
    for html in ROOT.rglob("*.html"):
        with open(html, "r", encoding="utf-8", newline="") as f:
            text = f.read()
        new = text
        for name, (attr, pattern) in ASSETS.items():
            replacement = f'{attr}="/{name}?v={versions[name]}"'
            new = pattern.sub(replacement, new)
        if new != text:
            with open(html, "w", encoding="utf-8", newline="") as f:
                f.write(new)
            changed += 1
            print(f"  updated {html.relative_to(ROOT)}")

    print(f"\nDone. {changed} file(s) updated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
