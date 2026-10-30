import test from 'node:test';
import assert from 'node:assert/strict';
import {addBlock,createWorld,createDemo,validateWorld,blueprint,powerStep,key} from '../dist/core.js';
test('block placement enforces plot, height, material and occupied cells',()=>{
 const b=[];assert.equal(addBlock(b,{x:0,y:0,z:0,type:'brick'}),true);assert.equal(addBlock(b,{x:0,y:0,z:0,type:'concrete'}),false);assert.equal(addBlock(b,{x:14,y:0,z:0,type:'brick'}),false);assert.equal(addBlock(b,{x:0,y:12,z:0,type:'brick'}),false);assert.equal(addBlock(b,{x:1,y:0,z:0,type:'unknown'}),false);assert.equal(b.length,1);
});
test('all eight construction steps produce a valid exportable house',()=>{
 const w=createWorld();for(let i=0;i<8;i++)for(const b of blueprint(i))assert.equal(addBlock(w.blocks,b),true);w.stage=8;assert.deepEqual(validateWorld(JSON.parse(JSON.stringify(w))).blocks,w.blocks);assert.equal(new Set(w.blocks.map(key)).size,w.blocks.length);assert.ok(w.blocks.some(b=>b.type==='door'));assert.ok(w.blocks.some(b=>b.type==='solar'));
});
test('world import rejects invalid coordinates, duplicate cells and unknown materials',()=>{
 for(const blocks of [[{x:Infinity,y:0,z:0,type:'brick'}],[{x:0,y:0,z:0,type:'oops'}],[{x:0,y:0,z:0,type:'brick'},{x:0,y:0,z:0,type:'brick'}]])assert.throws(()=>validateWorld({mode:'pro',blocks}));
 assert.throws(()=>validateWorld({mode:'invalid',blocks:[]}));
});
test('solar charges the battery by day and a battery powers the home at night',()=>{
 const w=createDemo();w.clock=12;w.energy.charge=100;let p=powerStep(w,10,{cycle:false,dayMinutes:12});assert.equal(Math.round(p.production),360);assert.equal(p.on,true);assert.ok(w.energy.charge>100);
 w.clock=0;w.energy.charge=100;p=powerStep(w,10,{cycle:false,dayMinutes:12});assert.equal(p.production,0);assert.equal(p.on,true);assert.ok(w.energy.charge<100);
 w.energy.charge=0;p=powerStep(w,1,{cycle:false});assert.equal(p.on,false);
});
test('wiring, switches and breaker limits control appliance power',()=>{
 const w=createDemo();w.energy.breaker=250;addBlock(w.blocks,{x:9,y:0,z:0,type:'tv'});let p=powerStep(w,0,{cycle:false});assert.equal(w.energy.trip,true);assert.equal(w.energy.master,false);assert.equal(p.on,false);
 w.energy.breaker=500;w.energy.trip=false;w.energy.master=true;w.blocks=w.blocks.filter(b=>b.type!=='wire');p=powerStep(w,0);assert.equal(p.connected,false);assert.equal(p.on,false);
});
test('pedal generation is temporary and game time rolls into a new day',()=>{
 const w=createDemo();w.clock=23.99;w.energy.pedal=1;let p=powerStep(w,2,{cycle:true,dayMinutes:4});assert.equal(p.bike,180);assert.equal(w.energy.pedal,0);assert.equal(w.day,2);p=powerStep(w,0);assert.equal(p.bike,0);
});
