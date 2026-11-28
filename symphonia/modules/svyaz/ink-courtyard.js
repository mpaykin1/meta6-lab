// InkJS 2.4.0, MIT, https://github.com/y-lohse/inkjs.
// Optional narrative engine; never blocks an existing chapter or a navigation action.
const source=(ru)=>`VAR wins = 0
VAR losses = 0
VAR feathers = 0
VAR circle = 0
{ circle >= 2:
    ${ru?'Я уже слышал эту музыку.':'I have heard this music before.'}
- wins > 0:
    ${ru?'Рога исчезли в тумане. Она всё ещё играет.':'The horns vanished in the mist. She is still playing.'}
- losses > 0:
    ${ru?'Башни пали. За туманом горит её окно.':'The towers fell. Her window shines beyond the mist.'}
- feathers > 0:
    ${ru?'Синие перья ведут меня к музыке.':'The blue feathers lead me to the music.'}
- else:
    ${ru?'За туманом слышен рояль.':'A piano sounds beyond the mist.'}
}
-> END`;
let enginePromise;
export async function readCourtyardStory(nit,lang){
 try{
  enginePromise??=import('https://cdn.jsdelivr.net/npm/inkjs@2.4.0/dist/ink-full.mjs').catch(()=>null);
  const engine=await enginePromise;if(!engine?.Compiler)return '';
  const story=new engine.Compiler(source(lang==='ru')).Compile();
  const v=story.variablesState, a=nit.luchnik,b=nit.adagio;
  v['wins']=a.pobedy;v['losses']=a.porazheniya;v['feathers']=a.perya;v['circle']=b.krug;
  return story.ContinueMaximally().trim();
 }catch{return '';}
}
