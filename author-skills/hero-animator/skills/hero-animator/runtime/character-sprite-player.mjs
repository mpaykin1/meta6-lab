/** Unwarped, full-frame RGBA sprite animation contract.
 * One canonical hero ID, per-action/view original PNGs. All character motion is
 * swapping authored images and moving the entire unmodified quad. No morph,
 * body-part motion, RIFE, optical flow, scaling or rotational animation.
 */
export function createCharacterFramePlayer({heroId, clips, setTexture, setPosition,
  onMissing=message=>{throw Error(message)}}={}){
  if(!heroId || !clips || typeof setTexture!=='function')throw Error('Hero ID, action clips and texture binding required');
  let action='idle',view='front',elapsed=0,frame=-1;
  const readClip=()=>{
    const key=`${action}_${view}`;const clip=clips[key];
    if(!clip?.approved || clip.hero_id!==heroId || !Array.isArray(clip.frames)||!clip.frames.length)
      return onMissing(`BLOCKED: no approved original art for ${heroId} ${key}`);
    return clip;
  };
  function update(dt,position){
    if(!Number.isFinite(dt)||dt<0||dt>0.2)throw Error('Invalid animation delta');
    const clip=readClip();elapsed+=dt;
    const index=clip.loop?Math.floor(elapsed*(clip.fps||8))%clip.frames.length:
      Math.min(clip.frames.length-1,Math.floor(elapsed*(clip.fps||8)));
    if(index!==frame){setTexture(clip.frames[index]);frame=index;}
    if(position && setPosition)setPosition(position); // rigid whole-sprite position, no body deformation
    return {heroId,action,view,frame};
  }
  return {setState(nextAction,nextView=view){
    if(typeof nextAction!=='string'||typeof nextView!=='string')throw Error('Invalid action/view');
    if(nextAction===action&&nextView===view)return;
    action=nextAction;view=nextView;elapsed=0;frame=-1;readClip();
  },update,get state(){return {heroId,action,view,frame}}};
}
