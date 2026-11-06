const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const key='<script type="module">',start=html.indexOf(key),end=html.indexOf('</script>',start);if(start<0||end<0)throw Error('game module missing');
const file=path.join(os.tmpdir(),'island-biomes-'+process.pid+'.mjs');
try{fs.writeFileSync(file,html.slice(start+key.length,end));cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});}finally{fs.rmSync(file,{force:true});}
console.log('PASS module JavaScript syntax');
