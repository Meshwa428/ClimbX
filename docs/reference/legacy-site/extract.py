#!/usr/bin/env python3
"""ponytail: html -> readable text/structure dump. stdlib only."""
import re, sys, pathlib, html as htmlmod

SRC = pathlib.Path(__file__).parent / "site/html"
DST = pathlib.Path(__file__).parent / "site/text"
DST.mkdir(parents=True, exist_ok=True)

BLOCK = r"(?:div|section|p|h[1-6]|li|br|tr|td|th|header|footer|nav|article|main|button|a|span|label|option)"

for f in sorted(SRC.glob("*.html")):
    s = f.read_text(errors="ignore")
    # strip the next.js 404 shell + scripts/styles
    s = re.sub(r"(?is)<(script|style|noscript|svg)\b.*?</\1>", " ", s)
    # keep tag names for headings/links so structure survives
    s = re.sub(r"(?is)<h([1-6])[^>]*>", r"\n\n### H\1: ", s)
    s = re.sub(r"(?is)<a [^>]*href=\"([^\"]+)\"[^>]*>", r"\n[LINK \1] ", s)
    s = re.sub(r"(?is)<img [^>]*(?:alt=\"([^\"]*)\")?[^>]*src=\"([^\"]+)\"[^>]*>", r"\n[IMG \2 alt=\1]\n", s)
    s = re.sub(r"(?is)<(?:li|tr)[^>]*>", "\n- ", s)
    s = re.sub(rf"(?is)</?{BLOCK}[^>]*>", "\n", s)
    s = re.sub(r"(?is)<[^>]+>", " ", s)
    s = htmlmod.unescape(s)
    s = re.sub(r"[ \t\xa0]+", " ", s)
    s = re.sub(r"\n\s*\n\s*\n+", "\n\n", s)
    lines = [ln.strip() for ln in s.splitlines()]
    out = "\n".join(ln for ln in lines if ln)
    (DST / (f.stem + ".txt")).write_text(out)
    print(f.stem, len(out))
