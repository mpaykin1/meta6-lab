/* SYMPHONIA · глава «Увертюра» — заглушка площадки БЕЗ РЕКЛАМЫ (правило BEZ_REKLAMY §3.2).
   Даёт игре язык и сохранения через localStorage. Рекламных методов здесь нет. */
(function(){
  var lang=((navigator.language||'ru')+'').slice(0,2).toLowerCase();
  var store={
    get:function(keys){return Promise.resolve((keys||[]).map(function(k){try{return localStorage.getItem('sym_'+k)}catch(e){return null}}))},
    set:function(keys,vals){keys=[].concat(keys);vals=[].concat(vals);keys.forEach(function(k,i){try{localStorage.setItem('sym_'+k,typeof vals[i]==='string'?vals[i]:JSON.stringify(vals[i]))}catch(e){}});return Promise.resolve()}
  };
  window.bridge={
    initialize:function(){return Promise.resolve()},
    EVENT_NAME:{PAUSE_STATE_CHANGED:'pause_state_changed',AUDIO_STATE_CHANGED:'audio_state_changed'},
    platform:{language:lang,isAudioEnabled:true,on:function(){},sendMessage:function(){}},
    storage:store
  };
})();
