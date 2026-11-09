import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {buildClientConfigs} from '../../../meta-games/connect/config.mjs';
import {publicTools,withMcpClient} from './sdk-client.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const target=join(root,'meta-games/connect/tools.json');
const launch=buildClientConfigs(root).desktop.mcpServers['meta-games'];
const json=await withMcpClient(launch,async client=>{
  const page=await client.listTools();
  assert.ok(page.tools?.length,'MCP tools/list returned no tools');
  return JSON.stringify({tools:publicTools(page.tools)},null,2)+'\n';
});
if(process.argv.includes('--check')){
  assert.equal(readFileSync(target,'utf8'),json,'tools.json drifted from live MCP tools/list — regenerate it');
  console.log('M6_GENERATED_TOOLS_MATCH');
}else{
  writeFileSync(target,json);
  console.log('M6_GENERATED_TOOLS '+target);
}
