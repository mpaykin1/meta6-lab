// Shared Keeper-style in-world NPC dialogue presentation, not a fullscreen modal.
// Visual contract: owner Twilight Island's .npc-say bubble (057/064).
export const KEEPER_BUBBLE_CSS=`
.npc-say{position:fixed;z-index:99;max-width:min(320px,72vw);min-width:120px;
 background:rgba(12,16,30,.86);color:#f8eec8;
 box-shadow:inset 0 0 0 2px rgba(127,230,255,.32),0 4px 0 #000,0 0 26px rgba(127,230,255,.18);
 padding:8px 13px 10px;transform:translate(-50%,-100%);
 font-family:'Pixelify Sans',monospace;font-size:16px;line-height:1.35;
 pointer-events:none;text-align:left;transition:opacity .22s ease;}
.npc-say::after{content:'';position:absolute;bottom:-10px;left:calc(50% - 9px);
 border-left:9px solid transparent;border-right:9px solid transparent;
 border-top:10px solid rgba(12,16,30,.86);filter:drop-shadow(0 2px 0 #000);}
.npc-say .npc-say-name{display:block;color:#9fe8ff;font-size:11px;
 letter-spacing:.22em;font-weight:700;text-transform:uppercase;
 text-shadow:0 0 12px rgba(127,230,255,.42);margin:0 0 4px;}
.npc-say .npc-say-text{margin:0;min-height:1.35em;color:#f8eec8;
 font:400 16px/1.35 'Pixelify Sans',monospace;overflow-wrap:anywhere;}
.npc-say .npc-say-choices{display:flex;gap:7px;justify-content:center;margin-top:9px;
 pointer-events:auto;flex-wrap:wrap;}
.npc-say .npc-say-choices[hidden]{display:none!important;}
.npc-say .btn{font:700 15px/1.2 'Pixelify Sans',monospace;color:#f8eec8;
 background:#20293e;border:0;box-shadow:inset 0 0 0 2px rgba(248,238,200,.48);
 border-radius:0;padding:7px 9px;min-width:85px;min-height:34px;cursor:pointer;}
.npc-say .btn:focus-visible{outline:2px solid #9fe8ff;outline-offset:3px;}
`;
// Keep real 3D world anchoring, but never put the usable choice buttons
// outside a narrow phone viewport while the cinematic camera eases into place.
export function keeperBubbleScreenPoint(ndcX,ndcY,width,height,bubbleWidth,bubbleHeight){
 const bound=(v,a,b)=>Math.min(Math.max(v,a),Math.max(a,b));
 const x=(ndcX*.5+.5)*width,y=(-ndcY*.5+.5)*height;
 return {
  x:bound(x,bubbleWidth/2+6,width-bubbleWidth/2-6),
  y:bound(y,bubbleHeight+16,height-14)
 };
}
export function createKeeperBubble({THREE,camera}){
 const style=document.createElement('style');style.dataset.originalKeeperBubble='npc-say';
 style.textContent=KEEPER_BUBBLE_CSS;document.head.append(style);
 const root=document.createElement('div');root.className='npc-say';
 root.hidden=true;root.open=false;root.setAttribute('role','status');
 root.setAttribute('aria-live','polite');
 const name=document.createElement('span');name.className='npc-say-name';
 const text=document.createElement('p');text.className='npc-say-text';
 root.append(name,text);document.body.append(root);
 const v=new THREE.Vector3();
 let fadeTimer=null;
 function show(title,body=''){
  if(fadeTimer!==null){clearTimeout(fadeTimer);fadeTimer=null}
  name.textContent=title;text.textContent=body;root.hidden=false;root.open=true;root.style.opacity='1';
 }
 function hide(){
  root.style.opacity='0';root.open=false;
  if(fadeTimer!==null)clearTimeout(fadeTimer);
  fadeTimer=setTimeout(()=>{if(!root.open)root.hidden=true;fadeTimer=null},240);
 }
 root.showModal=()=>show(name.textContent,text.textContent);
 root.close=hide;
 function place(x,y,z){
  v.set(x,y,z).project(camera);
  if(!Number.isFinite(v.x)||!Number.isFinite(v.y)||v.z<=-1||v.z>=1){
   root.style.opacity='0';return false;
  }
  const point=keeperBubbleScreenPoint(v.x,v.y,window.innerWidth,window.innerHeight,
    root.offsetWidth||240,root.offsetHeight||115);
  root.style.left=point.x.toFixed(1)+'px';
  root.style.top=point.y.toFixed(1)+'px';
  root.style.opacity='1';return true;
 }
 function dispose(){if(fadeTimer!==null)clearTimeout(fadeTimer);root.remove();style.remove()}
 return {root,name,text,show,hide,place,dispose};
}
