/* Original-quality NPC sprites and role catalog for V6.
 * Reuse the SAME 6-frame, lit original Island hero sprite texture as the player.
 * Clone its UV state per NPC, without creating a different artistic style.
 */
(function(root){"use strict";
const ROLES={
 observer:{name:"Observer",hp:6,damage:2,walk:2.1,tint:0xf3cabe,job:"Observe",weapon:true},
 companion:{name:"Companion",hp:4,damage:0.65,walk:2.35,tint:0x91dfbc,job:"Follow",weapon:true},
 warrior:{name:"Warrior",hp:7,damage:1.4,walk:2.2,tint:0xc0b7ba,job:"Patrol",weapon:true},
 captain:{name:"Guard Captain",hp:9,damage:1.7,walk:2.0,tint:0xe0b56e,job:"Command",weapon:true},
 farmer:{name:"Farmer",hp:4,damage:0.5,walk:1.3,tint:0xb8d28b,job:"Farm",weapon:false},
 artisan:{name:"Artisan",hp:5,damage:0.7,walk:1.4,tint:0xd2af78,job:"Craft",weapon:false},
 merchant:{name:"Merchant",hp:4,damage:0.5,walk:1.4,tint:0xe4c26c,job:"Trade",weapon:false},
 monk:{name:"Monk",hp:4,damage:0.4,walk:1.25,tint:0xc8ad8d,job:"Pray",weapon:false},
 healer:{name:"Healer",hp:5,damage:0.3,walk:1.65,tint:0xb3dfc2,job:"Heal",weapon:false},
 scholar:{name:"Scholar",hp:4,damage:0.4,walk:1.25,tint:0x9dbada,job:"Study",weapon:false},
 prisoner:{name:"Prisoner",hp:3,damage:0.4,walk:1.1,tint:0xa1a39c,job:"Wait",weapon:false},
 sick:{name:"Sick Resident",hp:2,damage:0.2,walk:0.8,tint:0x9eaa83,job:"Rest",weapon:false},
 undertaker:{name:"Undertaker",hp:5,damage:0.5,walk:1.2,tint:0x8f8294,job:"Bury",weapon:false},
 rebel:{name:"Rebel",hp:5,damage:1,walk:2,tint:0xe37c71,job:"Conspire",weapon:true},
 resident:{name:"Resident",hp:4,damage:0.5,walk:1.5,tint:0xd8bdaa,job:"Wander",weapon:false},
 redObserver:{name:"Red Observer",hp:6,damage:1.3,walk:1.9,tint:0xe75252,job:"Intervene",weapon:true}
};
const SPAWNS={settlement:["farmer","resident"],well:["farmer"],council:["resident"],market:["merchant","resident"],
 guild:["artisan"],tax:["warrior"],school:["scholar"],scholarAction:["scholar"],printing:["artisan"],
 castle:["captain","warrior"],court:["captain"],decree:["warrior"],monastery:["monk"],relief:["monk"],
 doctrine:["monk"],guard:["warrior","warrior"],patrol:["warrior"],militia:["warrior","rebel"],
 prison:["prisoner","warrior"],inquiry:["captain"],pardon:["resident"],granary:["farmer"],
 ration:["resident"],caravan:["merchant"],healer:["healer"],quarantine:["sick"],hospital:["healer","sick"],
 burial:["undertaker"],observer:["redObserver"],contact:["redObserver"],extraction:["redObserver"],
 plague:["sick"],cordon:["warrior"],brigade:["artisan"],watch:["warrior"],fire:["resident"]};
function createMesh(native,role,position){
 const THREE=native.THREE,base=native.heroTex;
 const texture=base.clone();texture.needsUpdate=true;
 texture.wrapS=THREE.ClampToEdgeWrapping;
 const mat=new THREE.MeshLambertMaterial({map:texture,emissive:0xffffff,emissiveMap:texture,
 emissiveIntensity:.13,color:ROLES[role].tint,transparent:true,alphaTest:.5,side:THREE.DoubleSide});
 const geo=new THREE.PlaneGeometry(.98,1.48);geo.translate(0,.74,0);
 const mesh=new THREE.Mesh(geo,mat);mesh.rotation.order="YXZ";mesh.position.copy(position);mesh.renderOrder=2;
 const label=new THREE.Group();label.position.copy(position);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.045,4,18).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:ROLES[role].tint,transparent:true,opacity:.62,depthWrite:false}));
 ring.position.y=.05;label.add(ring);
 return {mesh,ring:label,texture,mat,geo};
}
function animate(entity,elapsed,camera){
 const m=entity.visual;if(!m)return;
 const moving=entity.motion>0.1,frame=entity.dead?5:entity.state==="attack"?2:
  entity.state==="hurt"?3:entity.role==="monk"&&entity.state==="work"?4:
  entity.role==="healer"&&entity.state==="work"?1:
  moving?Math.floor(elapsed*8+entity.seed)%4:4;
 const w=1/6,e=w*.002,tex=m.texture,dir=entity.facing||1;
 tex.repeat.x=dir>=0?w-2*e:-(w-2*e);tex.offset.x=dir>=0?frame*w+e:(frame+1)*w-e;
 tex.needsUpdate=true;
 m.mesh.position.set(entity.x,entity.y+.02+(!entity.dead&&moving?Math.sin(elapsed*15+entity.seed)*.035:0),entity.z);
 m.mesh.rotation.y=Math.atan2(camera.position.x-entity.x,camera.position.z-entity.z);
 m.mesh.rotation.x=0;
 m.mesh.scale.set(entity.dead?1.2:1,entity.dead?.35:1,1);
 m.ring.position.set(entity.x,entity.y+.03,entity.z);
 m.ring.visible=!entity.dead&&entity.relation!=="neutral";
}
function dispose(npc,scene){
 if(!npc.visual)return;
 const v=npc.visual;scene.remove(v.mesh);scene.remove(v.ring);
 v.texture.dispose();v.mat.dispose();v.geo.dispose();
 v.ring.children.forEach(o=>{o.geometry.dispose();o.material.dispose()})
}
root.ObserverNpcCatalog=Object.freeze({ROLES,SPAWNS,createMesh,animate,dispose});
})(window);
