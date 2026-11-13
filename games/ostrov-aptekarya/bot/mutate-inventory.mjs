import {inventory, sourceInput} from './inventory.mjs';
const base=sourceInput();
const attacks=[
  ['changed dialogue with identical line count', {dialogue:base.dialogue.replace('Ива, держись рядом.', 'Ива, иди одна.') }],
  ['deleted start button', {ui:base.ui.replace('data-m="start"', 'data-m="fake"')}],
  ['fake comment hiding missing ending', {dialogue:base.dialogue.replace(/^  ending: \[/m, '  otherEnding: [')+'\n// ending: [\n'}],
  ['removed collectible', {game:base.game.replace('const herbs = SPOTS.herbs.map', 'const herbs = []; // SPOTS.herbs.map')}],
  ['bot closes door directly', {game:base.game.replace('function botInput(dt) {','function botInput(dt) {\n  chapter2.action();')}],
  ['bot invokes bracket action', {game:base.game.replace('function botInput(dt) {',"function botInput(dt) {\\n  if(api.bot) chapter2['action']();".replace('\\n','\n'))}],
  ['decoy comment and real bypass', {game:base.game.replace('function botInput(dt) {','function botInput(dt) {\n  // harmless: chapter2.action();\n  if(api.bot) chapter2.botActionIfNear();')}],
];
for(const [label,patch] of attacks){
  let caught=false;try{inventory({...base,...patch});}catch{caught=true;}
  if(!caught)throw Error('Mutation escaped: '+label);
}
console.log('7/7 inventory mutations caught');
