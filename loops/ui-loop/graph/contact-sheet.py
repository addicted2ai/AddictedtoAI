"""contact-sheet.py — one image of every captured label at one theme and viewport, so judge-system judges
the family, not the part (lesson 5 of the source graph).

usage: python loops/ui-loop/graph/contact-sheet.py <evidence set dir> <theme> <viewport> [--crop 1400] [--width 340] [--cols 5]
writes: <set>/contact-sheet--<theme>--<viewport>.png (listed in each judge contract's coverage line)
"""
import sys, os, json, argparse
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('set_dir'); ap.add_argument('theme'); ap.add_argument('viewport')
ap.add_argument('--crop', type=int, default=1400); ap.add_argument('--width', type=int, default=340); ap.add_argument('--cols', type=int, default=5)
a = ap.parse_args()

man = json.load(open(os.path.join(a.set_dir, 'manifest.json'), encoding='utf-8'))
entries = sorted([e for e in man['entries'] if e['theme'] == a.theme and e['viewport'] == a.viewport], key=lambda e: e['label'])
if not entries:
    sys.exit(f'no captures for theme={a.theme} viewport={a.viewport} in {a.set_dir}')

dark = a.theme == 'dark'
bg = (20, 21, 27) if dark else (246, 246, 248)
ink = (230, 231, 238) if dark else (22, 23, 29)
rule = (42, 44, 54) if dark else (214, 216, 224)
font = ImageFont.load_default()
tiles = []
for e in entries:
    im = Image.open(os.path.join(a.set_dir, e['file'])).convert('RGB')
    w, h = im.size
    im = im.crop((0, 0, w, min(h, a.crop)))
    tw = min(a.width, im.width)
    im = im.resize((tw, max(1, round(im.height * tw / im.width))), Image.LANCZOS)
    tiles.append((e, im))

cap_h = 22
tile_h = max(t.height for _, t in tiles) + cap_h + 16
cols = min(a.cols, len(tiles)); rows = (len(tiles) + cols - 1) // cols
pad = 16
W = pad + cols * (a.width + pad); H = pad + 40 + rows * tile_h
sheet = Image.new('RGB', (W, H), bg)
d = ImageDraw.Draw(sheet)
title = f"{os.path.basename(os.path.normpath(a.set_dir))} · {a.theme} · {a.viewport}px · {len(tiles)} templates · first {a.crop}px of each · build {man.get('treeStamp', '?')}"
d.text((pad, pad), title, fill=ink, font=font)
for i, (e, im) in enumerate(tiles):
    r, c = divmod(i, cols)
    x = pad + c * (a.width + pad); y = pad + 40 + r * tile_h
    d.text((x, y), f"{e['label']}  {e['route']}", fill=ink, font=font)
    sheet.paste(im, (x, y + cap_h))
    d.rectangle([x - 1, y + cap_h - 1, x + im.width, y + cap_h + im.height], outline=rule)
out = os.path.join(a.set_dir, f'contact-sheet--{a.theme}--{a.viewport}.png')
sheet.save(out, optimize=True)
print(f'wrote {out} ({W}x{H}, {len(tiles)} tiles)')
