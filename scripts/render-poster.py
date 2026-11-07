#!/usr/bin/env python3
"""Reproducible, entirely self-authored prerendered faceless shard bust poster."""
from PIL import Image, ImageDraw, ImageFilter
import math, random
from pathlib import Path
r=random.Random(0x5aada12)
W,H=1600,1000
im=Image.new('RGB',(W,H),(5,6,10))
p=im.load(); cx,cy=1100,465
for y in range(H):
    for x in range(W):
        d=((x-cx)/(W*.65))**2+((y-cy)/(H*.9))**2
        glow=max(0,1-d)
        p[x,y]=(int(5+glow*9),int(6+glow*16),int(10+glow*23))
back=Image.new('RGBA',(W,H))
draw=ImageDraw.Draw(back,'RGBA')
for i in range(24000):
    a=r.random()*math.tau; rad=math.sqrt(r.random())*650
    x=cx+math.cos(a)*rad*1.1;y=cy+math.sin(a)*rad*.73
    if x<0 or x>W or y<0 or y>H:continue
    dist=rad/650;v=int(110*(1-dist)**2)
    if v<8:continue
    col=r.choice([(136,175,194,v),(196,204,201,v),(222,187,119,int(v*.7))])
    draw.ellipse((x,y,x+r.choice([1,1,2]),y+r.choice([1,1,2])),fill=col)
# faint governance rings
for k in range(3):
    ex,ey=(310+k*54),(350+k*25)
    pts=[]
    for q in range(280):
        t=q/279*2*math.pi
        x=cx+math.cos(t)*ex+math.sin(t*2)*9
        y=cy+math.sin(t)*ey*.75+math.cos(t*1.3)*22
        pts.append((x,y))
    draw.line(pts,fill=(199,187,146,28+k*9),width=2)
im=Image.alpha_composite(im.convert('RGBA'),back)
draw=ImageDraw.Draw(im,'RGBA')
# bust shards. Head sphere + throat + chest/shoulders.
def sample():
    which=r.random()
    a=r.random()*math.tau; v=r.uniform(-1,1)
    if which<.49:
        # head: top at 160, chin at 515
        phi=math.acos(v); x=.36*math.sin(phi)*math.cos(a);z=.35*math.sin(phi)*math.sin(a);y=.56+.50*math.cos(phi)
    elif which<.58:
        x=.19*math.cos(a);z=.18*math.sin(a);y=r.uniform(-.10,.28)
    else:
        t=r.random(); y=-.13-.9*t
        radius=.28+.65*math.sin(t*math.pi*.79)
        x=radius*math.cos(a);z=.43*math.sin(a)
    return x,y,z
shards=[]
for i in range(5500):
    x,y,z=sample()
    sx=cx+x*380+z*65;sy=cy-y*335-z*30
    if not 0<=sx<W or not 0<=sy<H:continue
    shards.append((z,sx,sy,x,y))
shards.sort()
for z,x,y,ox,oy in shards:
    depth=(z+.5)/1.0
    length=r.uniform(2,12)*(0.7+depth*.5)
    width=r.uniform(1,3.3)
    theta=r.uniform(-.65,.65)
    dx=math.sin(theta)*length;dy=-math.cos(theta)*length
    lum=int(80+max(0,depth)*95+r.uniform(-25,32))
    base=(max(40,int(lum*.73)),max(60,int(lum*.92)),min(236,int(lum*1.12)),int(175+depth*55))
    if r.random()<.105:base=(222,186,119,190)
    poly=[(x-width,y),(x+width,y+1),(x+dx*.36,y+dy),(x+dx-width,y+dy*1.1)]
    draw.polygon(poly,fill=base)
    draw.line([(x-width,y),(x+dx*.36,y+dy)],fill=(218,229,224,int(120+depth*80)),width=1)
# soft centre glint and stray crystalline fragments.
for i in range(650):
    x=cx+r.gauss(0,245);y=cy+r.gauss(0,280)
    if r.random()<.5:continue
    length=r.randrange(2,12)
    draw.line([(x,y),(x+r.uniform(-5,5),y-length)],fill=(178,207,207,r.randrange(40,140)),width=1)
# mild sharpen after downsample
im=im.convert('RGB')
out=Path('/mnt/data/shards-inc-site/public/images/mind-poster.webp')
im.save(out,format='WEBP',quality=79,method=6)
print(out,out.stat().st_size)
