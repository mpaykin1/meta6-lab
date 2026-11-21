"""OpenCV Farneback temporal fingerprint for Game Style Forge.

Computes sampled *adjacent-frame* optical flow, not discontinuous differences
between widely spaced contact-sheet frames. Quantifies image motion only:
it does not infer true camera movement, object identity, depth, or gameplay speed.
"""
from __future__ import annotations

from pathlib import Path


def motion_fingerprint(video: Path, indices, dest: Path):
    import cv2
    import numpy as np

    selected = sorted({int(i) for i in indices if i >= 1})
    if not selected:
        return {"status": "insufficient_adjacent_frames", "sample_pairs": 0}
    # Bound CPU and transient memory. Use adjacent frames sampled across the clip.
    positions = [selected[i] for i in np.unique(np.linspace(0, len(selected)-1, min(8,len(selected)), dtype=int))]
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        return {"status": "video_decode_failed", "sample_pairs": 0}

    median_flows = []
    motion_mags = []
    moving_ratios = []
    coherent_ratios = []
    local_ratios = []
    chosen_vis = None
    for idx in positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0,int(idx)-1))
        ok1, prev = cap.read()
        ok2, curr = cap.read()
        if not ok1 or not ok2:
            continue
        prev = cv2.cvtColor(cv2.resize(prev, (160,90), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(cv2.resize(curr, (160,90), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
        temporal_gap = float(np.mean(cv2.absdiff(prev, curr_gray)))/255.0
        # Ignore clear cuts and corrupt decoded frames: the flow would be meaningless.
        if temporal_gap > .43:
            continue
        flow = cv2.calcOpticalFlowFarneback(prev, curr_gray, None,
                                            .5, 3, 15, 3, 5, 1.2, 0)
        # Slightly crop the HUD borders; values describe image motion, not the player.
        region = flow[10:82, 10:150, :]
        med = np.median(region.reshape(-1,2), axis=0)
        velocity = np.linalg.norm(region, axis=2)
        residual = np.linalg.norm(region - med, axis=2)
        moving = velocity > .35
        # Translation-like optical flow can originate from camera pan or full-screen motion.
        coherent = ((residual < .65) & moving)
        median_flows.append(med)
        motion_mags.append(float(np.percentile(velocity,75)))
        moving_ratios.append(float(moving.mean()))
        coherent_ratios.append(float(coherent.mean()))
        local_ratios.append(float(((residual > .8) & moving).mean()))
        if chosen_vis is None or float(np.percentile(velocity,75)) > chosen_vis[0]:
            view=cv2.cvtColor(curr_gray, cv2.COLOR_GRAY2BGR)
            for y in range(12,82,11):
                for x in range(12,150,12):
                    vx,vy=flow[y,x]
                    cv2.arrowedLine(view, (x,y), (int(round(x+vx*2)),int(round(y+vy*2))), (112,205,180), 1, tipLength=.25)
            chosen_vis=(float(np.percentile(velocity,75)),view)
    cap.release()

    if not motion_mags:
        return {"status":"insufficient_continuous_frames", "sample_pairs":0}
    flow_med = np.median(np.stack(median_flows), axis=0)
    magnitude = float(np.median(motion_mags))
    if chosen_vis is not None:
        cv2.imwrite(str(dest/'motion_vectors.jpg'), cv2.resize(chosen_vis[1],(960,540),interpolation=cv2.INTER_NEAREST))
    return {
        "status":"measured",
        "algorithm":"OpenCV Farneback dense optical flow; adjacent sampled frame pairs",
        "opencv_version":cv2.__version__,
        "sample_pairs":len(motion_mags),
        "median_flow_xy_pixels_per_frame_160x90":[round(float(flow_med[0]),3),round(float(flow_med[1]),3)],
        "p75_flow_magnitude_pixels_per_frame_160x90":round(magnitude,3),
        "moving_pixel_fraction":round(float(np.median(moving_ratios)),3),
        "translation_like_pixel_fraction":round(float(np.median(coherent_ratios)),3),
        "local_motion_pixel_fraction":round(float(np.median(local_ratios)),3),
        "temporal_activity_0_to_1":round(float(np.clip(magnitude/5.0,0,1)),3),
        "caution":"Appearance-only measurements; global flow is not proven camera motion; moving regions are not identified actors."
    }


def lab_palette(color_samples, size=6):
    """Small deterministic K-means in perceptual Lab, output sRGB HTML colors."""
    import cv2
    import numpy as np
    px=np.concatenate(color_samples).astype(np.uint8).reshape(-1,3)
    if len(px)>4600:
        px=px[np.linspace(0,len(px)-1,4600,dtype=int)]
    lab=cv2.cvtColor(px.reshape(-1,1,3), cv2.COLOR_RGB2LAB).reshape(-1,3).astype(np.float32)
    k=min(size,len(lab))
    if k<=0:return []
    cv2.setRNGSeed(3811)
    _, labels, centers=cv2.kmeans(lab,k,None,(cv2.TERM_CRITERIA_EPS+cv2.TERM_CRITERIA_MAX_ITER,25,.2),2,cv2.KMEANS_PP_CENTERS)
    rgb=cv2.cvtColor(np.clip(centers,0,255).astype(np.uint8).reshape(-1,1,3),cv2.COLOR_LAB2RGB).reshape(-1,3)
    counts=np.bincount(labels.reshape(-1),minlength=k)
    return ['#'+''.join(f'{int(v):02x}' for v in rgb[i]) for i in np.argsort(counts)[::-1]]
