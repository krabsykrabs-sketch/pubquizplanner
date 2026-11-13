#!/usr/bin/env python3
"""Draws the category illustrations (public/categories/<slug>/icon.svg) and the
three "how it works" step illustrations (public/marketing/step-*.svg).

One hand-written SVG per quiz category, all built from the same parts so the
set reads as one family ("Tageslicht" brand):

  - navy ink outline, round joins            (OUT)
  - thin ink detail lines                    (DET)
  - one orange gradient, light top-left      (grad)
  - white, yellow and deep-orange accents
  - a white highlight on the lit side
  - a few light-orange sparkles around the subject

Canvas is 2048 x 2048 with a transparent ground. The art is used on tinted
tiles on the site and on the navy slides, so nothing may rely on the
background colour.

Run:  python3 scripts/build-category-icons.py            (all)
      python3 scripts/build-category-icons.py sport ...  (some)
"""
import math
import os
import sys

INK = '#1A2238'
O1, O2, O3 = '#FBE3CB', '#F5A262', '#EE6A2A'  # gradient: light -> orange
DEEP = '#B5430F'
YEL = '#FFCF4A'
WHITE = '#FFFFFF'
SPK = '#F5A262'

def out(width=28):
    """Ink stroke attributes at a given width."""
    return f'stroke="{INK}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"'


OUT = out()  # main outline
THIN = out(18)  # small parts
DET = 'fill="none" ' + out(12)  # detail lines


def grad(gid, x1, y1, x2, y2):
    return (f'<linearGradient gradientUnits="userSpaceOnUse" id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{O1}"/><stop offset="0.45" stop-color="{O2}"/>'
            f'<stop offset="1" stop-color="{O3}"/></linearGradient>')


