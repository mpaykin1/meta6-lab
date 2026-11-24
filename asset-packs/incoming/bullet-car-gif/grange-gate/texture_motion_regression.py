#!/usr/bin/env python3
"""Exercise the actual P29/P30 code on an original textured transparent frame."""
import sys
import numpy as np
import cv2
from PIL import Image
from texture_motion_gate import texture_parity, motion_gate

def main(path):
    f=np.array(Image.open(path).convert('RGBA')); m=f[...,3]>0
    assert texture_parity(f,f,m)['pass'], 'original rejected'
    blur=f.copy();blur[...,:3]=cv2.GaussianBlur(blur[...,:3],(13,13),3)
    assert not texture_parity(blur,f,m)['pass'], 'texture loss escaped'
    def moved(dx,dy):
        return cv2.warpAffine(f,np.float32([[1,0,dx],[0,1,dy]]),(f.shape[1],f.shape[0]),flags=cv2.INTER_NEAREST)
    def gate(fs):return motion_gate(fs,[x[...,3]>0 for x in fs],[100]*len(fs),action='drive')
    smooth=[moved(round(4*np.sin(t)),round(4*np.cos(t))) for t in np.arange(16)*2*np.pi/16]
    assert gate(smooth)['pass'], 'smooth trajectory rejected'
    assert not gate([moved(6 if i%2 else -6,0) for i in range(8)])['pass'], 'jerk escaped'
    fs=[]
    for i in range(8):
        g=f.copy();g[...,:3]=np.where(g[...,3:4]>0,np.clip(g[...,:3].astype(np.int16)+(60 if i%2 else 0),0,255),g[...,:3]);fs.append(g)
    assert not gate(fs)['pass'], 'flicker escaped'
    print('P29/P30: original, smooth motion PASS; blur, jerk, flicker rejected')
if __name__=='__main__':main(sys.argv[1])
