import {main,markNoData} from './build.mjs';

main().catch(async error=>{
  console.error('КАРТА СИЛ: нет данных, публикация отменена:', error);
  try { await markNoData(); }
  catch (writeError) { console.error('Не удалось сбросить старую карту:',writeError); }
  process.exitCode=1;
});