def star(cx, cy, R, r, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        a = math.radians(rot + i * 180 / n)
        rad = R if i % 2 == 0 else r
        pts.append(f'{cx + rad * math.cos(a):.1f} {cy + rad * math.sin(a):.1f}')
    return 'M ' + ' L '.join(pts) + ' Z'


def sparkles(stars, dots):
    """stars: (x, y, size) four-point sparkles; dots: (x, y, r)."""
    out = [f'<g fill="{SPK}">']
    out += [f'<path d="{star(x, y, s, s * 0.28, 4)}"/>' for x, y, s in stars]
    out += [f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x, y, r in dots]
    out.append('</g>')
    return ''.join(out)


def circle_path(cx, cy, r):
    return f'M {cx + r} {cy} A {r} {r} 0 1 0 {cx - r} {cy} A {r} {r} 0 1 0 {cx + r} {cy} Z'


def gear(cx, cy, ro, ri, n, hole, rot=0.0):
    step = 2 * math.pi / n
    pts = []
    for i in range(n):
        a = rot + i * step
        for rad, off in ((ri, -0.30), (ro, -0.17), (ro, 0.17), (ri, 0.30)):
            pts.append(f'{cx + rad * math.cos(a + off * step):.1f} {cy + rad * math.sin(a + off * step):.1f}')
    return 'M ' + ' L '.join(pts) + ' Z ' + circle_path(cx, cy, hole)


def bubble(x0, y0, x1, y1, r, tail):
    """Rounded speech bubble; tail = (x_left, x_right, tip_x, tip_y) on the bottom edge."""
    xa, xb, tx, ty = tail
    return (f'M {x0 + r} {y0} L {x1 - r} {y0} A {r} {r} 0 0 1 {x1} {y0 + r} L {x1} {y1 - r} '
            f'A {r} {r} 0 0 1 {x1 - r} {y1} L {xb} {y1} L {tx} {ty} L {xa} {y1} L {x0 + r} {y1} '
            f'A {r} {r} 0 0 1 {x0} {y1 - r} L {x0} {y0 + r} A {r} {r} 0 0 1 {x0 + r} {y0} Z')


def svg(defs, body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 2048 2048">\n'
            f'<defs>{defs}</defs>\n{body}\n</svg>\n')


# --------------------------------------------------------------------------
# The illustrations
# --------------------------------------------------------------------------

def allgemeinwissen():  # light bulb
    rays = ''.join(
        f'<path d="M {1024 + 610 * math.cos(math.radians(a)):.0f} {810 + 610 * math.sin(math.radians(a)):.0f} '
        f'L {1024 + 740 * math.cos(math.radians(a)):.0f} {810 + 740 * math.sin(math.radians(a)):.0f}"/>'
        for a in (-160, -125, -90, -55, -20))
    body = f'''
<g fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round">{rays}</g>
<g fill="none" stroke="{YEL}" stroke-width="26" stroke-linecap="round">{rays}</g>
<g {OUT}>
  <path d="M 934 1650 L 1114 1650 L 1114 1700 Q 1114 1760 1024 1760 Q 934 1760 934 1700 Z" fill="{DEEP}"/>
  <path d="M 834 1400 C 834 1250 700 1180 620 1050 A 470 470 0 1 1 1428 1050 C 1348 1180 1214 1250 1214 1400 Z" fill="url(#g)"/>
  <path d="M 834 1390 L 1214 1390 L 1214 1610 Q 1214 1660 1164 1660 L 884 1660 Q 834 1660 834 1610 Z" fill="{WHITE}"/>
</g>
<path d="M 700 800 C 706 640 820 500 990 452 C 872 540 800 660 786 812 C 780 850 700 846 700 800 Z" fill="{WHITE}"/>
<g {DET}>
  <path d="M 934 1386 L 900 1090 L 962 1000 L 1024 1090 L 1086 1000 L 1148 1090 L 1114 1386"/>
  <path d="M 840 1482 L 1208 1466"/><path d="M 840 1572 L 1208 1556"/>
</g>
{sparkles([(330, 1180, 62), (1740, 1260, 50)], [(1640, 1520, 16), (420, 1500, 14)])}'''
    return svg(grad('g', 600, 380, 1400, 1400), body)


def sport():  # trophy
    body = f'''
<g transform="translate(1024 1010) scale(1.13) translate(-1024 -1010)">
<g fill="none" stroke-linecap="round">
  <path d="M 670 540 C 400 520 410 870 740 860" stroke="{INK}" stroke-width="104"/>
  <path d="M 1378 540 C 1648 520 1638 870 1308 860" stroke="{INK}" stroke-width="104"/>
  <path d="M 670 540 C 400 520 410 870 740 860" stroke="{WHITE}" stroke-width="48"/>
  <path d="M 1378 540 C 1648 520 1638 870 1308 860" stroke="{WHITE}" stroke-width="48"/>
</g>
<g {OUT}>
  <path d="M 954 1080 L 1094 1080 L 1114 1340 L 934 1340 Z" fill="{DEEP}"/>
  <path d="M 644 430 L 1404 430 C 1404 810 1300 1070 1024 1120 C 748 1070 644 810 644 430 Z" fill="url(#g)"/>
  <rect x="600" y="372" width="848" height="96" rx="48" fill="{WHITE}"/>
  <rect x="764" y="1330" width="520" height="140" rx="34" fill="url(#g2)"/>
  <rect x="676" y="1470" width="696" height="180" rx="34" fill="{DEEP}"/>
  <rect x="884" y="1524" width="280" height="72" rx="20" fill="{WHITE}" stroke-width="18"/>
</g>
<path d="M 716 520 C 722 740 774 900 880 1000 C 824 870 800 720 800 520 Z" fill="{WHITE}"/>
<path d="{star(1040, 740, 150, 62)}" fill="{YEL}" {THIN}/>
</g>
{sparkles([(280, 300, 60), (1790, 1240, 52)], [(1700, 260, 16), (330, 1300, 14)])}'''
    return svg(grad('g', 640, 430, 1400, 1120) + grad('g2', 764, 1330, 1284, 1470), body)


def geschichte():  # ionic column
    flutes = ''.join(f'<path d="M {x} 690 L {x + dx} 1430"/>'
                     for x, dx in ((842, -12), (963, -4), (1085, 4), (1206, 12)))
    body = f'''
<g transform="translate(1024 1040) scale(1.1) translate(-1024 -1040)">
<g {OUT}>
  <path d="M 744 600 L 1304 600 L 1338 1500 L 710 1500 Z" fill="url(#g)"/>
  <rect x="640" y="440" width="768" height="170" rx="40" fill="url(#g2)"/>
  <circle cx="640" cy="560" r="136" fill="{WHITE}"/>
  <circle cx="1408" cy="560" r="136" fill="{WHITE}"/>
  <rect x="556" y="330" width="936" height="110" rx="26" fill="{WHITE}"/>
  <rect x="650" y="1490" width="748" height="112" rx="34" fill="{WHITE}"/>
  <rect x="566" y="1602" width="916" height="150" rx="30" fill="{DEEP}"/>
</g>
<path d="M 776 660 L 760 1440 L 806 1440 L 812 660 Z" fill="{WHITE}" opacity="0.85"/>
<g {DET}>
  {flutes}
  <path d="M 640 560 m -78 0 a 78 78 0 1 1 78 78 a 44 44 0 1 1 -44 -44"/>
  <path d="M 1408 560 m 78 0 a 78 78 0 1 0 -78 78 a 44 44 0 1 0 44 -44"/>
</g>
</g>
{sparkles([(250, 760, 58), (1800, 980, 52)], [(1770, 380, 16), (300, 1300, 14)])}'''
    return svg(grad('g', 720, 600, 1340, 1500) + grad('g2', 640, 440, 1408, 610), body)


def geographie():  # globe on a stand
    R, cx, cy = 664, 1024, 900
    a = math.radians(105)
    sx, sy = cx + R * math.cos(a), cy - R * math.sin(a)
    ex, ey = sx, cy + R * math.sin(a)
    arc = f'M {sx:.0f} {sy:.0f} A {R} {R} 0 0 0 {ex:.0f} {ey:.0f}'
    body = f'''
<path d="{arc}" fill="none" stroke="{INK}" stroke-width="84" stroke-linecap="round"/>
<path d="{arc}" fill="none" stroke="{DEEP}" stroke-width="30" stroke-linecap="round"/>
<g {OUT}>
  <path d="M 974 1500 L 1074 1500 L 1094 1720 L 954 1720 Z" fill="url(#g2)"/>
  <rect x="704" y="1700" width="640" height="120" rx="46" fill="{DEEP}"/>
  <circle cx="{cx}" cy="{cy}" r="580" fill="{WHITE}"/>
</g>
<g clip-path="url(#c)">
  <path d="M 520 560 C 620 450 800 470 850 590 C 890 690 810 740 800 830 C 790 930 880 990 850 1100 C 820 1230 700 1290 640 1190 C 590 1100 640 990 570 900 C 500 810 450 660 520 560 Z" fill="url(#g)" {THIN}/>
  <path d="M 1080 420 C 1220 340 1440 420 1520 580 C 1580 710 1470 750 1390 770 C 1310 790 1330 890 1390 970 C 1450 1070 1400 1230 1290 1250 C 1180 1270 1160 1130 1120 1030 C 1080 930 980 890 1000 750 C 1010 640 1000 480 1080 420 Z" fill="url(#g)" {THIN}/>
  <path d="M 850 1270 C 920 1236 1024 1258 1040 1316 C 1048 1374 944 1400 872 1370 C 816 1348 806 1296 850 1270 Z" fill="url(#g)" {THIN}/>
</g>
<circle cx="{cx}" cy="{cy}" r="580" fill="none" {OUT}/>
{sparkles([(1760, 520, 58), (300, 1380, 52)], [(1700, 1560, 16), (330, 420, 14)])}'''
    defs = (grad('g', 480, 380, 1560, 1480) + grad('g2', 954, 1500, 1094, 1720)
            + f'<clipPath id="c"><circle cx="{cx}" cy="{cy}" r="566"/></clipPath>')
    return svg(defs, body)


def film_tv():  # clapperboard
    def stripes(top, bottom):
        return ''.join(
            f'<path d="M {x + 70} {top} L {x + 200} {top} L {x + 110} {bottom} L {x - 20} {bottom} Z" fill="{INK}"/>'
            for x in range(380, 1700, 250))
    body = f'''
<g {OUT}>
  <rect x="404" y="940" width="1240" height="760" rx="64" fill="url(#g)"/>
</g>
<g transform="rotate(-13 440 800)">
  <rect x="404" y="600" width="1240" height="170" rx="30" fill="{WHITE}"/>
  <g clip-path="url(#a)">{stripes(600, 770)}</g>
  <rect x="404" y="600" width="1240" height="170" rx="30" fill="none" {OUT}/>
</g>
<rect x="404" y="800" width="1240" height="170" rx="30" fill="{WHITE}"/>
<g clip-path="url(#b)">{stripes(800, 970)}</g>
<rect x="404" y="800" width="1240" height="170" rx="30" fill="none" {OUT}/>
<circle cx="470" cy="790" r="44" fill="{YEL}" {THIN}/>
<g fill="{WHITE}">
  <rect x="500" y="1070" width="560" height="64" rx="32"/>
  <rect x="500" y="1250" width="300" height="64" rx="32"/>
  <rect x="880" y="1250" width="300" height="64" rx="32"/>
  <rect x="1260" y="1250" width="280" height="64" rx="32"/>
  <rect x="500" y="1470" width="700" height="64" rx="32"/>
</g>
<g {DET}><path d="M 430 1192 L 1618 1192"/><path d="M 430 1392 L 1618 1392"/></g>
{sparkles([(300, 420, 58), (1770, 1100, 50)], [(1730, 1500, 16), (290, 1560, 14)])}'''
    defs = (grad('g', 404, 940, 1644, 1700)
            + '<clipPath id="a"><rect x="404" y="600" width="1240" height="170" rx="30"/></clipPath>'
            + '<clipPath id="b"><rect x="404" y="800" width="1240" height="170" rx="30"/></clipPath>')
    return svg(defs, body)


def musik():  # vinyl record
    cx = cy = 1024

    def arc(r, a0, a1):
        p0 = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0)))
        p1 = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
        return f'<path d="M {p0[0]:.0f} {p0[1]:.0f} A {r} {r} 0 0 1 {p1[0]:.0f} {p1[1]:.0f}"/>'
    grooves = ''.join(arc(r, a0, a1) for r in (630, 550, 470, 390)
                      for a0, a1 in ((15, 75), (105, 165), (285, 345)))
    shine = arc(630, 196, 248) + arc(550, 200, 244) + arc(470, 204, 240)
    body = f'''
<circle cx="{cx}" cy="{cy}" r="720" fill="url(#g)" {OUT}/>
<g {DET}>{grooves}</g>
<g fill="none" stroke="{WHITE}" stroke-width="30" stroke-linecap="round">{shine}</g>
<circle cx="{cx}" cy="{cy}" r="260" fill="{YEL}" {OUT}/>
<circle cx="{cx}" cy="{cy}" r="170" {DET}/>
<circle cx="{cx}" cy="{cy}" r="44" fill="{WHITE}" {THIN}/>
{sparkles([(250, 330, 60), (1800, 1700, 52)], [(1760, 300, 16), (270, 1740, 14)])}'''
    return svg(grad('g', 420, 420, 1640, 1640), body)


