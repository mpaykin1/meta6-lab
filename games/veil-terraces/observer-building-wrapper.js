// Original Observer World V7 building data is used unchanged; this is only a WebGL2 draw adapter.
// No textures, media or third-party runtime are introduced by the adapter.
(function(root){
  'use strict';
  const colors=Object.freeze({
    1:[.16,.25,.24],2:[.16,.29,.34],3:[.30,.28,.24],4:[.31,.25,.18],
    5:[.10,.35,.31],6:[.16,.55,.54],7:[.30,.22,.24],8:[.38,.48,.49],
    9:[.26,.24,.20],10:[.32,.33,.31],11:[.13,.27,.34]
  });
  function make(kind,emit){
    if(!root.ObserverBuildingAssets || typeof emit!=='function')
      throw new Error('The original Observer building module is required');
    const vertices=[];
    function box(x,y,z,w,h,d,tile){
      const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2;
      const color=colors[tile]||colors[2];
      const faces=[
        [[[a,c,g],[b,c,g],[b,e,g],[a,e,g]],[0,0,1]],
        [[[b,c,f],[a,c,f],[a,e,f],[b,e,f]],[0,0,-1]],
        [[[b,c,g],[b,c,f],[b,e,f],[b,e,g]],[1,0,0]],
        [[[a,c,f],[a,c,g],[a,e,g],[a,e,f]],[-1,0,0]],
        [[[a,e,g],[b,e,g],[b,e,f],[a,e,f]],[0,1,0]],
        [[[a,c,f],[b,c,f],[b,c,g],[a,c,g]],[0,-1,0]]
      ];
      for(const [points,normal] of faces){
        emit(vertices,points[0],points[1],points[2],normal,color);
        emit(vertices,points[0],points[2],points[3],normal,color);
      }
    }
    const draw={
      box,
      beam(x,y,z,w,h,d,tile){box(x,y,z,w,h,d,tile)},
      roof(x,y,z,w,d,tile){box(x,y,z,w,.32,d,tile)},
      post(x,y,z,h,tile){box(x,y,z,.28,h,.28,tile)},
      fence(width){box(0,.7,-width/2,width,1.4,.18,8)},
      sign(x,y,z,w,h,tile){box(x,y,z,w,h,.14,tile)}
    };
    if(root.ObserverBuildingAssets.build(kind,draw)!==true)
      throw new Error('Unknown original Observer building: '+kind);
    return vertices;
  }
  root.VeilBuildingGeometry=Object.freeze({make});
})(window);
