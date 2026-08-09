import os
from pathlib import Path

DIST = Path("dist")
(DIST / "assets").mkdir(parents=True, exist_ok=True)
(DIST / "index.html").write_text(
    "<!doctype html><html><head><title>Curriculum Vitae</title></head><body></body></html>",
    encoding="utf-8",
)