def wissenschaft():  # flask
    flask = 'M 904 400 L 904 760 L 480 1560 Q 430 1700 580 1700 L 1468 1700 Q 1618 1700 1568 1560 L 1144 760 L 1144 400 Z'
    body = f'''
<path d="{flask}" fill="{WHITE}"/>
<path d="M 692 1160 Q 858 1090 1024 1160 T 1356 1160 L 1568 1560 Q 1618 1700 1468 1700 L 580 1700 Q 430 1700 480 1560 Z" fill="url(#g)" {THIN}/>
<path d="M 664 1330 L 566 1516 Q 540 1600 600 1620 L 640 1620 Q 600 1580 636 1520 L 730 1340 Z" fill="{WHITE}" opacity="0.9"/>
<path d="{flask}" fill="none" {OUT}/>
<rect x="852" y="330" width="344" height="100" rx="50" fill="{WHITE}" {OUT}/>
<g {THIN}>
  <circle cx="930" cy="1440" r="54" fill="{WHITE}"/>
  <circle cx="1130" cy="1330" r="38" fill="{WHITE}"/>
  <circle cx="1210" cy="1520" r="46" fill="{YEL}"/>
  <circle cx="1000" cy="960" r="34" fill="{YEL}"/>
  <circle cx="1066" cy="800" r="24" fill="{WHITE}"/>
  <circle cx="1010" cy="640" r="18" fill="{WHITE}"/>
</g>
{sparkles([(430, 620, 60), (1650, 880, 52)], [(1560, 460, 16), (360, 1120, 14)])}'''
    return svg(grad('g', 480, 1100, 1568, 1700), body)


