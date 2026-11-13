import {main} from './build.mjs';
import {existsSync, readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {dispatcherQuotaFallback} from './quota.mjs';

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch(error => {
    const validSnapshot = existsSync('DISPETCHER.md') &&
      readFileSync('DISPETCHER.md', 'utf8').startsWith('# ДИСПЕТЧЕР МГ/МГЛ');
    if (dispatcherQuotaFallback(error, validSnapshot)) {
      console.warn('::warning::GitHub rate limit; previous dispatcher queue preserved');
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
}
