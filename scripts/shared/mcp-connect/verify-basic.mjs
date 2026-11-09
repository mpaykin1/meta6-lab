import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const arg=name=>{
  const at=process.argv.indexOf('--'+name);
  return at<0?null:process.argv[at+1];
};
const target={
  config:arg('config')||join(root,'meta-games/connect/config.mjs'),
  page:arg('page')||join(root,'meta-games/connect/index.html'),
  manifest:arg('manifest')||join(root,'meta-games/connect/tools.json'),
  generator:arg('generator')||join(root,'scripts/shared/mcp-connect/generate.mjs')
};
async function run(){
  const html=readFileSync(target.page,'utf8');
  const data=JSON.parse(readFileSync(target.manifest,'utf8'));
  const code=readFileSync(target.generator,'utf8');
  assert.ok(!code.includes("process.argv.includes('--check')"),
    'Generator must not behave differently for test-specific modes');
  const {buildClientConfigs,serverRelativePath}=await import(pathToFileURL(target.config).href);
  assert.ok(html.includes("from './config.mjs'"),'Missing tested config module');
  assert.ok(html.includes("fetch('./tools.json')"),
    'Connect tools source must be live generated tools.json, not a hardcoded list');
  assert.ok(html.includes('buildClientConfigs(input.value)'),'UI must use tested config');
  assert.ok(html.includes('git clone https://github.com/mpaykin1/meta6-lab.git'),'Missing git clone');
  assert.ok(html.includes('node '+serverRelativePath),
    'Clone instructions are not using the real server entrypoint');
  const all=buildClientConfigs(root);
  const launch=all.desktop.mcpServers['meta-games'];
  assert.deepEqual(launch,all.cursor.mcpServers['meta-games']);
  assert.equal(launch.command,'node','Unexpected MCP executable');
  assert.ok(isAbsolute(launch.args[0]),'Expected absolute server file path');
  assert.equal(launch.args[0],resolve(root,serverRelativePath));
  assert.deepEqual(all.vscode.servers['meta-games'],{type:'stdio',...launch});
  assert.ok(all.claudeCode.includes('node "'+launch.args[0]+'"'));
  // Built-in JSON-RPC probe makes permanent mutations runnable by kontur-guard
  // without installing any SDK; the separate M6 workflow uses the official SDK.
  const messages=[
    {jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'m6-mutation-probe',version:'1.0'}}},
    {jsonrpc:'2.0',id:2,method:'tools/list',params:{}},
    {jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'list_games',arguments:{}}}
  ];
  const child=spawnSync(launch.command,launch.args,{
    cwd:tmpdir(),input:messages.map(x=>JSON.stringify(x)).join('\n')+'\n',
    encoding:'utf8',timeout:12000
  });
  assert.equal(child.status,0,'MCP server exited with error: '+child.stderr);
  const lines=child.stdout.trim().split(/\r?\n/).map(line=>JSON.parse(line));
  assert.equal(lines.length,3,'Missing RPC responses');
  assert.ok(lines[0].result?.capabilities?.tools,'MCP initialize failed');
  const live=lines[1].result?.tools;
  assert.ok(Array.isArray(live)&&live.length,'MCP tools/list failed');
  assert.deepEqual(data.tools,live,'Manifest tools do not match MCP tools/list');
  assert.ok(live.some(t=>t.name==='list_games'),'list_games missing');
  const content=lines[2].result?.content?.[0]?.text;
  assert.ok(content,'list_games call failed');
  const games=JSON.parse(content);
  assert.ok(games.length>0,'list_games returned no games');
  console.log('M6_BASIC_PASS tools='+live.length+' games='+games.length);
}
run().catch(e=>{console.error('M6_BASIC_FAIL '+(e.stack||e.message));process.exitCode=1;});
