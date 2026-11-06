// Historical filename retained; owner correction 032: one cycle (60 virtual seconds), not 5 minutes.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGuestSchedule,guestScheduleStep,finishGuestSchedule} from '../stage7-simulation.mjs';

test('E: one guest arrives in 60 virtual seconds; never two active',()=>{
 const state=createGuestSchedule(1337),dt=1/30;
 let alive=false,arrivals=0,first=-1,ended=false;
 for(let step=0;step<1800;step++){
  const seconds=step*dt;
  if(guestScheduleStep(state,dt,alive)){
   assert.equal(alive,false,'guest overlap');
   alive=true;arrivals++;first=seconds;
  }
  if(alive&&seconds-first>2&&!ended){
   alive=false;ended=true;
   const interval=finishGuestSchedule(state);
   assert(interval>=50&&interval<=70,'rearm 50–70 s');
  }
 }
 assert.equal(arrivals,1,'exactly one arrival per first 60 s');
 assert(ended,'guest arc concluded');
 assert.equal(1800*dt,60);
});
