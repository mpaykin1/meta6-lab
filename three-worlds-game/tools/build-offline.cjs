// Reproducible offline export. Build dependencies only: three@0.160.0 and esbuild.
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..');
const esbuild=require(process.env.THREE_WORLDS_ESBUILD||'esbuild');
const threeRoot=process.env.THREE_WORLDS_THREE||path.dirname(path.dirname(require.resolve('three')));
(async()=>{
 const sourcePath=path.join(dir,'index.source.html');
 if(!fs.existsSync(sourcePath))throw Error('index.source.html is required; never bundle generated output recursively');
 let html=fs.readFileSync(sourcePath,'utf8');
 let main=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 const imports=(main.match(/^import .+;$/gm)||[]).join('\n');
 main=imports+'\n(async()=>{\n'+main.replace(/^import .+;$/gm,'')+'\n})().catch(e=>{console.error(e);const el=document.getElementById("loading");if(el)el.textContent="Ошибка запуска: "+e.message});';
 const result=await esbuild.build({stdin:{contents:main,resolveDir:dir,loader:'js'},bundle:true,write:false,minify:true,format:'iife',target:'es2020',plugins:[{name:'local-three',setup(build){build.onResolve({filter:/^three($|\/)/},args=>({path:path.join(threeRoot,args.path==='three'?'build/three.module.js':args.path.replace('three/addons/','examples/jsm/'))}))}}]});
 const models={};for(const name of fs.readdirSync(path.join(dir,'models')))if(name.endsWith('.glb'))models[name.slice(0,-4)]=fs.readFileSync(path.join(dir,'models',name)).toString('base64');
 html=html.replace(/<link\b[^>]*href="https?:[^>]*>/g,'');
 html=html.replace(/<link rel="stylesheet" href="\.\/mobile-controls.css">/,'<style>'+fs.readFileSync(path.join(dir,'mobile-controls.css'),'utf8')+'</style>');
 html=html.replace(/<script src="\.\/([^"/]+\.js)"><\/script>/g,(_,name)=>'<script>'+fs.readFileSync(path.join(dir,name),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
 html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'');
 const embedded='globalThis.__threeWorldsModels='+JSON.stringify(models)+';\n'+result.outputFiles[0].text;
 html=html.replace(/<script type="module">[\s\S]*?<\/script>/,()=>'<script>'+embedded.replace(/<\/script/gi,'<\\/script')+'</script>');
 fs.writeFileSync(process.env.THREE_WORLDS_OUTPUT||path.join(dir,'index.html'),html);
 const external=/<script[^>]+src=|<link[^>]+href=["']https?:/.test(html);if(external)throw Error('Export contains external script/link');
 console.log(JSON.stringify({output:'three-worlds-game/index.html',bytes:Buffer.byteLength(html),embeddedModels:Object.keys(models).length,externalScriptsOrLinks:external}));
})().catch(e=>{console.error(e);process.exitCode=1});
