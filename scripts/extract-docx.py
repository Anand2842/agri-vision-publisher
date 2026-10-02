#!/usr/bin/env python3
"""Extract paragraphs from a .docx file as JSON array."""
import xml.etree.ElementTree as ET
import json
import sys
import zipfile
import os
import tempfile
import shutil

docx_path = sys.argv[1]
tmpdir = tempfile.mkdtemp()

try:
    with zipfile.ZipFile(docx_path, "r") as z:
        z.extractall(tmpdir)

    tree = ET.parse(os.path.join(tmpdir, "word", "document.xml"))
    root = tree.getroot()

    ns_w = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

    paragraphs = []
    for p in root.iter(f"{ns_w}p"):
        texts = []
        for t in p.iter(f"{ns_w}t"):
            if t.text:
                texts.append(t.text)
        paragraphs.append("".join(texts).strip())

    print(json.dumps(paragraphs))
finally:
    shutil.rmtree(tmpdir, ignore_errors=True)
