import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// An independent official MCP client; work from a different cwd to detect cwd bugs.
export async function withMcpClient(launch, callback) {
  const cwd=mkdtempSync(join(tmpdir(),'meta-mcp-client-'));
  const client=new Client({name:'meta-games-connect-external-client',version:'1.0.0'});
  let timer;
  try{
    const transport=new StdioClientTransport({...launch,cwd,stderr:'pipe'});
    const timeout=new Promise((_,reject)=>{
      timer=setTimeout(()=>reject(new Error('MCP SDK connection timed out')),12000);
    });
    await Promise.race([client.connect(transport),timeout]);
    clearTimeout(timer);
    return await callback(client);
  }finally{
    clearTimeout(timer);
    await client.close().catch(()=>{});
    rmSync(cwd,{recursive:true,force:true});
  }
}

export function publicTools(tools){
  return tools.map(({name,description,inputSchema})=>({name,description,inputSchema}));
}
