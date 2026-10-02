#!/usr/bin/env python3
"""Convert the Vol 1 "popular article-18" .docx into per-article HTML + images.

Usage: python3 scripts/docx-to-articles.py <file.docx> <out_dir>
Writes <out_dir>/articles.json and <out_dir>/images/*.jpeg (convert to webp separately).
"""
import html, json, os, re, sys, zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

src, out = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(out, "images"), exist_ok=True)
z = zipfile.ZipFile(src)
rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("word/_rels/document.xml.rels"))}
body = ET.fromstring(z.read("word/document.xml")).find(W + "body")

# numId -> is bullet list
num_fmt = {}
if "word/numbering.xml" in z.namelist():
    nroot = ET.fromstring(z.read("word/numbering.xml"))
    abstract = {}
    for an in nroot.findall(W + "abstractNum"):
        lvl = an.find(W + "lvl")
        fmt = lvl.find(W + "numFmt") if lvl is not None else None
        abstract[an.get(W + "abstractNumId")] = fmt.get(W + "val") if fmt is not None else "bullet"
    for n in nroot.findall(W + "num"):
        num_fmt[n.get(W + "numId")] = abstract.get(n.find(W + "abstractNumId").get(W + "val"), "bullet")

HEADING_RE = re.compile(r"^\s*(?:•\s*)?(\d{1,2})?\s*\.?\s*([A-Z][A-Z0-9 ,()/&:–\-.’']{15,})$")
AUTHOR_RE = re.compile(r"Kumar|SCIENTIST|Scientist", re.I)


def runs_html(p):
    parts, bold_flags = [], []
    for r in p.iter(W + "r"):
        t = "".join(x.text or "" for x in r.findall(W + "t"))
        if r.find(W + "tab") is not None:
            t += " "
        if not t:
            continue
        rpr = r.find(W + "rPr")
        b = rpr is not None and rpr.find(W + "b") is not None and rpr.find(W + "b").get(W + "val") not in ("0", "false")
        parts.append((t, b))
        if t.strip():
            bold_flags.append(b)
    mixed = any(bold_flags) and not all(bold_flags)
    s = "".join(f"<strong>{html.escape(t)}</strong>" if (b and mixed and t.strip()) else html.escape(t) for t, b in parts)
    return re.sub(r"\s+", " ", s).replace("</strong><strong>", "").strip()


def text(p):
    return re.sub(r"\s+", " ", "".join(x.text or "" for x in p.iter(W + "t"))).strip()


paras = [el for el in body if el.tag == W + "p"]
# Article starts: all-caps title lines that are followed (within 2 paragraphs) by an author line
starts = []
for i, p in enumerate(paras):
    t = text(p)
    if HEADING_RE.match(t.upper()) and sum(c.islower() for c in t) <= 3 and len(t) > 25:
        nxt = " ".join(text(q) for q in paras[i + 1 : i + 4])
        if AUTHOR_RE.search(nxt):
            starts.append(i)

articles = []
for n, s in enumerate(starts):
    e = starts[n + 1] if n + 1 < len(starts) else len(paras)
    raw_title = re.sub(r"^\s*(?:•\s*)?\d{1,2}\s*\.?\s*", "", text(paras[s])).strip(" .")
    blocks, images, authors_raw, list_open = [], [], [], None
    i = s + 1
    # author / affiliation lines
    while i < e and (not text(paras[i]) or AUTHOR_RE.search(text(paras[i]))) and len(text(paras[i])) < 200:
        if text(paras[i]):
            authors_raw.append(text(paras[i]))
        i += 1
    for p in paras[i:e]:
        for b in p.iter(A + "blip"):
            target = rels[b.get(R + "embed")]
            name = os.path.basename(target)
            with open(os.path.join(out, "images", name), "wb") as f:
                f.write(z.read("word/" + target))
            images.append(name)
            blocks.append(("img", name))
        t = text(p)
        if not t:
            continue
        h = runs_html(p)
        ppr = p.find(W + "pPr")
        style = ""
        numpr = None
        if ppr is not None:
            st = ppr.find(W + "pStyle")
            style = st.get(W + "val") if st is not None else ""
            numpr = ppr.find(W + "numPr")
        is_bullet_text = t.startswith(("•", "·", "▪", "")) or style.lower() == "bullets"
        if numpr is not None or is_bullet_text:
            nid = numpr.find(W + "numId").get(W + "val") if numpr is not None and numpr.find(W + "numId") is not None else None
            kind = "ol" if nid and num_fmt.get(nid, "bullet") not in ("bullet", "none") else "ul"
            item = re.sub(r"^[•·▪]\s*", "", h)
            if t.endswith(":") and len(t) < 80:
                # "Features:" style labels introduce the list that follows
                blocks.append(("p", f"<strong>{re.sub(r'</?strong>', '', item)}</strong>"))
            elif kind == "ol" and len(t) < 70 and not t.endswith("."):
                # short numbered line: a sub-heading ("1. Data Collection") unless it is
                # part of a run of short steps; decided at render time
                blocks.append(("num", item))
            else:
                blocks.append(("li", item, kind))
        elif style.lower().startswith("heading") or (len(t) < 70 and not re.search(r"[.;,]$", t) and not t.endswith(":")):
            blocks.append(("h3", h))
        elif t.endswith(":") and len(t) < 80:
            blocks.append(("p", f"<strong>{re.sub(r'</?strong>', '', h)}</strong>"))
        else:
            blocks.append(("p", h))
    # render
    for k, b in enumerate(blocks):
        if b[0] == "num":
            neighbours = [x for x in (blocks[k - 1] if k else None, blocks[k + 1] if k + 1 < len(blocks) else None) if x]
            in_run = any(x[0] in ("num", "li") for x in neighbours)
            blocks[k] = ("li", b[1], "ol") if in_run else ("h4", b[1])
    out_html, cur = [], None
    for b in blocks:
        if b[0] == "li":
            if cur != b[2]:
                if cur:
                    out_html.append(f"</{cur}>")
                out_html.append(f"<{b[2]}>")
                cur = b[2]
            out_html.append(f"<li>{b[1]}</li>")
            continue
        if cur:
            out_html.append(f"</{cur}>")
            cur = None
        if b[0] == "img":
            out_html.append(f'<figure><img src="__IMG__{b[1]}" alt="" loading="lazy"></figure>')
        else:
            out_html.append(f"<{b[0]}>{b[1]}</{b[0]}>")
    if cur:
        out_html.append(f"</{cur}>")
    first_p = next((re.sub(r"<[^>]+>", "", b[1]) for b in blocks if b[0] in ("p", "li") and len(b[1]) > 80), "")
    articles.append({
        "number": n + 1,
        "raw_title": raw_title,
        "authors_raw": authors_raw,
        "images": images,
        "abstract": first_p,
        "html": "\n".join(out_html),
        "words": len(re.sub(r"<[^>]+>", " ", "\n".join(out_html)).split()),
    })

json.dump(articles, open(os.path.join(out, "articles.json"), "w"), ensure_ascii=False, indent=1)
for a in articles:
    print(a["number"], a["words"], a["images"], a["raw_title"][:70], "|", " / ".join(a["authors_raw"])[:90])
