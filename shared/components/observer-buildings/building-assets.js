/* V6 unique architectural asset pack.
 * All surfaces use native Island of Twilight 12-material atlas; no foreign renderer.
 * Each role has a distinct structure with recognisable architecture AND material variants.
 */
(function(root){"use strict";
const TILE={soil:1,stone:2,wood:3,sand:4,moss:5,water:6,brick:7,iron:8,bark:9,plaster:10,slate:11};
const BASE={
 well:{shape:"well",tile:2,accent:9},settlement:{shape:"village",tile:3,accent:5},council:{shape:"hall",tile:10,accent:2},
 market:{shape:"stalls",tile:4,accent:7},guild:{shape:"workshop",tile:3,accent:8},tax:{shape:"treasury",tile:7,accent:8},
 school:{shape:"school",tile:10,accent:3},scholarAction:{shape:"study",tile:10,accent:11},printing:{shape:"press",tile:3,accent:8},
 castle:{shape:"fortress",tile:2,accent:7},court:{shape:"palace",tile:10,accent:7},decree:{shape:"monument",tile:2,accent:4},
 monastery:{shape:"abbey",tile:10,accent:11},relief:{shape:"alms",tile:3,accent:4},doctrine:{shape:"chapel",tile:2,accent:10},
 guard:{shape:"watchtower",tile:3,accent:8},patrol:{shape:"barracks",tile:2,accent:3},militia:{shape:"camp",tile:3,accent:7},
 prison:{shape:"jail",tile:2,accent:8},inquiry:{shape:"tribunal",tile:7,accent:8},pardon:{shape:"gate",tile:10,accent:5},
 granary:{shape:"barn",tile:3,accent:9},ration:{shape:"store",tile:4,accent:3},caravan:{shape:"wagon",tile:3,accent:8},
 healer:{shape:"apothecary",tile:10,accent:5},quarantine:{shape:"barrier",tile:2,accent:8},hospital:{shape:"infirmary",tile:10,accent:5},
 fire:{shape:"burning",tile:9,accent:7},brigade:{shape:"pump",tile:3,accent:6},watch:{shape:"bellTower",tile:2,accent:8},
 plague:{shape:"plagueTent",tile:4,accent:8},cordon:{shape:"palisade",tile:9,accent:8},burial:{shape:"cemetery",tile:2,accent:9},
 observer:{shape:"obelisk",tile:11,accent:7},contact:{shape:"portal",tile:11,accent:5},extraction:{shape:"beacon",tile:8,accent:6}
};
function build(kind,draw){
 const def=BASE[kind];if(!def)return false;
 const {box,beam,roof,post,fence,sign}=draw;
 const {tile:a,accent:b}=def;
 const hut=(w=2.4,d=2,h=1.8)=>{box(0,h/2,0,w,h,d,a);roof(0,h+.35,0,w+.4,d+.35,b);box(0,.65,d/2+.08,.55,1.1,.13,8)};
 const flags=()=>{post(1.2,2.5,0,3,8);sign(1.25,3.1,.14,.8,.5,b)};
 const cross=()=>{beam(0,3.6,0,.18,1.1,.2,b);beam(0,3.9,0,.8,.15,.2,b)};
 switch(def.shape){
 case"well":
   for(let i=0;i<10;i++){let t=i*Math.PI/5;post(Math.cos(t)*.83,.27,Math.sin(t)*.83,.52,a)}
   box(0,.14,0,1.55,.3,1.55,6);post(-.95,1.5,0,2.9,9);post(.95,1.5,0,2.9,9);roof(0,3.02,0,2.7,1.8,3);box(0,1.4,0,.4,.35,.4,3);break;
 case"village":hut();box(2.6,.68,-.4,1.35,1.35,1.4,a);roof(2.6,1.6,-.4,1.65,1.75,5);post(-1.7,.65,.3,1.1,9);break;
 case"hall":hut(3.5,2.8,2.1);for(const x of [-1.2,0,1.2])post(x,2.1,1.55,3.4,2);flags();break;
 case"stalls":for(const x of [-1.2,1.2]){for(const z of [-.8,.8])post(x+z*.25,1.1,z,2.2,9);box(x,.6,0,1.7,.3,1.25,3);roof(x,2.35,0,2.1,1.65,x<0?7:5)}break;
 case"workshop":hut(3.4,2.3,2);box(2,.8,.2,1.6,.8,1.3,3);post(2,1.7,.3,.9,8);box(2.6,.2,1,.5,.3,.5,8);break;
 case"treasury":hut(3.1,2.6,2.4);for(const z of [-.5,0,.5])box(-1.7,.45,z,.55,.65,.45,8);flags();break;
 case"school":hut(3.1,2.3,2.1);for(const x of [-.95,.95])box(x,1.55,1.25,.55,.65,.14,5);box(1.8,.5,.6,1,.18,.65,3);break;
 case"study":hut(2.8,2.5,2.5);post(1.2,3.2,-.6,2.1,3);box(1.2,4.25,-.6,.95,.6,.85,10);box(-1.2,.8,1.2,1.1,.4,.65,3);break;
 case"press":hut(3.5,2.8,2);for(const x of [-1,.2,1.2]){post(x,.9,1.65,1.2,8);box(x,1.65,1.65,.7,.18,.6,3)}break;
 case"fortress":box(0,1.15,0,3.2,2.3,3.2,2);
   for(const x of [-1.5,1.5])for(const z of [-1.5,1.5]){box(x,2.1,z,1.1,4.2,1.1,2);roof(x,4.45,z,1.4,1.4,11)}
   box(0,1.1,1.7,.85,1.8,.1,8);flags();break;
 case"palace":hut(4.5,3.3,2.6);for(const x of [-1.7,0,1.7]){post(x,2.1,1.75,3.2,2);box(x,3.7,1.75,.35,.4,.35,7)}flags();break;
 case"monument":box(0,.2,0,3.5,.4,2.4,2);box(0,1.5,0,1.1,2.6,1,10);sign(0,2.3,.57,.85,.95,7);break;
 case"abbey":hut(4.2,3.2,2.2);box(-1.4,3,0,.9,2.3,.9,2);roof(-1.4,4.35,0,1.2,1.2,11);cross();break;
 case"alms":hut(2.6,2.1,1.4);box(1.5,.6,0,1.6,.65,1.3,4);for(const x of [-1.6,-1,1])box(x,.4,1.3,.45,.3,.5,3);break;
 case"chapel":hut(3.2,2.4,2.1);post(0,3.4,-.6,2.4,2);roof(0,4.6,-.6,1.45,1.4,11);cross();break;
 case"watchtower":for(const x of [-.7,.7])for(const z of [-.7,.7])post(x,2,z,4,9);box(0,3.65,0,2.2,.45,2.1,3);roof(0,4.35,0,2.6,2.6,11);flags();break;
 case"barracks":hut(3.7,2.4,1.7);for(const x of [-1.2,0,1.2])post(x,1.1,1.5,2,8);sign(0,2.6,1.2,1,.45,7);break;
 case"camp":for(const x of [-1.1,1.1]){box(x,.35,0,1.9,.4,1.8,3);roof(x,1.3,0,2.1,1.95,7)}for(const z of [-1,1])post(0,.85,z,1.8,8);break;
 case"jail":box(0,1.2,0,3,2.4,2.7,2);roof(0,2.7,0,3.4,3.2,11);for(const x of [-1.1,-.7,.7,1.1])post(x,1.2,1.41,2.2,8);break;
 case"tribunal":hut(3.6,2.5,2.1);for(const x of [-1.2,0,1.2])box(x,.7,1.65,.9,.9,.7,2);sign(0,2.6,1.3,1.2,.5,8);break;
 case"gate":for(const x of [-1.3,1.3])box(x,1.7,0,1.15,3.4,1.2,2);box(0,3.25,0,3.6,.55,1.3,10);flags();break;
 case"barn":hut(4,3.2,2.8);for(const x of [-1.4,-.5,.6,1.5]){post(x,.95,1.7,1.8,9);box(x,.38,2.05,.55,.6,.55,4)}break;
 case"store":for(const x of [-1.2,0,1.2]){box(x,.35,0,.9,.7,1.3,4);box(x,.95,0,.9,.5,1.3,9)}post(-1.9,1,0,2,9);post(1.9,1,0,2,9);break;
 case"wagon":box(0,.85,0,2.6,.55,1.7,3);roof(0,1.7,0,2.6,2.0,4);for(const x of [-1,1])for(const z of [-.9,.9])box(x,.32,z,.65,.65,.15,8);break;
 case"apothecary":hut(2.6,2.4,1.8);for(const x of [-1,.15,1.15])box(x,.5,1.25,.4,.85,.35,5);post(-1,2.7,-.3,.7,5);break;
 case"barrier":for(let x=-2;x<=2;x++)post(x,.95,0,1.9,8);for(const x of [-1.5,1.5])roof(x,2.05,0,.5,1.4,11);sign(0,1.35,.15,1.25,.55,7);break;
 case"infirmary":hut(4.2,3.3,2);box(1.8,.6,1.1,1.6,.4,.7,3);for(const x of [-1.5,.5,1.5])box(x,1.3,1.76,.55,.65,.12,5);sign(0,2.2,1.8,.4,.65,5);break;
 case"burning":for(const x of [-1,0,1]){box(x,.6,0,.8,1.1,.7,9);roof(x,1.3,0,.6,.6,7)}break;
 case"pump":box(0,.35,0,2,.7,1.6,3);post(0,1.65,0,2.4,8);beam(.45,2.75,0,1.9,.15,.25,8);box(1,.35,1,.8,.7,.7,6);break;
 case"bellTower":box(0,.8,0,1.75,1.6,1.6,2);for(const x of [-.6,.6])for(const z of [-.6,.6])post(x,2.5,z,3,2);roof(0,4.1,0,2.2,2.2,11);box(0,3.1,0,.65,.8,.65,8);break;
 case"plagueTent":for(const x of [-1.2,1.2])post(x,1,0,2,9);roof(0,1.85,0,3.5,2.75,4);sign(0,.5,1.4,.85,.4,8);break;
 case"palisade":for(let x=-2;x<=2;x+=.5)post(x,1.2,0,2.4,9);sign(0,1.8,.2,1.5,.5,8);break;
 case"cemetery":for(let x=-1.4;x<=1.5;x+=1.4)for(const z of [-.7,.8]){post(x,.6,z,1.2,2);beam(x,1.05,z,.65,.13,.2,8)}fence(2.2);break;
 case"obelisk":box(0,.25,0,1.9,.5,1.9,2);post(0,2,0,3.5,11);box(0,3.85,0,.85,.65,.85,7);break;
 case"portal":for(const x of [-1,1])post(x,1.9,0,3.8,11);box(0,3.75,0,2.65,.45,.7,5);box(0,.2,0,2.8,.3,1.4,11);break;
 case"beacon":box(0,.25,0,2.3,.5,2.3,2);post(0,2.6,0,4.5,8);
   for(const y of [1,2,3,4])box(0,y,0,1.2-y*.18,.2,1.2-y*.18,6);break;
 default:hut()
 }
 return true
}
root.ObserverBuildingAssets=Object.freeze({TILE,BASE,build,kinds:Object.keys(BASE)});
})(window);
