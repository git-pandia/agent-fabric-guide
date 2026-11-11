#!/usr/bin/env python3
"""Bundle the HTML, CSS, and JavaScript into one portable, offline-ready page."""
from pathlib import Path
import argparse

ROOT = Path(__file__).resolve().parent

def bundle() -> str:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8").rstrip("\n")
    js = (ROOT / "app.js").read_text(encoding="utf-8").rstrip("\n")
    css_tag = '<link rel="stylesheet" href="styles.css">'
    js_tag = '<script src="app.js"></script>'
    if html.count(css_tag) != 1 or html.count(js_tag) != 1:
        raise ValueError("Expected exactly one local stylesheet and one local script tag.")
    return html.replace(css_tag, "<style>\n" + css + "\n</style>").replace(
        js_tag, "<script>\n" + js + "\n</script>"
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "agent-fabric-guide.html")
    args = parser.parse_args()
    try:
        result = bundle()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result, encoding="utf-8")
    except (OSError, ValueError) as exc:
        parser.exit(1, f"Build failed: {exc}\n")
    print(f"Created {args.output} ({len(result.encode('utf-8')):,} bytes)")