def essen_trinken():  # burger
    wave = ' '.join(f'Q {x - 78} 1110 {x - 156} 1036' for x in range(1668, 500, -156))
    seeds = ''.join(
        f'<ellipse cx="{x}" cy="{y}" rx="38" ry="19" transform="rotate({r} {x} {y})" fill="{WHITE}" {out(12)}/>'
        for x, y, r in ((790, 640, -25), (1024, 540, 0), (1260, 640, 25), (900, 790, -10), (1170, 800, 12)))
    body = f'''
<g {OUT}>
  <path d="M 440 1300 L 1608 1300 Q 1652 1300 1652 1350 C 1652 1520 1540 1600 1400 1600 L 648 1600 C 508 1600 396 1520 396 1350 Q 396 1300 440 1300 Z" fill="url(#g2)"/>
  <rect x="426" y="1110" width="1196" height="190" rx="90" fill="{DEEP}"/>
  <path d="M 410 1060 L 1638 1060 L 1638 1110 L 1430 1110 L 1330 1230 L 1230 1110 L 870 1110 L 770 1210 L 670 1110 L 410 1110 Z" fill="{YEL}"/>
  <path d="M 396 960 L 1652 960 Q 1700 1000 1668 1036 {wave} Q 370 1000 396 960 Z" fill="{WHITE}"/>
  <path d="M 420 900 C 420 520 760 380 1024 380 C 1288 380 1628 520 1628 900 Q 1628 966 1568 966 L 480 966 Q 420 966 420 900 Z" fill="url(#g)"/>
</g>
<path d="M 500 850 C 510 640 640 500 830 440 C 700 540 620 680 600 860 C 596 900 500 896 500 850 Z" fill="{WHITE}" opacity="0.85"/>
{seeds}
{sparkles([(300, 520, 58), (1770, 720, 50)], [(1730, 1500, 16), (300, 1560, 14)])}'''
    return svg(grad('g', 420, 380, 1628, 966) + grad('g2', 396, 1300, 1652, 1600), body)


