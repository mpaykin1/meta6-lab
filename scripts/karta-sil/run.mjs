import {main} from './build.mjs';
main().catch(error=>{console.error('КАРТА СИЛ: нет данных, публикация отменена:',error);process.exitCode=1});
