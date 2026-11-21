/** Node graph to explicit events + Ink choices. No execution of linked mechanic source. */
import { InkDialogue } from './ink-story.js';
export class FusionStoryFlow {
  constructor({world,manifest,onDisplay=()=>{},onFinish=()=>{},onScene=()=>{}}) {
    this.world=world;
    this.nodes=new Map(world.nodes.map(n=>[n.id,n]));
    this.manifest=new Map((manifest?.stories||[]).map(s=>[s.id,s]));
    this.onDisplay=onDisplay;this.onFinish=onFinish;this.onScene=onScene;
    this.flags=new Map();this.items=new Map();
    this.ink=null;this.frame=null;this.current='';this.active=true;
  }
  target(port='flow') {
    const links=this.world.connections.filter(e=>e.source===this.current && e.sourceOutput===port && e.targetInput==='flow');
    if(links.length!==1)throw new Error(`Ожидался ровно один переход ${this.current}:${port}`);
    return links[0].target;
  }
  async begin() {
    const nodes=[...this.nodes.values()].filter(n=>n.type==='start');
    if(nodes.length!==1)throw new Error('Ровно один узел начала обязателен');
    return this.enter(nodes[0].id);
  }
  async enter(id) {
    if(!this.active)return;
    let guard=0;
    while(guard++ < this.nodes.size+2) {
      const n=this.nodes.get(id);
      if(!n)throw new Error('Неизвестный узел '+id);
      this.current=id;this.ink=null;this.frame=null;
      if(n.type==='start') {id=this.target();continue;}
      if(n.type==='branch') {
        const [kind,key]=n.condition.split(':');
        const value=(kind==='flag'?this.flags:this.items).get(key);
        id=this.target(Boolean(value)?'yes':'no');continue;
      }
      if(n.type==='ending') {
        this.active=false;
        this.onFinish({title:n.title,flags:[...this.flags],items:[...this.items]});
        return;
      }
      if(n.type==='scene'||n.type==='mechanic') {
        this.onScene(n);
        this.onDisplay({type:'scene',node:n,notice:n.type==='mechanic'
          ? 'Найдена игровая механика. Исходный код не запускается автоматически.' : ''});
        return;
      }
      if(n.type==='dialogue') {
        const rec=this.manifest.get(n.story_id);
        if(!rec || rec.source_sha256!==n.story_sha256 || rec.approved_for_reuse!==true)
          throw new Error('Ink история отсутствует или не утверждена');
        this.ink=await InkDialogue.load(rec,event=>{
          if(event.type==='state') {
            const [kind,key]=event.target.split(':');
            (kind==='flag'?this.flags:this.items).set(key,Boolean(event.value));
          }
        });
        this.frame=this.ink.next();
        this.onDisplay({type:'dialogue',node:n,frame:this.frame});
        return;
      }
      throw new Error('Неожиданный узел '+n.type);
    }
    throw new Error('Сюжет содержит слишком много автоматических переходов');
  }
  async interact() {
    const type=this.nodes.get(this.current)?.type;
    if(type==='dialogue' && this.frame?.complete)return this.enter(this.target());
    if(type==='scene'||type==='mechanic')return this.enter(this.target());
  }
  choose(i) {
    if(!this.ink || !Number.isInteger(i))throw new Error('Выбор недоступен');
    this.frame=this.ink.choose(i);
    this.onDisplay({type:'dialogue',node:this.nodes.get(this.current),frame:this.frame});
  }
  save() {
    const state={current:this.current,flags:[...this.flags],items:[...this.items],
      ink:this.ink?.save()||null,active:this.active,
      fingerprint:this.world.nodes.map(n=>[n.id,n.story_sha256||'']).join('|')};
    return JSON.stringify(state);
  }
  async restore(json) {
    if(typeof json!=='string'||json.length>2_000_000)throw new Error('Некорректное сохранение');
    const data=JSON.parse(json);
    const fingerprint=this.world.nodes.map(n=>[n.id,n.story_sha256||'']).join('|');
    if(data.fingerprint!==fingerprint || !this.nodes.has(data.current))
      throw new Error('Сохранение другой версии игры');
    this.flags=new Map(data.flags||[]);this.items=new Map(data.items||[]);
    this.active=true;
    await this.enter(data.current);
    if(this.ink && data.ink) {
      this.frame=this.ink.restore(data.ink);
      this.onDisplay({type:'dialogue',node:this.nodes.get(this.current),frame:this.frame});
    }
  }
}
