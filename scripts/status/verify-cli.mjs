import fs from 'node:fs';
import {verify} from './verify.mjs';
import {contentRevision, finishCount} from './revision.mjs';
const rev = process.argv[2] || 'HEAD';
const sha=contentRevision(rev);
const count=finishCount(fs.readFileSync('rules/09-platforma/FINISH.md','utf8'));
verify(fs.readFileSync('STATUS.md','utf8'),sha,count);
console.log('STATUS_OK '+sha);
