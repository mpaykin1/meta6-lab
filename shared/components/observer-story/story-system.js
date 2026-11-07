/* Literary consequence writer / readable event stream — native V6 history layer.
 * No AI fiction falsely presented as model output. Existing source narratives are retained.
 */
(function(root){"use strict";
const TEXT={
 well:["A well has opened beneath the crowded sky.","The first bucket draws a queue. Residents will bargain over who receives water first; a permanent settlement has begun to seem possible."],
 settlement:["A settlement takes its first shape.","People who once met only by accident now exchange tools, meals and promises. A council will soon be needed to decide whose promises matter."],
 council:["The council convenes.","Someone is chosen to speak, somebody else to remember, and a third to doubt. A community has discovered government—and its enemies."],
 market:["The market is open.","The stalls fill with barter and rumours. A merchant hears news from beyond the island, while a hungry villager decides whether fairness is worth waiting for."],
 guild:["A guild has been founded.","The artisans no longer work alone. They control their secrets, begin to set prices, and learn that collective strength can also become coercion."],
 tax:["A tax collector appears.","The rich discuss administration; the poor discuss theft. A guard shifts toward the crowd. The same decree will be called justice and robbery."],
 school:["The school opens its doors.","Children learn their first letters. One question survives the bell: who decides which truths they should learn?" ],
 scholarAction:["A scholar starts a new inquiry.","Scratches on parchment become evidence, and evidence makes yesterday's absolute certainty suddenly uncomfortable."],
 printing:["A press begins printing.","An idea that once belonged to a single voice now travels without permission. The authorities discover the frightening speed of repetition."],
 castle:["The castle commands the hill.","Walls promise protection, but also announce ownership. Men with swords have acquired a place from which to issue orders."],
 court:["A court is established.","Decisions can now be made in the name of law. The first witnesses are already disagreeing about what happened."],
 decree:["The decree has been issued.","The proclamation is nailed where everyone can see it. Agreement is not required, obedience is expected."],
 monastery:["A monastery rises.","A small silence survives within the noise of the island. Travellers bring confessions, and the monks decide which stories deserve to be preserved."],
 relief:["The needy receive help.","Bread and medicine are distributed, but the line grows longer than the supply. Mercy is becoming an institution with a budget."],
 doctrine:["A doctrine spreads.","For a few, the teachings bring hope; for others, a reason to accuse. The quarrel has not yet drawn blood."],
 guard:["The guard forms a patrol.","A soldier walks a boundary that used to be a suggestion. What was yesterday a disagreement may tomorrow be an offence."],
 patrol:["The patrol enters the streets.","The city is quieter, though nobody agrees whether this is because danger decreased or because people are afraid to speak."],
 militia:["Neighbours take up arms.","Every family can name somebody it wishes to defend, and somebody it may have to fight. A militia is born from suspicion."],
 prison:["The first prison is built.","The settlement learns to put a person behind a door. A guard now has the power to deny the passage of time."],
 inquiry:["An inquiry begins.","Questions are asked in public and whispered in private. Every answer seems to require another witness."],
 pardon:["A pardon is declared.","The freed prisoner enters a world that remembers the sentence more clearly than the release."],
 granary:["The grain is stored.","For the first time, winter can be planned for; for the first time, somebody can profit from withholding food."],
 ration:["Rations are counted.","A clerk weighs portions in silence. The hungry do not care whether the arithmetic is correct."],
 caravan:["A caravan sets out.","Merchants carry salt and stories beyond the far shore. Trade may bring an ally or the news of an enemy."],
 healer:["A healer begins work.","An exhausted stranger is offered shelter and a bitter drink. If the cure works, the village will remember the kindness; if it fails, they may remember the healer differently."],
 quarantine:["Quarantine is declared.","Those locked inside call the cordon punishment. Those outside call it protection. Both groups believe they are the frightened ones."],
 hospital:["The sick are gathered together.","The healers work into the night while the village counts supplies, beds, and rumours of recovery."],
 fire:["Fire spreads through the quarter.","Smoke passes from roof to roof more quickly than the people can run. Those who escape remember those who did not."],
 brigade:["A fire brigade assembles.","Buckets fly between hands. The effort will not save every house, but it may teach the town that disaster demands cooperation."],
 watch:["A watch is established.","The night has acquired witnesses. Even distant movement across the water will become a story by morning."],
 plague:["The first fever is reported.","Some want to flee, others demand closed gates. The dead have not yet been counted, but suspicion has already found a victim."],
 cordon:["A cordon cuts the road.","The soldiers stand in a line between two groups of frightened neighbours. Nobody knows on which side safety lies."],
 burial:["A burial place is marked.","Names are scratched into stones. The people who survive begin to understand that history belongs to the dead as well."],
 observer:["A red Observer enters the island.","Someone is watching without belonging. The villagers feel a presence and argue about its purpose."],
 contact:["The Observers send a signal.","A light answers from beyond the shore. Nobody can decide whether this is the beginning of a conversation or a warning."],
 extraction:["A passage opens.","A few dare to cross. They may never discover whether the island has been saved or abandoned."],
 new:["Another life enters the story.","A second figure stands beside the Observer. Together they may fight, but no friendship is stronger than the choice to keep it."],
 imp:["A small demon crawls from the dusk.","The patrols stop joking. The villagers begin to barter stories about the things that cannot be named."],
 shade:["A shadow moves against the light.","A soldier raises a sword and a scholar asks whether the threat is real. Neither is prepared for the answer."],
 warden:["The Warden walks again.","The island remembers its old defender—or perhaps its oldest enemy. Even the armed grow quiet."]
};
const SPECIAL={
 newCompanion:({person})=>["A companion has appeared.","The new figure follows the Observer into the island's uncertain history. The help will be welcome but modest; one companion cannot cancel the danger of the world."],
 reborn:({deaths})=>["The sign 新 has answered.","The former Observer remains part of the island's history. A new life opens its eyes after "+deaths+" death(s). The buildings and all their consequences remain."],
 betrayal:({person})=>["A friendship breaks under steel.","The Observer struck companion #"+person+". A gesture once reserved for an enemy has changed an ally into an enemy. They now fight one another."],
 assault:({role})=>["A resident has been struck.","The "+role+" falls back, then turns toward the Observer. Nearby guards may interpret the blow as a crime against the whole settlement."],
 killed:({role,attacker})=>["A life has been taken.","The "+role+" was killed by "+attacker+". The body has become evidence; witnesses spread the news and the city's suspicion grows."],
 wounded:({role})=>["Someone is wounded.","The "+role+" has been hurt. The people who witnessed the blow will remember who stood nearby and who offered help."],
 guardAlert:()=>["The guard has turned hostile.","The soldiers have heard of the assault. Their swords are now drawn against the Observer."],
 playerAttacked:({role,hp})=>["The Observer has been attacked.","A "+role+" struck the Observer. Health remaining: "+hp+". Even the one who watches history is not protected from it."],
 playerDeath:({deaths})=>["An Observer has died.","The last blow ended a life, not the world. The residents will go on arguing, eating, building and remembering. Death #"+deaths+". Select 新 to bring a new Observer into the same history."]
};
function create({onChange,context}={}){
 const entries=[];let last=0;
 function emit(type,data={}){
  let a=TEXT[type]||null;
  if(SPECIAL[type])a=SPECIAL[type](data);
  if(!a)a=[data.title||type,data.text||"An event changes the world."];
  const note={id:++last,type,title:a[0],short:a[0],long:a[1],when:Date.now(),data};
  entries.push(note);if(entries.length>150)entries.shift();
  onChange?.(note);return note
 }
 function inspect(kind,obj,state){
  const [title,description]=TEXT[kind]||[kind,"This place is still changing."];
  const around=(state.objects||[]).filter(b=>b!==obj&&Math.hypot(b.x-obj.x,b.z-obj.z)<12)
     .slice(0,6).map(b=>b.kind);
  return {title:title.replace(/\.$/,""),long:[description,
    "Nearby buildings: "+(around.join(", ")||"none yet")+".",
    "People: "+(state.pop??"?")+". Order: "+(state.order??"?")+". Suspicion: "+(state.suspicion??"?")+".",
    "This event is part of the same world history. Its consequences may unfold long after the building was placed."
   ].join("\n\n")}
 }
 function restore(old){for(const note of old||[]){if(note?.long&&note?.title){entries.push(note);last=Math.max(last,Number(note.id)||0)}}}
 return {emit,inspect,restore,entries,
  latest:()=>entries.at(-1)||null,
  get readable(){return entries.map(e=>e.title+"\n"+e.long).join("\n\n— — —\n\n")}};
}
root.ObserverStorySystem=Object.freeze({create,TEXT,SPECIAL});
})(window);
