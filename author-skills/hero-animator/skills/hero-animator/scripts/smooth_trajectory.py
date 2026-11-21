#!/usr/bin/env python3
"""Seamless 2D sprite motion tracks: fixed source art, C2 ease and bounded velocity.

Call these pure functions on independent authored sprite layers. No frame reimagining;
no interpolation between distinct hero identities, angles or action states.
"""
from __future__ import annotations
from dataclasses import dataclass
import math

TWOPI=2*math.pi


def ease5(x:float)->float:
    x=min(1.0,max(0.0,float(x)))
    return x*x*x*(x*(x*6.-15.)+10.)


def envelope(t:float,start:float,end:float,attack:float=.8,release:float=.8)->float:
    """Exact zero with continuous velocity and acceleration at action boundaries."""
    if not all(math.isfinite(q) for q in (t,start,end,attack,release)):
        raise ValueError('Non-finite timing')
    if end<=start or attack<=0 or release<=0:
        raise ValueError('Invalid envelope')
    return ease5((t-start)/attack)*ease5((end-t)/release)


def cyclic_phase(t:float,duration:float,cycles:int,offset:float=0.)->float:
    """Periodically coincident position AND derivative at 0 and duration.

    Number of cycles must be integer, never a free floating-point frequency.
    """
    if not math.isfinite(t) or not duration>0 or cycles<1 or int(cycles)!=cycles:
        raise ValueError('Cycle must be finite, positive and integral')
    return TWOPI*(cycles*t/duration)+offset


def pulse(t:float,duration:float,cycles:int,offset:float=0.)->float:
    return math.sin(cyclic_phase(t,duration,cycles,offset))


def smooth_motion(t:float,duration:float,cycles:int,phase:float,
                  action_windows:tuple[tuple[float,float],...],amount:float,
                  breathing_amount:float=.12)->float:
    """Independent breath and action pulses; no character teleports at boundaries."""
    if amount < 0 or breathing_amount<0:raise ValueError('Negative motion')
    if any(a<0 or b>duration for a,b in action_windows):
        raise ValueError('Action outside loop')
    active=max((envelope(t,a,b) for a,b in action_windows),default=0.)
    return amount*(breathing_amount*pulse(t,duration,3,phase)+
                   active*pulse(t,duration,cycles,phase))


@dataclass(frozen=True)
class LayerIdentity:
    hero_id:str
    source_sha256:str
    action:str
    facing:str

    def valid(self)->bool:
        return (bool(self.hero_id.strip()) and len(self.source_sha256)==64 and
                all(c in '0123456789abcdef' for c in self.source_sha256.lower()) and
                bool(self.action.strip()) and bool(self.facing.strip()))


def enforce_no_jerks(points:list[tuple[float,float]], max_step_px:float=2.0,
                     max_acceleration_px:float=1.3, loop=True)->None:
    """Fail closed on per-frame centroid jumps and discontinuities.

    Pass points at the exact output GIF frame rate, each sprite separately.
    Use fixed source-pixel masks; never infer actor pose from the full scene.
    """
    if len(points)<4:raise ValueError('At least 4 tracked frames required')
    if max_step_px<=0 or max_acceleration_px<=0:raise ValueError('Bad motion limits')
    pts=[tuple(map(float,p)) for p in points]
    if any(not math.isfinite(x) or not math.isfinite(y) for x,y in pts):
        raise ValueError('Non-finite sprite position')
    count=len(pts)
    deltas=[]
    for i in range(count if loop else count-1):
        a,b=pts[i],pts[(i+1)%count]
        d=(b[0]-a[0],b[1]-a[1]);deltas.append(d)
        if math.hypot(*d)>max_step_px:
            raise ValueError(f'ABRUPT SPRITE JUMP frame={i}, displacement={math.hypot(*d):.2f} px')
    for i in range(len(deltas) if loop else len(deltas)-1):
        a,b=deltas[i],deltas[(i+1)%len(deltas)]
        accel=math.hypot(b[0]-a[0],b[1]-a[1])
        if accel>max_acceleration_px:
            raise ValueError(f'ABRUPT MOTION ACCELERATION frame={i}, accel={accel:.2f} px')
