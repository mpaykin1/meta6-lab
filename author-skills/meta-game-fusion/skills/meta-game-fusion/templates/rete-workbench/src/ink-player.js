/** Graph + inkjs playable narrative preview; mechanics/assets are descriptive, not executable. */
import { InkDialogue } from './ink-story.js';

export class NarrativePreview {
  constructor(panel, onInfo = ()=>{}) {
    this.root = panel;
    this.info = onInfo;
    this.active = false;
    this.flags = new Map(); this.items = new Map();
    this.storySaves = {};
    this.frame = null;
    this.ink = null;
    this.current = null;
    this.graph = null;
    this.stories = new Map();
    this.root.querySelector('[data-close]').addEventListener('click',()=>this.close());
    this.root.querySelector('[data-next]').addEventListener('click',()=>this.follow('flow'));
    this.root.querySelector('[data-save]').addEventListener('click',()=>this.save());
    this.root.querySelector('[data-load]').addEventListener('click',()=>this.restore().catch(e=>this.error(e)));
  }
  error(e) {this.info(e.message || String(e));this.root.querySelector('[data-message]').textContent=String(e.message||e)}
  async start(graph, stories) {
    this.graph=graph;
    this.stories=new Map(stories.map(s=>[s.id,s]));
    this.flags.clear();this.items.clear();this.storySaves={};this.frame=null;this.ink=null;
    this.active=true;this.root.hidden=false;
    const starts=graph.nodes.filter(n=>n.type==='start');
    if (starts.length!==1) throw new Error('Для прохождения нужен один узел Начало');
    await this.visit(starts[0].id);
  }
  close(){this.active=false;this.root.hidden=true;this.ink=null}
  target(port='flow') {
    const edges=this.graph.connections.filter(e=>e.source===this.current&&e.sourceOutput===port&&e.targetInput==='flow');
    if(edges.length!==1)throw new Error(`Ожидается ровно один переход ${this.current}:${port}`);
    return edges[0].target;
  }
  async follow(port){try{await this.visit(this.target(port))}catch(e){this.error(e)}}
  async visit(id, saveState = null){
    if(!this.active)return;
    const nodes=new Map(this.graph.nodes.map(n=>[n.id,n]));
    let guard=0;
    while(guard++<this.graph.nodes.length+2){
      const node=nodes.get(id);
      if(!node)throw new Error('Сломанная сюжетная связь');
      this.current=id;this.ink=null;this.frame=null;
      this.root.querySelector('[data-title]').textContent=node.title;
      this.root.querySelector('[data-lines]').replaceChildren();
      this.root.querySelector('[data-choices]').replaceChildren();
      this.root.querySelector('[data-message]').textContent='';
      this.root.querySelector('[data-next]').hidden=true;
      if(node.type==='start'){id=this.target();continue}
      if(node.type==='branch'){
        const [kind,key]=node.condition.split(':');
        const val=kind==='flag'?this.flags.get(key):this.items.get(key);
        id=this.target(Boolean(val)?'yes':'no');continue;
      }
      if(node.type==='dialogue'){
        const record=this.stories.get(node.story_id);
        if(!record || node.story_sha256!==record.source_sha256 || !record.approved_for_reuse)
          throw new Error('Сценарий отсутствует, изменён или не одобрен');
        this.ink=await InkDialogue.load(record, event=>{
          if(event.type==='state'){
            const [kind,key]=event.target.split(':');
            (kind==='flag'?this.flags:this.items).set(key,Boolean(event.value));
          }
        });
        const frame=saveState?.current===id&&saveState.storySaves?.[id]
          ? (this.ink.story.state.LoadJson(saveState.storySaves[id]), saveState.frame)
          : this.ink.next();
        this.paint(frame);
        return;
      }
      this.root.querySelector('[data-message]').textContent=node.type==='mechanic'
        ? 'Механика представлена в графе. Её игровой код здесь не исполняется.'
        : node.type==='scene'?'Сцена: переход к следующему событию.'
        :node.type==='ending'?'Конец сюжетной ветки.':'';
      this.root.querySelector('[data-next]').hidden=node.type==='ending';
      return;
    }
    throw new Error('Слишком много автоматических сюжетных переходов');
  }
  paint(frame){
    this.frame=frame;
    const lines=this.root.querySelector('[data-lines]');lines.replaceChildren();
    for(const line of frame.lines||[]){const p=document.createElement('p');p.textContent=line;lines.append(p)}
    const box=this.root.querySelector('[data-choices]');box.replaceChildren();
    for(const c of frame.choices||[]){
      const b=document.createElement('button');b.textContent=c.text;
      b.addEventListener('click',()=>{try{this.paint(this.ink.choose(c.index))}catch(e){this.error(e)}});
      box.append(b);
    }
    this.root.querySelector('[data-next]').hidden=!frame.complete;
    const stats=[...this.flags.entries()].filter(x=>x[1]).map(([key])=>key);
    this.root.querySelector('[data-message]').textContent=stats.length?'Выборы изменили мир: '+stats.join(', '):'';
  }
  key(){return 'mgf:ink-preview:'+JSON.stringify(this.graph?.nodes?.map(n=>[n.id,n.story_sha256||'']))}
  save(){
    if(!this.active)return;
    if(this.ink)this.storySaves[this.current]=this.ink.save();
    const record={current:this.current,flags:[...this.flags],items:[...this.items],storySaves:this.storySaves,frame:this.frame};
    try{localStorage.setItem(this.key(),JSON.stringify(record));this.info('Сюжет сохранён на этом устройстве')}
    catch(e){this.error(e)}
  }
  async restore(){
    if(!this.active)throw new Error('Сначала запустите историю');
    const raw=localStorage.getItem(this.key());
    if(!raw)throw new Error('Нет сохранения для этого графа');
    if(raw.length>3_000_000)throw new Error('Сохранение слишком большое');
    const record=JSON.parse(raw);
    if(!this.graph.nodes.some(n=>n.id===record.current))throw new Error('Сохранённый узел больше не существует');
    this.flags=new Map(record.flags);this.items=new Map(record.items);this.storySaves=record.storySaves||{};
    await this.visit(record.current,record);this.info('Сюжет восстановлен');
  }
}