def literatur():  # open book
    left = ''.join(f'<path d="M 470 {y} Q 720 {y - 70} 934 {y + 16}"/>' for y in range(720, 1400, 150))
    right = ''.join(f'<path d="M 1578 {y} Q 1328 {y - 70} 1114 {y + 16}"/>' for y in range(720, 1400, 150))
    body = f'''
<g {OUT}>
  <path d="M 1250 1420 L 1250 1800 L 1310 1736 L 1370 1800 L 1370 1420 Z" fill="{YEL}"/>
  <path d="M 290 620 L 1758 620 L 1758 1620 C 1450 1560 1150 1580 1024 1668 C 898 1580 598 1560 290 1620 Z" fill="url(#g)"/>
  <path d="M 1024 570 C 900 470 620 450 376 520 L 376 1510 C 620 1440 900 1460 1024 1550 Z" fill="{WHITE}"/>
  <path d="M 1024 570 C 1148 470 1428 450 1672 520 L 1672 1510 C 1428 1440 1148 1460 1024 1550 Z" fill="{WHITE}"/>
</g>
<g {DET}>{left}{right}</g>
{sparkles([(300, 330, 58), (1750, 330, 50)], [(1024, 330, 16), (300, 1800, 14)])}'''
    return svg(grad('g', 290, 620, 1758, 1668), body)


