#!/usr/bin/env bash
# ponytail: BFS crawler, curl+grep. No deps.
set -u
BASE="https://www.climbxdigital.in"
OUT="$(dirname "$0")/site"
mkdir -p "$OUT/html"
seen="$OUT/seen.txt"; queue="$OUT/queue.txt"
: > "$seen"; printf '/\n' > "$queue"

while :; do
  next=$(grep -v -x -F -f "$seen" "$queue" 2>/dev/null | head -1)
  [ -z "$next" ] && break
  echo "$next" >> "$seen"
  fname=$(echo "$next" | sed 's|^/||; s|/$||; s|/|_|g'); [ -z "$fname" ] && fname="index"
  code=$(curl -sSL -m 25 -A "Mozilla/5.0" "$BASE$next" -o "$OUT/html/$fname.html" -w "%{http_code}")
  title=$(grep -o '<title>[^<]*</title>' "$OUT/html/$fname.html" | head -1 | sed 's|</\?title>||g')
  echo "$code  $next  ::  $title"
  # extract internal hrefs (html + next flight payload)
  grep -o 'href="/[^"#?]*"' "$OUT/html/$fname.html" | sed 's|href="||; s|"$||' >> "$queue"
  grep -o '\\"/[a-z0-9][a-z0-9/-]*\\"' "$OUT/html/$fname.html" | sed 's|\\"||g' >> "$queue"
  # dedupe + drop assets
  sort -u "$queue" | grep -v -E '\.(css|js|png|jpg|jpeg|svg|webp|ico|woff2?|mp4|txt|xml|json|avif|webm|gif|pdf)$' \
    | grep -v '^/_next' > "$queue.tmp" && mv "$queue.tmp" "$queue"
done
echo "--- CRAWLED ---"; sort -u "$seen"
