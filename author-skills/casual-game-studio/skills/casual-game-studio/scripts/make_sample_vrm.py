#!/usr/bin/env python3
"""Generate an original pastel 3D humanoid in VRM 1.0 GLB form.
No third-party art/assets or proprietary rig sources. Pure Python standard library.
"""
import json,math,struct,pathlib,sys
class VRMBuilder:
 def __init__(self):
  self.buff=bytearray(); self.v=[];self.accessors=[];self.meshes=[];self.nodes=[];self.materials=[]
 def data(self,raw,target=None):
  while len(self.buff)%4: self.buff.append(0)
  i=len(self.v);o=len(self.buff);self.buff.extend(raw);self.v.append({'buffer':0,'byteOffset':o,'byteLength':len(raw),**({'target':target} if target else {})});return i
 def accessor(self,data,typ,comp=5126,minimum=None,maximum=None,target=None):
  fmt={5126:'f',5123:'H',5125:'I'}[comp]
  raw=struct.pack('<'+str(len(data))+fmt,*data)
  acc={'bufferView':self.data(raw,target),'componentType':comp,'count':len(data)//{'SCALAR':1,'VEC3':3}[typ],'type':typ}
  if minimum is not None: acc['min']=minimum
  if maximum is not None: acc['max']=maximum
  self.accessors.append(acc);return len(self.accessors)-1
 def material(self,name,hex):
  rgb=[int(hex[i:i+2],16)/255 for i in (0,2,4)]
  self.materials.append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':rgb+[1.0],'metallicFactor':0,'roughnessFactor':.78},'doubleSided':True})
  return len(self.materials)-1
 def mesh(self,name,geometry,material,morph=False):
  pos,norm,inds=geometry
  p=self.accessor(pos,'VEC3',minimum=[min(pos[k::3]) for k in range(3)], maximum=[max(pos[k::3]) for k in range(3)],target=34962)
  n=self.accessor(norm,'VEC3',target=34962)
  ix=self.accessor(inds,'SCALAR',comp=5123,target=34963)
  prim={'attributes':{'POSITION':p,'NORMAL':n},'indices':ix,'material':material}
  mesh={'name':name,'primitives':[prim]}
  if morph:
   # Collapse the eye height on the Y axis (expressions.preset.blink).
   delta=[value*(-.93 if idx%3==1 else 0) for idx,value in enumerate(pos)]
   target=self.accessor(delta,'VEC3',target=34962)
   prim['targets']=[{'POSITION':target}];mesh['weights']=[0.0]
  self.meshes.append(mesh)
  return len(self.meshes)-1
 def node(self,name,parent=None,tr=None,scale=None,mesh=None):
  n={'name':name}
  if tr is not None:n['translation']=list(tr)
  if scale is not None:n['scale']=list(scale)
  if mesh is not None:n['mesh']=mesh
  self.nodes.append(n);i=len(self.nodes)-1
  if parent is not None:self.nodes[parent].setdefault('children',[]).append(i)
  return i
 def save(self,path,root,bones,eye_nodes):
  ext={'specVersion':'1.0',
    'meta':{'name':'Pastel Scout - CGS Original','version':'1.0','authors':['Casual Game Studio'],
       'licenseUrl':'https://vrm.dev/licenses/1.0/', 'avatarPermission':'everyone',
       'commercialUsage':'corporation','allowRedistribution':True,'creditNotation':'unnecessary',
       'modification':'allowModificationRedistribution'},
    'humanoid':{'humanBones':{k:{'node':v} for k,v in bones.items()}},
    'expressions':{'preset':{'blink':{'morphTargetBinds':[{'node':i,'index':0,'weight':1.0} for i in eye_nodes]}}}}
  gltf={'asset':{'version':'2.0','generator':'Casual Game Studio original VRM builder v1'},
    'scene':0,'scenes':[{'name':'Pastel Scout','nodes':[root]}],
    'nodes':self.nodes,'meshes':self.meshes,'materials':self.materials,
    'buffers':[{'byteLength':len(self.buff)}],'bufferViews':self.v,'accessors':self.accessors,
    'extensionsUsed':['VRMC_vrm'],'extensions':{'VRMC_vrm':ext}}
  jb=json.dumps(gltf,separators=(',',':')).encode();jb+=b' '*(-len(jb)%4)
  b=bytes(self.buff);b+=b'\x00'*(-len(b)%4)
  payload=struct.pack('<4sII',b'glTF',2,12+8+len(jb)+8+len(b))+struct.pack('<I4s',len(jb),b'JSON')+jb+struct.pack('<I4s',len(b),b'BIN\0')+b
  pathlib.Path(path).parent.mkdir(parents=True,exist_ok=True);pathlib.Path(path).write_bytes(payload)
  return len(payload)

def sphere(slices=18,rings=12):
 p=[];n=[];ix=[]
 for j in range(rings+1):
  v=j/rings;theta=v*math.pi
  for i in range(slices+1):
   u=i/slices;phi=u*2*math.pi
   x=math.sin(theta)*math.cos(phi);y=math.cos(theta);z=math.sin(theta)*math.sin(phi)
   p.extend((x,y,z));n.extend((x,y,z))
 for j in range(rings):
  for i in range(slices):
   a=j*(slices+1)+i;b=a+slices+1
   ix.extend((a,b,a+1,b,b+1,a+1))
 return p,n,ix

def build(path):
 b=VRMBuilder();skin=b.material('peach-pearl','ffe5d9');coat=b.material('periwinkle-jacket','a6c8f2');hat=b.material('pink-helmet','ffb4c9');ear=b.material('mint-ear','b6e4d3');eye=b.material('night-blue-eyes','374f78');blush=b.material('rosy-cheeks','fa91b0');boots=b.material('lavender-boots','a4a1d5');gold=b.material('tiny-gold','fff3a9')
 geom=sphere()
 shapes={key:b.mesh('smooth-'+str(key),geom,key,key==eye) for key in [skin,coat,hat,ear,eye,blush,boots,gold]}
 root=b.node('PastelScoutRig');bones={}
 def bone(k,parent,pos):bones[k]=b.node(k,parent,pos);return bones[k]
 def ell(parent,name,material,xyz,scale):return b.node(name,parent,xyz,scale,shapes[material])
 hips=bone('hips',root,[0,.96,0]); ell(hips,'soft shorts',coat,[0,.04,0],[.27,.19,.2]);ell(hips,'gold belt',gold,[0,.16,.14],[.22,.045,.055])
 spine=bone('spine',hips,[0,.25,0]); ell(spine,'plush body',coat,[0,.17,0],[.34,.4,.24]);ell(spine,'shirt bib',skin,[0,.16,.225],[.17,.2,.035])
 neck=bone('neck',spine,[0,.48,0]);ell(neck,'soft neck',skin,[0,.01,0],[.11,.12,.10])
 head=bone('head',neck,[0,.13,0]);ell(head,'face',skin,[0,.27,0],[.37,.39,.32]);ell(head,'cap top',hat,[0,.57,-.02],[.30,.14,.30]);
 for s,side in [(-1,'left'),(1,'right')]:
  leg=bone(side+'UpperLeg',hips,[s*.18,-.10,0]);ell(leg,side+' leg',coat,[0,-.18,0],[.145,.26,.15]);low=bone(side+'LowerLeg',leg,[0,-.35,0]);ell(low,side+' shin',boots,[0,-.16,0],[.14,.23,.14]);foot=bone(side+'Foot',low,[0,-.32,.045]);ell(foot,side+' boot',boots,[0,-.04,.115],[.16,.11,.24]);
  ua=bone(side+'UpperArm',spine,[s*.36,.36,0]);ell(ua,side+' sleeve',coat,[s*.12,-.095,0],[.225,.155,.16]);la=bone(side+'LowerArm',ua,[s*.23,-.18,0]);ell(la,side+' forearm',skin,[s*.10,-.09,0],[.14,.14,.125]);h=bone(side+'Hand',la,[s*.20,-.15,0]);ell(h,side+' mitten',skin,[s*.035,-.025,.03],[.10,.105,.11])
 # Pastel bunny helmet, gold charms, rosy cheeks and expression-linked eyes.
 eye_nodes=[]
 for s in [-1,1]:
  for material,name,pos,scale in [(hat,'bunny antenna', [s*.21,.78,-.015],[.095,.28,.10]),(ear,'antenna insert',[s*.21,.79,.079],[.053,.22,.023]),(blush,'cheek',[s*.22,.21,.285],[.07,.055,.028]),(eye,'eye',[s*.15,.35,.304],[.053,.083,.04])]:
   idx=ell(head,name+str(s),material,pos,scale)
   if name=='eye':eye_nodes.append(idx)
 ell(head,'tiny nose',blush,[0,.23,.345],[.055,.044,.027]);ell(head,'head star',gold,[0,.6,.27],[.045,.07,.02])
 size=b.save(path,root,bones,eye_nodes)
 print(path, size, 'bytes',len(b.nodes),'nodes',len(b.meshes),'meshes',len(bones),'bones',eye_nodes)
 if not all(k in bones for k in ('hips','spine','head','leftUpperArm','rightUpperArm','leftFoot','rightFoot')):raise RuntimeError('bones missing')

if __name__=='__main__':build(sys.argv[1] if len(sys.argv)>1 else str(pathlib.Path(__file__).resolve().parents[1]/'templates/pastel-blocks/models/pastel-scout.vrm'))
