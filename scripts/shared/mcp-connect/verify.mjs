import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,isAbsolute,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {buildClientConfigs} from '../../../meta-games/connect/config.mjs';
import {publicTools,withMcpClient} from './sdk-client.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const arg=name=>{
  const index=process.argv.indexOf('--'+name);
  return index<0?null:process.argv[index+1];
};
const pageFile=arg('page')||join(root,'meta-games/connect/index.html');
const manifestFile=arg('manifest')||join(root,'meta-games/connect/tools.json');
const configFile=arg('config')||join(root,'meta-games/connect/config.mjs');

async function run(){
  const html=readFileSync(pageFile,'utf8');
  const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
  const {buildClientConfigs:build,serverRelativePath}=await import(pathToFileURL(configFile).href);
  assert.equal(typeof buildClientConfigs,'function');
  assert.ok(html.includes("from './config.mjs'"),'Connect page does not use the tested config module');
  assert.ok(html.includes("fetch('./tools.json')"),'Connect tools source must be live generated tools.json, not a hardcoded list');
  assert.ok(html.includes('buildClientConfigs(input.value)'),'Connect UI must generate the same configurations');
  for(const id of ['desktop-code','cursor-code','vscode-code','claude-code','clone-path','tools']){
    assert.ok(html.includes('id="'+id+'"'),'Missing required Connect UI: '+id);
  }
  assert.ok(html.includes('git clone https://github.com/mpaykin1/meta6-lab.git'),'Missing local clone command');
  assert.ok(html.includes('node '+serverRelativePath),'Clone instructions are not using the real server entrypoint');
  const configs=build(root);
  const entry=configs.desktop.mcpServers['meta-games'];
  assert.deepEqual(entry,configs.cursor.mcpServers['meta-games'],'Cursor launch differs');
  assert.equal(entry.command,'node','Unexpected MCP executable');
  assert.ok(isAbsolute(entry.args[0]),'MCP server path must be absolute');
  assert.equal(entry.args[0],resolve(root,serverRelativePath),'MCP path differs from repository entrypoint');
  assert.deepEqual(configs.vscode.servers['meta-games'],{type:'stdio',...entry},'VS Code launch differs');
  assert.ok(configs.claudeCode.includes('node "'+entry.args[0]+'"'),'Claude Code launch differs');
  // Test the commands the actual page gives the user, not a special test-only server command.
  await withMcpClient(entry,async client=>{
    const response=await client.listTools();
    const actual=publicTools(response.tools);
    assert.ok(actual.length>=1,'Server provides no tools');
    assert.deepEqual(manifest.tools,actual,'Manifest tools do not match MCP SDK tools/list');
    const gameTool=actual.find(x=>x.name==='list_games');
    assert.ok(gameTool,'list_games missing from MCP tools/list');
    const call=await client.callTool({name:'list_games',arguments:{}});
    assert.equal(call.isError,true===false,'list_games must not return MCP error');
    assert.ok(Array.isArray(call.content)&&call.content[0]?.type==='text','list_games has no text content');
    const games=JSON.parse(call.content[0].text);
    assert.ok(Array.isArray(games)&&games.length>0,'list_games returned no games');
    const storefront=readFileSync(join(root,'meta-games/index.html'),'utf8');
    const count=[...storefront.matchAll(/<a\b[^>]*class="game"[^>]*>/g)].length;
    assert.equal(games.length,count,'list_games differs from storefront');
    assert.ok(games.every(g=>g.id&&g.title&&g.path&&g.url),'Malformed list_games entries');
    console.log('M6_EXTERNAL_CLIENT_PASS tools='+actual.length+' games='+games.length);
  });
}
run().catch(e=>{console.error('M6_CHECK_FAIL '+(e.stack||e.message));process.exitCode=1;});
