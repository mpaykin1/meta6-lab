const greetings=['Слышишь меня?','Я долго искал этот берег.','Наконец живой голос.','Разлом привёл меня к тебе.','Я пришёл издалека.','Здесь всё иначе.','Ты тоже видел свет в небе?','Не уходи сразу.'];
const pleas=['Мне нужна твоя помощь.','Один я не справлюсь.','Мне нужно вернуться домой.','Я потерял дорогу.','Я ещё могу идти.','Мы можем выбраться вместе.','Я не прошу сражаться за меня.','Покажи безопасный путь.'];
const endings=['Я запомню этот день.','Решение за тобой.','Времени осталось мало.','Я буду ждать у дороги.','Свет маяка ещё виден.','Прислушайся к ветру.','Я не стану тебя торопить.','Пойдём, пока разлом открыт.'];
export class DialogueGenerator{
 constructor(snapshot={}){this.counter=Math.max(0,snapshot.counter|0);this.used=new Set(snapshot.used||[])}
 next({home='ash',world='island',state='neutral',weapon='кулаки',refusals=0,night=false}={}){
  for(let tries=0;tries<512;tries++){
   const n=this.counter++%512,a=n%8,b=Math.floor(n/8)%8,c=Math.floor(n/64)%8;
   const need=state==='hostile'?'Ты отказал мне. Я буду защищаться.':state==='friend'?'Теперь мы идём вместе.':home==='water'&&world!=='water'?'Мне нужна вода.':home==='ash'&&world==='water'?'Мне нужен огонь.':pleas[b];
   // Keep the request variation even when the physical need is fixed.
   const text=`${greetings[a]} ${need} ${pleas[b]} ${night?'В темноте':'При этом свете'} я вижу твоё оружие: ${weapon}. ${refusals?'После прежних отказов мне трудно доверять. ':''}${endings[c]}`;
   if(!this.used.has(text)){this.used.add(text);return text}
  }
  return 'Мне нужно немного тишины.';
 }
 serialize(){return {counter:this.counter,used:[...this.used].slice(-2048)}}
}
