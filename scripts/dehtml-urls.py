#!/usr/bin/env python3
"""One-shot: convert internal .html links to extensionless (clean) URLs.

Rules, applied in order to every *.html file (pages + redirect stubs) and
sitemap.xml. Only touches .html that is immediately followed by a URL
delimiter (" # ? <), so it never mangles prose or external URLs (those end
in a delimiter too but none of ours are external .html).

  A. /index.html<delim>   -> /<delim>        (/sail/index.html" -> /sail/")
  B. ="index.html"        -> ="./"           (bare relative index link)
  C. .html"               -> "               (strip ext before attr close)
  D. .html#               -> #               (anchored links)
  E. .html?               -> ?               (query links)
  F. .html<               -> <               (sitemap <loc>, stub <a> text)
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

targets = list(ROOT.rglob("*.html")) + [ROOT / "sitemap.xml"]

subs = [
    (re.compile(r'/index\.html(?=["#?<])'), '/'),
    (re.compile(r'="index\.html"'), '="./"'),
    (re.compile(r'\.html"'), '"'),
    (re.compile(r'\.html#'), '#'),
    (re.compile(r'\.html\?'), '?'),
    (re.compile(r'\.html<'), '<'),
]

changed = 0
for path in targets:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    new = text
    for pat, repl in subs:
        new = pat.sub(repl, new)
    if new != text:
        path.write_text(new, encoding="utf-8")
        changed += 1
        print(f"  updated {path.relative_to(ROOT)}")

print(f"\nDone. {changed} file(s) updated.")
