import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const path=new URL('../../.github/workflows/library-machine.yml',import.meta.url);
const source=await fs.readFile(path,'utf8');
const strict="if: github.event_name == 'push' && github.ref == 'refs/heads/lab/library-machine-sync'";
const mainOnly="if: github.event_name == 'push' && github.ref == 'refs/heads/main'";
function verify(text){
 const writer=text.match(/      - name: Commit newly extracted assets on the feature branch\n([\s\S]*?)(?=\n      - name:|$)/);
 assert.ok(writer,'branch-writer must remain in workflow');
 assert.ok(writer[1].includes(strict),'only owned library-machine-sync may be written');
 assert.ok(!writer[1].includes("github.ref != 'refs/heads/main'"),'foreign PR must be read-only');
 assert.ok(text.includes(mainOnly),'main still proposes a separate library sync PR');
 assert.ok(text.includes("git diff --exit-code -- shared/library"),'source inventory guard must remain');
}
verify(source);
const mutants=[
 ['all-feature-branches',strict,"if: github.event_name == 'push' && github.ref != 'refs/heads/main'"],
 ['main-branch-writer',strict,"if: github.event_name == 'push' && github.ref == 'refs/heads/main'"],
 ['deception-broad-prefix',strict,"if: github.event_name == 'push' && startsWith(github.ref, 'refs/heads/lab/')"],
 ['removed-independent-index', "git diff --exit-code -- shared/library", "echo skipped"],
];
for(const [name,before,after] of mutants){
 assert.ok(source.includes(before),'mutation anchor missing: '+name);
 assert.throws(()=>verify(source.replace(before,after)),undefined,'mutation escaped: '+name);
}
console.log('PASS: four branch-ownership mutation traps');
