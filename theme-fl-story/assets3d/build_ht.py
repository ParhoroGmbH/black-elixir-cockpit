"""be4-fl-hardtimes.glb – gleiche Geometrie wie alle 50-ml-Fragrance-Library-Modelle (fl50/build50.py: body_mesh + cap2),
nur neu texturiert: Koerper schwarz lackiert, Kappe Gold, Etikett Gold. "Fragrance Library" / "extrait de parfum" = dieselbe
Schrift-Ebene wie bei den anderen Modellen (aus dem Originalfoto), "HARD TIMES" gesetzt (EB Garamond) nach Lage/Groesse im
echten 50-ml-Produktfoto (Draufsicht-…-Photoroom.jpg). Aufruf aus fl50/: python3 ../ht/build_ht.py out.glb   Claude · 12.11.2026"""
import sys, numpy as np, cv2
sys.path.insert(0, '.')
import build50 as B, cap2
from PIL import Image, ImageDraw, ImageFont

PW, PH = B.PW, B.PH
TW, TH = 1024, 2017                      # wie tex/*-front.jpg
BLACK = (9, 9, 10)
PLATE = (208, 172, 104)
CAPH, X_C, Y_TOP, Y_BOT = 72, 390, 59, 821
SW = int(sys.argv[3]) if len(sys.argv) > 3 else 7   # Strichverstaerkung (EB Garamond Regular ist duenner als die Etikettschrift)   # Versalhoehe, Mitte quer, Ausdehnung laengs (aus dem Foto, in Etikett-Pixeln)


def name_alpha(text='HARD TIMES', weight=float(sys.argv[2]) if len(sys.argv) > 2 else 1.0):
    f = ImageFont.truetype('../hero/EBGaramond.ttf', 400)
    try: f.set_variation_by_axes([500])
    except Exception: pass
    ch = f.getbbox('H')[3] - f.getbbox('H')[1]; s = CAPH / ch
    ws = [f.getlength(c) for c in text]; L = Y_BOT - Y_TOP
    sp = (L / s - sum(ws)) / (len(text) - 1)          # Laufweite so, dass die Zeile die gemessene Laenge hat
    im = Image.new('L', (int(L / s) + 200, 700), 0); d = ImageDraw.Draw(im); x = 100
    for c, w in zip(text, ws): d.text((x, 100), c, 255, font=f, stroke_width=SW, stroke_fill=255); x += w + sp
    a = np.asarray(im); ys, xs = np.where(a > 128)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    a = cv2.resize(a, (L, int(round(a.shape[0] * L / a.shape[1]))), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    if weight != 1.0: a = cv2.dilate(a, np.ones((3, 3))) * (weight - 1) + a * (2 - weight)
    a = np.rot90(a)                                   # liest von unten nach oben wie auf dem Flakon
    out = np.zeros((PH, PW), np.float32); x0 = X_C - a.shape[1] // 2
    out[Y_TOP:Y_TOP + a.shape[0], x0:x0 + a.shape[1]] = a
    return out


def label_alpha():
    rects = B.label_rects(); med = np.median(np.array(list(rects.values())), 0)
    mk = B.TEXT_MASTER; mimg = np.array(Image.open(f'tex/{mk}-front.jpg').convert('RGB'))
    mr = tuple(np.where(np.abs(np.array(rects[mk]) - med) > 0.018, med, rects[mk])); mr = (mr[0] - .006, mr[1] + .006, mr[2] - .006, mr[3] + .006)
    r = (med[0] - .006, med[1] + .006, med[2] - .006, med[3] + .006)
    m = B.name_part(B.text_alpha(mimg, mr), False)
    n, lab, st, _ = cv2.connectedComponentsWithStats((m > 0.2).astype(np.uint8))   # Staubkoerner/Kratzer des Fotos entfernen (i-Punkte sind > 100 px)
    bad = np.isin(lab, [i for i in range(1, n) if st[i, 4] < 60]); m[cv2.dilate(bad.astype(np.uint8), np.ones((5, 5))) > 0] = 0
    return r, np.maximum(m, name_alpha())


def front():
    (l, r, t, b), a = label_alpha(); Hh, Ww = TH, TW
    x0, x1, y0, y1 = int(l * Ww), int(r * Ww), int(t * Hh), int(b * Hh)
    a = cv2.resize(a, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    plate = np.zeros((Hh, Ww), np.uint8); rad = int(0.025 * Ww)
    cv2.rectangle(plate, (x0 + rad, y0), (x1 - rad, y1), 255, -1); cv2.rectangle(plate, (x0, y0 + rad), (x1, y1 - rad), 255, -1)
    for cx, cy in ((x0 + rad, y0 + rad), (x1 - rad, y0 + rad), (x0 + rad, y1 - rad), (x1 - rad, y1 - rad)): cv2.circle(plate, (cx, cy), rad, 255, -1)
    pm = cv2.GaussianBlur(plate.astype(np.float32) / 255, (0, 0), 1.0)[..., None]
    base = np.broadcast_to(np.array(BLACK, np.float32), (Hh, Ww, 3))
    col = np.broadcast_to(np.array(PLATE, np.float32), (Hh, Ww, 3)) * (1 + 0.05 * np.linspace(-1, 1, Hh)[:, None, None])
    edge = cv2.GaussianBlur((cv2.morphologyEx(plate, cv2.MORPH_GRADIENT, np.ones((7, 7))) > 0).astype(np.float32), (0, 0), 1.2)[..., None]
    col = col * (1 + 0.18 * edge)
    txt = np.zeros((Hh, Ww), np.float32); txt[y0:y1, x0:x1] = a; txt = txt[..., None] * pm
    out = base * (1 - pm) + col * pm; out = out * (1 - txt) + np.array([16, 14, 12], np.float32) * txt
    mr = np.zeros((Hh, Ww, 3), np.float32)
    mr[..., 1] = 255 * (0.42 * (1 - pm[..., 0]) + 0.32 * pm[..., 0] + 0.2 * txt[..., 0])
    mr[..., 2] = 255 * pm[..., 0] * (0.82 + 0.18 * txt[..., 0])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), Image.fromarray(mr.astype(np.uint8))


def build(out):
    g = B.GLB(); fimg, fmr = front(); blk = Image.new('RGB', (16, 16), BLACK)
    mf = g.material(tex=g.texture(fimg, q=92, maxside=2048), mr=g.texture(fmr, q=88, maxside=1024), metal=1.0, rough=1.0, clearcoat=1.0, name='front')
    tb = g.texture(blk, png=True)
    mb = g.material(tex=tb, metal=0.0, rough=0.4, clearcoat=1.0, name='back')
    ms = g.material(tex=tb, metal=0.0, rough=0.4, clearcoat=1.0, name='side')
    mt = g.material(tex=tb, metal=0.0, rough=0.4, clearcoat=1.0, name='topbot')
    bm = B.body_mesh()
    body = g.mesh_([bm['front'] + (mf,), bm['back'] + (mb,), bm['side'] + (ms,), bm['cap'] + (mt,)])
    mm = g.material(color=B.GOLD, metal=1.0, rough=0.035, name='metal')
    ytop = B.Y0 + B.H
    col = g.mesh_([cap2.collar_mesh(ytop) + (mm,)]); cap = g.mesh_([cap2.cap_mesh(ytop + cap2.COL_H) + (mm,)])
    root = g.node(children=[g.node(body), g.node(col), g.node(cap, r=(0, 0.0, 0, 1.0))])
    fimg.save('../ht/ht-front.jpg', quality=92)
    return g.save(out, [root])


if __name__ == '__main__':
    print(build(sys.argv[1]))
