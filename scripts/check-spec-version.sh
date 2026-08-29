#!/usr/bin/env bash
# Fails when the specification version declared in references/tech-spec.md
# diverges from the one in the README footer. Run before every release.
set -euo pipefail

cd "$(dirname "$0")/.."

SPEC_LINE=$(grep -m1 -E '^Version [0-9]+\.[0-9]+ \([0-9]{2}\.[0-9]{2}\.[0-9]{4}\)' references/tech-spec.md || true)
README_LINE=$(grep -m1 -E '^Specification: version [0-9]+\.[0-9]+, [0-9]{4}-[0-9]{2}-[0-9]{2}\.' README.md || true)

if [[ -z "$SPEC_LINE" ]]; then
  echo "FAIL: no 'Version X.Y (DD.MM.YYYY)' line in references/tech-spec.md" >&2
  exit 1
fi
if [[ -z "$README_LINE" ]]; then
  echo "FAIL: no 'Specification: version X.Y, YYYY-MM-DD.' line in README.md" >&2
  exit 1
fi

SPEC_VERSION=$(sed -E 's/^Version ([0-9]+\.[0-9]+).*/\1/' <<<"$SPEC_LINE")
SPEC_DATE=$(sed -E 's/^Version [0-9]+\.[0-9]+ \(([0-9]{2})\.([0-9]{2})\.([0-9]{4})\).*/\3-\2-\1/' <<<"$SPEC_LINE")
README_VERSION=$(sed -E 's/^Specification: version ([0-9]+\.[0-9]+),.*/\1/' <<<"$README_LINE")
README_DATE=$(sed -E 's/^Specification: version [0-9]+\.[0-9]+, ([0-9]{4}-[0-9]{2}-[0-9]{2})\..*/\1/' <<<"$README_LINE")

if [[ "$SPEC_VERSION" != "$README_VERSION" || "$SPEC_DATE" != "$README_DATE" ]]; then
  echo "FAIL: spec version mismatch" >&2
  echo "  tech-spec.md: $SPEC_VERSION ($SPEC_DATE)" >&2
  echo "  README.md:    $README_VERSION ($README_DATE)" >&2
  exit 1
fi

echo "OK: specification version $SPEC_VERSION ($SPEC_DATE) is consistent"
