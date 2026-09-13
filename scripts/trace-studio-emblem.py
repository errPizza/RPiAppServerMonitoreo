"""Build animation geometry from the actual PNG (development-time tool only).
Run with opencv-contrib-python-headless installed. The PNG is never modified.
"""
from pathlib import Path
import json
import cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
size = 384
image = cv2.resize(cv2.imread(str(root / 'assets/another-game-more-studio-emblem.png')), (size, size), interpolation=cv2.INTER_AREA)
foreground = (image.max(axis=2) > 70).astype(np.uint8) * 255
skeleton = cv2.ximgproc.thinning(foreground)
distance = cv2.distanceTransform(foreground, cv2.DIST_L2, 5)
pixels = set(map(tuple, np.argwhere(skeleton > 0)))
neighbors = {}
for y, x in pixels:
    nearby=[]
    for dy in (-1,0,1):
        for dx in (-1,0,1):
            if not(dx or dy) or (y+dy,x+dx) not in pixels: continue
            if dx and dy and ((y,x+dx) in pixels or (y+dy,x) in pixels): continue
            nearby.append((y+dy,x+dx))
    neighbors[y,x]=sorted(nearby)
visited=set()
def edge(a,b): return tuple(sorted((a,b)))
def walk(a,b):
    result=[a,b]; visited.add(edge(a,b))
    while len(neighbors[b])==2:
        c=next(p for p in neighbors[b] if p!=a)
        if edge(b,c) in visited: break
        visited.add(edge(b,c));result.append(c);a,b=b,c
    return result
paths=[]
for a in sorted(pixels):
    if len(neighbors[a]) != 2:
        if not neighbors[a]: paths.append([a,a])
        for b in neighbors[a]:
            if edge(a,b) not in visited: paths.append(walk(a,b))
for a in sorted(pixels):
    for b in neighbors[a]:
        if edge(a,b) not in visited: paths.append(walk(a,b))
# Merge nearby branches into 56 fixed trajectories, preserving every skeleton edge.
# Short connections traverse black space and are clipped to the original image
# while consuming it, so they cannot create extra marks on the emblem.
paths.sort(key=lambda p: -len(p))
while len(paths)>56:
    small=paths.pop()
    choices=[]
    for i,large in enumerate(paths):
        for flip_a in (False,True):
            for flip_b in (False,True):
                a=large[0] if flip_a else large[-1]
                b=small[-1] if flip_b else small[0]
                choices.append(((a[0]-b[0])**2+(a[1]-b[1])**2,i,flip_a,flip_b))
    _,i,fa,fb=min(choices)
    paths[i]=(paths[i][::-1] if fa else paths[i])+(small[::-1] if fb else small)

covered=np.zeros_like(foreground)
tracks=[]
scale=240/size
for points in paths:
    coords=np.array([(x,y) for y,x in points],np.int32)
    radius=max(float(distance[y,x]) for y,x in points)+2.0
    approx=cv2.approxPolyDP(coords.reshape(-1,1,2),.6,False).reshape(-1,2)
    if len(approx)==1: approx=np.concatenate([approx,approx+np.array([[.01,0]])])
    width=radius*2
    cv2.polylines(covered,[approx.astype(np.int32)],False,255,int(np.ceil(width)),cv2.LINE_8)
    for x,y in approx.astype(int): cv2.circle(covered,(x,y),int(np.ceil(radius)),255,-1)
    colors=[image[y,x] for y,x in points]
    red=sum(int(r)>int(g)*1.6 and int(r)>int(b)*1.6 for b,g,r in colors)>len(colors)*.4
    tracks.append({'points':[[round(float(x)*scale-120,3),round(float(y)*scale-120,3)] for x,y in approx], 'eraseWidth':round(width*scale,3), 'red':red})
visible=np.count_nonzero(foreground)
coverage=np.count_nonzero((covered>0)&(foreground>0))/visible
assert coverage>.999, coverage
out=root/'src/components/intro/studioEmblemContours.json'
out.write_text(json.dumps({'sourceSize':size,'coverage':coverage,'tracks':tracks},separators=(',',':'))+'\n')
print(f'{len(tracks)} trajectories; {sum(len(t["points"]) for t in tracks)} points; foreground coverage {coverage:.3%}')
