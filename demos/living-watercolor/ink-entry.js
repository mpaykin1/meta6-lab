if(new URLSearchParams(location.search).get('reference')==='1'){
  await import('./client.js');
}else{
  await import('./ink-forest.js');
}
