#!/usr/bin/env python3
"""Bundle the guide and weather module into one portable, offline-ready page."""
from pathlib import Path
import argparse

ROOT = Path(__file__).resolve().parent

def bundle() -> str:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assets = (
        ("styles.css", '<link rel="stylesheet" href="styles.css">', "style"),
        ("weather.css", '<link rel="stylesheet" href="weather.css">', "style"),
        ("app.js", '<script src="app.js"></script>', "script"),
        ("weather.js", '<script src="weather.js"></script>', "script"),
    )
    for filename, tag, element in assets:
        if html.count(tag) != 1:
            raise ValueError(f"Expected exactly one asset tag for {filename}.")
        content = (ROOT / filename).read_text(encoding="utf-8").rstrip("\n")
        if f"</{element}" in content.lower():
            raise ValueError(f"Unsafe closing tag in inline asset {filename}.")
        html = html.replace(tag, f"<{element}>\n{content}\n</{element}>")
    return html

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