def kunst_kultur():  # palette and brush
    pal = ('M 1000 400 C 1400 380 1720 650 1700 1000 C 1680 1340 1400 1570 1090 1610 C 890 1636 810 1530 870 1410 '
           'C 920 1310 870 1250 750 1270 C 510 1310 330 1160 350 900 C 372 610 660 420 1000 400 Z '
           + circle_path(1180, 1330, 100))
    body = f'''
<path d="{pal}" fill="url(#g)" fill-rule="evenodd" {OUT}/>
<path d="M 470 880 C 500 700 640 560 840 500 C 700 600 600 720 570 900 C 562 940 464 930 470 880 Z" fill="{WHITE}" opacity="0.85"/>
<g {THIN}>
  <circle cx="760" cy="960" r="112" fill="{WHITE}"/>
  <circle cx="1010" cy="690" r="108" fill="{YEL}"/>
  <circle cx="1320" cy="740" r="112" fill="{DEEP}"/>
  <circle cx="1490" cy="1020" r="104" fill="{INK}"/>
</g>
<g transform="translate(1440 1300) rotate(-38)" {OUT}>
  <rect x="-36" y="-10" width="72" height="560" rx="36" fill="{DEEP}"/>
  <rect x="-48" y="-150" width="96" height="160" rx="12" fill="{WHITE}"/>
  <path d="M -48 -150 C -84 -300 -30 -410 0 -480 C 30 -410 84 -300 48 -150 Z" fill="{YEL}"/>
</g>
{sparkles([(300, 440, 58), (1770, 400, 50)], [(330, 1560, 16), (640, 1700, 14)])}'''
    return svg(grad('g', 380, 420, 1640, 1560), body)


def technik():  # two gears
    body = f'''
<path d="{gear(1470, 600, 330, 240, 8, 100, 0.2)}" fill="{WHITE}" fill-rule="evenodd" {OUT}/>
<path d="{gear(900, 1150, 600, 470, 10, 200)}" fill="url(#g)" fill-rule="evenodd" {OUT}/>
<circle cx="900" cy="1150" r="330" {DET}/>
<path d="M 520 1050 C 560 900 660 800 810 760 C 700 840 630 930 600 1070 C 592 1104 510 1090 520 1050 Z" fill="{WHITE}" opacity="0.85"/>
<circle cx="1470" cy="600" r="170" {DET}/>
{sparkles([(330, 380, 58), (1740, 1340, 52)], [(1700, 1700, 16), (760, 330, 14)])}'''
    return svg(grad('g', 380, 620, 1420, 1680), body)


def popkultur():  # a star in sunglasses
    body = f'''
<path d="{star(1024, 1080, 760, 330)}" fill="url(#g)" {out(34)}/>
<g fill="none" stroke="{WHITE}" stroke-width="34" stroke-linecap="round" opacity="0.9"><path d="M 950 600 L 890 790"/><path d="M 800 870 L 640 880"/></g>
<g {OUT}>
  <path d="M 690 960 L 1358 960" fill="none"/>
  <rect x="730" y="950" width="250" height="170" rx="66" fill="{INK}"/>
  <rect x="1068" y="950" width="250" height="170" rx="66" fill="{INK}"/>
</g>
<g fill="none" stroke="{WHITE}" stroke-width="20" stroke-linecap="round">
  <path d="M 790 1060 L 850 1000"/><path d="M 1128 1060 L 1188 1000"/>
</g>
<path d="M 900 1240 Q 1024 1340 1148 1240" fill="none" {out(22)}/>
{sparkles([(330, 420, 62), (1740, 520, 54)], [(1660, 300, 16), (300, 1700, 14), (1760, 1700, 14)])}'''
    return svg(grad('g', 420, 420, 1640, 1740), body)


def sprache():  # two speech bubbles
    body = f'''
<path d="{bubble(830, 330, 1730, 1010, 150, (1380, 1540, 1620, 1190))}" fill="{WHITE}" {OUT}/>
<path d="M 1220 790 L 1350 440 L 1480 790 M 1263 676 L 1437 676" fill="none" {out(46)}/>
<path d="{bubble(320, 820, 1300, 1540, 150, (500, 680, 420, 1740))}" fill="url(#g)" {OUT}/>
<path d="M 400 1000 C 410 940 440 910 500 900 L 640 900 C 520 930 470 980 460 1060 C 456 1090 396 1050 400 1000 Z" fill="{WHITE}" opacity="0.85"/>
<g fill="{WHITE}" {THIN}>
  <circle cx="590" cy="1190" r="66"/><circle cx="810" cy="1190" r="66"/><circle cx="1030" cy="1190" r="66"/>
</g>
{sparkles([(330, 440, 58), (1700, 1420, 52)], [(620, 330, 16), (1500, 1740, 14)])}'''
    return svg(grad('g', 320, 820, 1300, 1560), body)


