// Self-contained watercolor silhouettes: living midground inhabitants; no geometry is reused from accepted originals.
export function createCreatures({T,world,svgMap,rand}) {
 const objects=Object.create(null),random=rand(7717);
 function art(shape){
  return '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">'+
   '<defs><linearGradient id="body" x1=".1" y1="0" x2=".9" y2="1">'+
   '<stop stop-color="#a1a0a1"/><stop offset=".47" stop-color="#575a66"/><stop offset="1" stop-color="#272e39"/>'+
   '</linearGradient><linearGradient id="shade"><stop stop-color="#b9a9aa"/>'+
   '<stop offset=".52" stop-color="#777a82"/><stop offset="1" stop-color="#303640"/></linearGradient>'+
   '</defs>'+shape+'</svg>';
 }
 function spectral(id,svg,x,y,w,h,opacity=.8,z=3.5){
  const obj=new T.Group();obj.position.set(x,y,z);
  const material=new T.SpriteMaterial({map:svgMap(art(svg)),transparent:true,opacity,depthWrite:false});
  const mesh=new T.Sprite(material);mesh.scale.set(w,h,1);obj.add(mesh);world.add(obj);
  objects[id]=obj;return obj;
 }
 const antler=[
 '<path d="M236 180Q199 155 173 111L153 61M173 111L103 90L69 49M173 111L137 160M269 182Q299 142 320 93L325 33M320 93L375 88L418 42M320 93L353 139" fill="none" stroke="#a6a7a5" stroke-width="9" stroke-linecap="round"/>',
 '<path d="M239 178L231 139M263 179L273 127M168 110L184 56M366 89L373 42" stroke="#b9b2a8" stroke-opacity=".55" stroke-width="4" fill="none"/>',
 '<path d="M225 192Q232 160 252 159Q272 157 280 198L266 260Q252 292 240 273L222 231Z" fill="url(#shade)" stroke="#343a42" stroke-width="6"/>',
 '<path d="M241 265Q212 284 196 334L173 439L156 473M255 268Q278 302 297 351L321 436L339 473M220 298Q195 335 215 380L203 461M267 307Q287 347 270 406L282 463" fill="none" stroke="#646c71" stroke-width="15" stroke-linecap="round"/>',
 '<path d="M226 207Q243 188 252 207L247 241L232 244Z" fill="#242a36"/><path d="M220 225L241 233L259 225" fill="none" stroke="#b8a7ac" stroke-width="3"/>',
 '<path d="M150 469L170 469L182 480M326 468L341 465L354 482" stroke="#333a40" stroke-width="7" fill="none"/>'
 ].join('');
 spectral('mist_antler',antler,19,-2.15,5.2,7.3,.73,1.3);
 const crawler=[
 '<path d="M167 228Q141 178 160 142Q177 121 220 146L267 168Q292 174 303 217L277 263L217 286Z" fill="url(#body)" stroke="#343841" stroke-width="5"/>',
 '<path d="M211 166Q239 173 259 193M210 193Q239 195 277 221M211 222L264 243" stroke="#b4a9ac" stroke-opacity=".4" stroke-width="4" fill="none"/>',
 '<path d="M172 242Q117 251 87 304L40 382L14 390M190 262Q145 293 121 358L91 431L58 447M273 247Q328 274 359 321L411 388L439 407M269 264Q304 315 322 366L368 427L401 438" fill="none" stroke="#6c7176" stroke-width="19" stroke-linecap="round"/>',
 '<path d="M14 390L39 402L45 428M58 447L77 464L97 460M439 407L468 424L480 447M401 438L416 462L445 467" fill="none" stroke="#a6a9a7" stroke-width="7"/>',
 '<path d="M231 160Q233 113 244 103Q258 94 284 103L296 144Q289 168 265 172Z" fill="#8b7772" stroke="#272d37" stroke-width="6"/>',
 '<path d="M248 111Q259 119 277 112L282 141Q268 151 253 141Z" fill="#20272f"/><path d="M238 105L288 95" stroke="#b7a7a3" stroke-width="4"/>',
 '<path d="M174 245Q213 258 263 247" fill="none" stroke="#c6b4b2" stroke-opacity=".24" stroke-width="10"/>'
 ].join('');
 spectral('bell_crawler',crawler,-21,-2.2,5.4,6.1,.61,2.1);
 const sentinel=[
 '<path d="M233 124Q217 69 239 38Q260 27 280 62L286 118L271 164L235 168Z" fill="url(#shade)" stroke="#3b4148" stroke-width="6"/>',
 '<path d="M245 100Q246 80 261 83Q269 86 271 105L256 123Z" fill="#242934"/>',
 '<path d="M213 169Q171 194 169 263Q176 338 150 432L121 486L190 481L220 397L263 466L323 475Q285 378 307 287Q323 211 280 166Z" fill="url(#body)" stroke="#2b343d" stroke-width="7"/>',
 '<path d="M193 224Q169 269 148 322L116 379L95 411M285 209Q339 252 358 326L369 384L395 433" fill="none" stroke="#888c91" stroke-width="18" stroke-linecap="round"/>',
 '<path d="M211 198Q238 209 270 195M202 238L292 234M199 282L298 270M196 331L296 321" fill="none" stroke="#b8aaa9" stroke-opacity=".27" stroke-width="5"/>',
 '<path d="M235 263Q252 232 268 270L257 340Q241 352 229 319Z" fill="#19232c"/>',
 '<path d="M118 373L102 420L77 456M366 384L384 433L406 477" fill="none" stroke="#c0bbb9" stroke-opacity=".4" stroke-width="5"/>'
 ].join('');
 spectral('hollow_sentinel',sentinel,26,-1.95,4.5,7.8,.64,1.9);
 const heron=[
 '<path d="M213 238Q167 219 144 175L106 147Q80 144 65 125L134 129Q171 139 192 170Q211 178 239 209Z" fill="url(#shade)" stroke="#353c48" stroke-width="6"/>',
 '<path d="M208 225Q223 200 232 166Q218 121 253 89Q267 72 288 73L337 86L309 98Q273 107 270 139L274 185L263 251Z" fill="url(#shade)" stroke="#353a42" stroke-width="6"/>',
 '<path d="M231 224Q166 223 113 248Q174 276 222 272Q266 257 299 288L365 321L317 276Q313 238 272 227Z" fill="url(#body)" stroke="#303941" stroke-width="5"/>',
 '<path d="M238 267Q212 328 188 380L171 456M262 271Q278 342 268 412L294 466" stroke="#8e9698" stroke-width="8" fill="none"/>',
 '<path d="M173 456L140 473L175 467L190 483M294 466L317 481L286 472L264 488" fill="none" stroke="#6a6a70" stroke-width="5"/>',
 '<path d="M274 90L278 90" stroke="#e2d5c2" stroke-width="7" stroke-linecap="round"/>'
 ].join('');
 spectral('ash_heron',heron,-3,-2,3.6,4.5,.8,3.4);
 const moth=[
 '<path d="M245 212Q179 119 113 143Q75 172 104 238Q167 272 238 246Z" fill="url(#shade)" stroke="#6c6166" stroke-width="5"/>',
 '<path d="M255 214Q323 119 384 143Q429 172 399 238Q329 272 262 246Z" fill="url(#shade)" stroke="#6c6166" stroke-width="5"/>',
 '<path d="M243 249Q174 255 164 327Q190 364 243 315ZM258 249Q329 252 341 327Q317 364 257 315Z" fill="#aaa5ac" stroke="#716c76" stroke-width="4"/>',
 '<path d="M245 215L152 174M246 226L125 221M254 217L350 174M253 229L377 221M246 265L194 305M252 267L305 307" stroke="#5d5965" stroke-width="4" opacity=".7"/>',
 '<path d="M251 193Q239 249 250 322M249 193Q242 157 224 141M250 192Q260 159 280 141" stroke="#d7cfc8" stroke-width="7" fill="none"/>'
 ].join('');
 spectral('silver_moth',moth,7,1.7,1.55,1.55,.86,6.9);
 const swarm=new T.Group();world.add(swarm);objects.moth_swarm=swarm;
 const swarmSprites=[];
 const swarmTexture=svgMap(art(moth));
 for(let i=0;i<17;i++){
  const material=new T.SpriteMaterial({map:swarmTexture,transparent:true,opacity:.25+random()*.5,depthWrite:false});
  const s=new T.Sprite(material),size=.27+random()*.4;
  s.scale.set(size,size,1);
  const x=-18+random()*32,y=-3+random()*7,phase=random()*6.283,speed=.3+random()*.44;
  s.position.set(x,y,6.6+random()*.6);swarm.add(s);
  swarmSprites.push({s,x,y,phase,speed});
 }
 return {objects,tick(t){
  const ant=objects.mist_antler;
  ant.rotation.z=Math.sin(t*.54)*.018;ant.position.x=19+Math.sin(t*.23)*1.2;
  const crawl=objects.bell_crawler;
  crawl.position.x=-21+Math.sin(t*.37)*2.3;crawl.rotation.z=Math.sin(t*.85)*.03;
  const ward=objects.hollow_sentinel;
  ward.rotation.z=Math.sin(t*.38)*.023;
  const bird=objects.ash_heron;
  bird.rotation.z=Math.sin(t*1.45)*.07;
  const butterfly=objects.silver_moth;
  butterfly.position.y=1.7+Math.sin(t*2)*.4;
  butterfly.scale.x=.8+Math.cos(t*6)*.5;
  for(const b of swarmSprites){
   b.s.position.x=b.x+Math.sin(t*b.speed+b.phase)*1.1;
   b.s.position.y=b.y+Math.cos(t*(b.speed+.3)+b.phase)*.68;
   b.s.scale.x=Math.max(.14,Math.abs(Math.cos(t*5.8+b.phase)))*b.s.scale.y;
  }
 }};
}
