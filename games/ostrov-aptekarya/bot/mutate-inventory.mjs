import {inventory, sourceInput} from './inventory.mjs';
const base=sourceInput();
const attacks=[
  ['changed dialogue with identical line count', {dialogue:base.dialogue.replace('Ива, держись рядом.', 'Ива, иди одна.') }],
  ['deleted start button', {ui:base.ui.replace('data-m="start"', 'data-m="fake"')}],
  ['fake comment hiding missing ending', {dialogue:base.dialogue.replace(/^  ending: \[/m, '  otherEnding: [')+'\n// ending: [\n'}],
  ['removed collectible', {game:base.game.replace('const herbs = SPOTS.herbs.map', 'const herbs = []; // SPOTS.herbs.map')}],
];
for(const [label,patch] of attacks){
  let caught=false;try{inventory({...base,...patch});}catch{caught=true;}
  if(!caught)throw Error('Mutation escaped: '+label);
}
console.log('4/4 inventory mutations caught');
