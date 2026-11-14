import fs from 'node:fs/promises';
import {numbersFromTable,requestBatch} from './pr-status-batch.mjs';

const markdown=await fs.readFile(process.argv[2],'utf8');
const states=await requestBatch(numbersFromTable(markdown),{
 repository:process.env.PR_STATUS_REPOSITORY,token:process.env.GH_TOKEN});
process.stdout.write(JSON.stringify(states));
