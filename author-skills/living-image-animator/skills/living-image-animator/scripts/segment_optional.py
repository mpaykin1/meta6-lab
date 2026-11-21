#!/usr/bin/env python3
"""Optional Grounding DINO + SAM2 semantic mask adapter (large ML deps excluded).

Install: pip install torch torchvision transformers sam2 huggingface-hub pillow numpy
CUDA is recommended. Model downloads require network and their own licenses.
"""
import argparse, json, re
from pathlib import Path
import numpy as np
from PIL import Image


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('image',type=Path)
    parser.add_argument('--labels',required=True,help='Comma-separated visible classes, e.g. person,cat,tree,lamp')
    parser.add_argument('--out',type=Path,default=Path('auto_masks'))
    parser.add_argument('--threshold',type=float,default=.30)
    a=parser.parse_args()
    try:
        import torch
        from transformers import pipeline
        from sam2.sam2_image_predictor import SAM2ImagePredictor
    except ImportError as exc:
        raise SystemExit('Missing GPU model deps. Install torch, transformers, and facebookresearch/sam2. '+str(exc))
    a.out.mkdir(parents=True,exist_ok=True)
    im=Image.open(a.image).convert('RGB')
    labels=[s.strip() for s in a.labels.split(',') if s.strip()]
    detector=pipeline(task='zero-shot-object-detection',model='IDEA-Research/grounding-dino-tiny',device=0 if torch.cuda.is_available() else -1)
    det=detector(im,candidate_labels=labels,threshold=a.threshold)
    segmenter=SAM2ImagePredictor.from_pretrained('facebook/sam2-hiera-small')
    segmenter.set_image(np.asarray(im))
    records=[]
    for i,item in enumerate(det):
        box=item['box']
        points=np.array([box['xmin'],box['ymin'],box['xmax'],box['ymax']],dtype=np.float32)
        masks,scores,_=segmenter.predict(box=points[None,:],multimask_output=True)
        mask=masks[int(np.argmax(scores))]
        tag=re.sub(r'[^a-zA-Z0-9_-]+','_',item['label']).strip('_') or 'obj'
        name=f'{tag}_{i:02d}'
        Image.fromarray((mask.astype(np.uint8)*255)).save(a.out/f'{name}.png')
        records.append({'id':name,'role':item['label'],'mask':f'{name}.png','confidence':float(item['score']),'motion':{'type':'idle','period':2.1+i*.37,'phase':(i*.17)%1}})
    (a.out/'detections.json').write_text(json.dumps({'actors':records},ensure_ascii=False,indent=2),'utf8')
    print(f'Extracted {len(records)} object masks. Review fine masks and define authentic actor poses before publishing a complete animation.')

if __name__=='__main__':main()
