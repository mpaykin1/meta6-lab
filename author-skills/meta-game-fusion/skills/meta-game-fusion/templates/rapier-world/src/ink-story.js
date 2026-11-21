/** Narrow inkjs narrative adapter. No arbitrary eval, no DOM injection, no game-code execution. */
import { Story } from 'inkjs';
const TAG_RE = /^(flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}$/;

export class InkDialogue {
  constructor(story, descriptor, emit = () => {}) {
    this.story = story;
    this.descriptor = descriptor;
    this.emit = emit;
    this.lines = [];
    this.tags = [];
    this.complete = false;
  }
  static async load(entry, emit, load = fetch) {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(entry?.id) || entry.runtime_file !== `stories/${entry.id}.json`)
      throw new Error('Неверный путь истории');
    const res = await load(`./${entry.runtime_file}`, {cache:'no-store'});
    if (!res.ok) throw new Error(`Не загружена история: ${entry.id}`);
    const json = await res.text();
    if (json.length > 5_000_000) throw new Error('История слишком велика');
    return new InkDialogue(new Story(json), entry, emit);
  }
  next() {
    this.lines = [];
    this.tags = [];
    let guard = 0;
    while (this.story.canContinue && guard++ < 1000) {
      const text = this.story.Continue().trim();
      if (text) this.lines.push(text);
      const tags = this.story.currentTags || [];
      for (const tag of tags) if (typeof tag === 'string' && tag.length < 150) this.tags.push(tag);
    }
    if (guard >= 1000) throw new Error('Зацикленный сюжет Ink');
    for (const [variable, target] of Object.entries(this.descriptor.exports || {})) {
      if (!TAG_RE.test(target)) continue;
      const val = this.story.variablesState.$(variable);
      if (val === undefined || val === null) continue;
      this.emit({type:'state',target,value:typeof val==='boolean'?val:typeof val==='number'?val:Boolean(val)});
    }
    this.complete = !this.story.canContinue && this.story.currentChoices.length === 0;
    return {lines:this.lines.slice(), tags:this.tags.slice(),
      choices:this.story.currentChoices.map((c,index)=>({index,text:c.text})), complete:this.complete};
  }
  choose(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.story.currentChoices.length) throw new Error('Неверный выбор');
    this.story.ChooseChoiceIndex(index);
    return this.next();
  }
  save() {return this.story.state.ToJson();}
  restore(json) {if (typeof json !== 'string' || json.length>2_000_000) throw new Error('Недопустимое сохранение');this.story.state.LoadJson(json);return this.next();}
}
