#!/usr/bin/env python3
"""Pull the legal pages' accordion bodies out of the archived RSC payloads.

`extract.py` only sees the SSR HTML, where a shut accordion has no body — that is why
`text/*-full.txt` came out as loose fragments. The bodies are all present in the flight
payload as `{"number","title","content"}` objects, doubly escaped inside a JS string.

Run: python3 docs/reference/legacy-site/legal.py > /tmp/legal.json
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
PAGES = ["privacy-policy", "terms-conditions", "refund-policy"]


def unescape(raw: str) -> str:
    # \\\\" is a literal quote inside the copy; \\" is a payload quote. Park the first one
    # before collapsing the second, or the section objects lose their boundaries.
    return raw.replace('\\\\\\"', "\x00").replace('\\"', '"')


def balanced(text: str, start: int) -> str:
    """The section object starting at `start`, cut where its own braces close.

    A fixed-width window is what made the first pass bleed the following sections' copy into
    the last one — the tail of the array has no next marker to stop at.
    """
    depth = 0
    for i in range(start, len(text)):
        c = text[i]
        if c in "[{":
            depth += 1
        elif c in "]}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    return text[start:]


def clean(s: str) -> str:
    return s.replace("\x00", '"').replace("\\u0026", "&").replace("\\n", " ").strip()


TAGS = {"$", "p", "ul", "li", "div", "span", "a", "strong", "br"}


def text_of(body: str):
    """Every prose string in a content chunk, in document order.

    `"children"` is sometimes a plain string and sometimes an array of strings and elements
    (that is where the Terms introduction and two of its clauses were hiding), so this reads
    both and drops the element tags and className values around them.
    """
    found = False
    for m in re.finditer(r'"children":\s*(\[[^\[\]]*\]|"[^"]*")', body):
        for s in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1)):
            if s in TAGS or s.startswith("$") or len(s) < 3 or "-" in s and " " not in s:
                continue
            found = True
            yield s
    if found:
        return
    # Fallback for children arrays with elements nested inside them (the Terms introduction
    # and two of its clauses): take every string that reads like a sentence.
    for s in re.findall(r'"((?:[^"\\]|\\.)*)"', body):
        if s.startswith("$") or len(s) < 15 or " " not in s or s.startswith("list-disc"):
            continue
        yield s


def lazy_chunks(text: str) -> dict:
    """`"content":"$L7"` means the body streamed in later as its own `7:[...]` chunk.

    Everything past section five is referenced this way, which is why a first pass that only
    read the inline objects came back with half the policy missing.
    """
    out = {}
    for m in re.finditer(r"\\n([0-9a-f]{1,2}):\[", text):
        out[m.group(1)] = balanced(text, m.end() - 1)
    return out


def sections(text: str):
    lazy = lazy_chunks(text)
    for m in re.finditer(r'\{"number":"\d\d","title":"', text):
        chunk = balanced(text, m.start())
        title = clean(re.search(r'"title":"([^"]*)"', chunk).group(1))
        ref = re.search(r'"content":"\$L([0-9a-f]{1,2})"', chunk)
        body = lazy.get(ref.group(1), "") if ref else chunk
        bodies = [clean(b) for b in text_of(body)]
        bodies = [b for b in bodies if b and b != title]
        # A `ul` right at the top means the whole section is a bullet list; a `p` first means
        # prose, which may still be followed by one.
        head = body.split('"content":', 1)[-1][:40] if not ref else body[:40]
        yield {"title": title, "kind": "ul" if '"ul"' in head else "p", "blocks": bodies}


out = {}
for page in PAGES:
    body = unescape((HERE / "html" / f"{page}.html").read_text(errors="ignore"))
    found = list(sections(body))
    out[page] = found
    print(f"{page}: {len(found)} sections", file=sys.stderr)

json.dump(out, sys.stdout, indent=1, ensure_ascii=False)