def logik_mathe():  # puzzle piece
    x0, y0, s, k, r = 440, 720, 900, 90, 150
    mx, my = x0 + s / 2, y0 + s / 2
    piece = (f'M {x0} {y0} L {mx - k} {y0} A {r} {r} 0 1 1 {mx + k} {y0} L {x0 + s} {y0} '
             f'L {x0 + s} {my - k} A {r} {r} 0 1 1 {x0 + s} {my + k} L {x0 + s} {y0 + s} '
             f'L {mx + k} {y0 + s} A {r} {r} 0 1 0 {mx - k} {y0 + s} L {x0} {y0 + s} '
             f'L {x0} {my + k} A {r} {r} 0 1 0 {x0} {my - k} Z')
    body = f'''
<g transform="rotate(-9 1024 1024)">
  <path d="{piece}" fill="url(#g)" {out(32)}/>
  <g fill="none" stroke="{WHITE}" stroke-width="34" stroke-linecap="round" opacity="0.9"><path d="M 530 1020 L 530 820"/><path d="M 600 810 L 760 810"/></g>
</g>
<g {THIN}>
  <path d="M 1560 300 L 1640 300 L 1640 400 L 1740 400 L 1740 480 L 1640 480 L 1640 580 L 1560 580 L 1560 480 L 1460 480 L 1460 400 L 1560 400 Z" fill="{YEL}"/>
</g>
{sparkles([(330, 420, 58), (1740, 1620, 52)], [(1340, 300, 14), (1500, 1800, 16)])}'''
    return svg(grad('g', 440, 450, 1500, 1620), body)


def weihnachten():  # Christmas tree
    body = f'''
<g {OUT}>
  <path d="M 938 1600 L 938 1822 Q 938 1856 972 1856 L 1076 1856 Q 1110 1856 1110 1822 L 1110 1600 Z" fill="{DEEP}"/>
  <path d="M 1024 960 C 916 1210 664 1492 404 1640 Q 536 1708 664 1662 Q 824 1736 1024 1672 Q 1224 1736 1384 1662 Q 1512 1708 1644 1640 C 1384 1492 1132 1210 1024 960 Z" fill="url(#g)"/>
  <path d="M 1024 620 C 938 830 742 1078 548 1222 Q 660 1276 764 1242 Q 884 1304 1024 1252 Q 1164 1304 1284 1242 Q 1388 1276 1500 1222 C 1306 1078 1110 830 1024 620 Z" fill="url(#g)"/>
  <path d="M 1024 372 C 962 540 824 716 690 832 Q 778 874 862 850 Q 942 902 1024 862 Q 1106 902 1186 850 Q 1270 874 1358 832 C 1224 716 1086 540 1024 372 Z" fill="url(#g)"/>
  <path d="{star(1024, 300, 168, 70)}" fill="{YEL}"/>
</g>
<g fill="{WHITE}">
  <path d="M 1000 478 C 958 590 880 690 772 792 C 884 742 968 650 1014 548 C 1022 520 1014 494 1000 478 Z"/>
  <path d="M 990 742 C 930 900 800 1060 640 1180 C 800 1118 930 980 1004 826 C 1016 792 1008 760 990 742 Z"/>
  <path d="M 984 1090 C 900 1290 720 1480 510 1606 C 720 1530 900 1370 1000 1180 C 1014 1144 1004 1108 984 1090 Z"/>
</g>
<g {DET}>
  <path d="M 862 724 Q 1024 796 1186 718"/>
  <path d="M 762 1070 Q 1024 1190 1288 1062"/>
  <path d="M 664 1462 Q 1024 1612 1380 1456"/>
</g>
<g {THIN}>
  <circle cx="1118" cy="742" r="40" fill="{WHITE}"/>
  <circle cx="1024" cy="1136" r="46" fill="{DEEP}"/>
  <circle cx="1228" cy="1094" r="42" fill="{YEL}"/>
  <circle cx="824" cy="1522" r="48" fill="{YEL}"/>
  <circle cx="1108" cy="1556" r="46" fill="{WHITE}"/>
  <circle cx="1330" cy="1484" r="46" fill="{DEEP}"/>
</g>
{sparkles([(520, 560, 58), (1560, 760, 46)], [(1470, 430, 16), (430, 1120, 14)])}'''
    return svg(grad('g', 700, 420, 1420, 1700), body)


