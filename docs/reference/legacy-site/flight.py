#!/usr/bin/env python3
"""ponytail: pull collapsed-accordion copy out of the RSC flight payload."""
import re, pathlib, sys

SRC = pathlib.Path(__file__).parent / "site/html"
DST = pathlib.Path(__file__).parent / "site/text"
JUNK = re.compile(r"(module__|next/image|_next/|@media|font-|\{|\}|;|^/|^#)")

for name in sys.argv[1:]:
    h = (SRC / f"{name}.html").read_text(errors="ignore")
    strs = re.findall(r'\\"([^"\\]{25,900})\\"', h)
    seen, out = set(), []
    for s in strs:
        s = s.strip()
        if JUNK.search(s) or s in seen:
            continue
        seen.add(s)
        out.append(s)
    (DST / f"{name}-full.txt").write_text("\n\n".join(out))
    print(name, len(out))