# --------------------------------------------------------------------------
# "How it works" steps (homepage)
# --------------------------------------------------------------------------

def step_choose():  # a fan of cards, one picked
    card = 'x="644" y="504" width="760" height="1040" rx="76"'
    body = f'''
<g {OUT}>
  <rect {card} fill="{WHITE}" transform="rotate(-17 1024 1620)"/>
  <rect {card} fill="{YEL}" transform="rotate(17 1024 1620)"/>
  <rect {card} fill="url(#g)"/>
</g>
<path d="M 800 1040 L 960 1200 L 1250 850" fill="none" stroke="{INK}" stroke-width="170" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M 800 1040 L 960 1200 L 1250 850" fill="none" stroke="{WHITE}" stroke-width="104" stroke-linecap="round" stroke-linejoin="round"/>
{sparkles([(300, 380, 64), (1760, 420, 56)], [(1024, 300, 18), (300, 1760, 16)])}'''
    return svg(grad('g', 644, 504, 1404, 1544), body)


def step_build():  # slide, answer sheet and cheat sheet stacked
    lines = ''.join(f'<path d="M 660 {y} L 1180 {y}"/>' for y in (640, 760, 880))
    body = f'''
<g {OUT}>
  <rect x="820" y="330" width="820" height="980" rx="56" fill="{YEL}" transform="rotate(9 1230 820)"/>
  <rect x="540" y="440" width="820" height="1040" rx="56" fill="{WHITE}" transform="rotate(-5 950 960)"/>
</g>
<g {DET} transform="rotate(-5 950 960)">{lines}</g>
<rect x="380" y="1010" width="1180" height="700" rx="70" fill="url(#g)" {OUT}/>
<g fill="{WHITE}">
  <rect x="500" y="1150" width="620" height="84" rx="42"/>
  <rect x="500" y="1320" width="420" height="84" rx="42"/>
  <rect x="500" y="1490" width="780" height="84" rx="42"/>
</g>
{sparkles([(300, 520, 64), (1780, 1500, 56)], [(520, 300, 18), (1740, 1860, 16)])}'''
    return svg(grad('g', 380, 1010, 1560, 1710), body)


def step_present():  # screen on a stand
    body = f'''
<g fill="none" {out(44)}>
  <path d="M 1024 1300 L 1024 1540"/><path d="M 1024 1540 L 760 1800"/><path d="M 1024 1540 L 1288 1800"/>
</g>
<g {OUT}>
  <rect x="330" y="430" width="1388" height="880" rx="64" fill="url(#g)"/>
  <rect x="270" y="350" width="1508" height="110" rx="50" fill="{WHITE}"/>
  <path d="M 900 650 L 1250 870 L 900 1090 Z" fill="{WHITE}"/>
</g>
{sparkles([(300, 1560, 64), (1760, 1640, 56)], [(1560, 250, 18), (420, 240, 16)])}'''
    return svg(grad('g', 330, 430, 1718, 1310), body)


STEPS = {
    'step-choose': step_choose,
    'step-build': step_build,
    'step-present': step_present,
}

ICONS = {
    'allgemeinwissen': allgemeinwissen,
    'sport': sport,
    'geschichte': geschichte,
    'geographie': geographie,
    'film-tv': film_tv,
    'musik': musik,
    'wissenschaft': wissenschaft,
    'essen-trinken': essen_trinken,
    'literatur': literatur,
    'kunst-kultur': kunst_kultur,
    'technik': technik,
    'popkultur': popkultur,
    'sprache': sprache,
    'logik-mathe': logik_mathe,
    'weihnachten': weihnachten,
}

if __name__ == '__main__':
    public = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
    for name in sys.argv[1:] or [*ICONS, *STEPS]:
        if name in STEPS:
            path = os.path.join(public, 'marketing', f'{name}.svg')
            content = STEPS[name]()
        else:
            os.makedirs(os.path.join(public, 'categories', name), exist_ok=True)
            path = os.path.join(public, 'categories', name, 'icon.svg')
            content = ICONS[name]()
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print('wrote', name)
