import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemo,createWorld,validateWorld} from '../dist/core.js';
import {stepPlayer,toggleDoor,collides,safePlayer,cameraClearance,BODY} from '../dist/physics.js';

function walk(w,dx,dz,seconds=2){const velocity={y:0};for(let t=0;t<seconds;t+=1/60)stepPlayer(w.blocks,w.player,velocity,dx/60,dz/60,1/60);}
test('the completed house is accessible through its door and the same doorway blocks entry when closed',()=>{
 const w=createDemo(),door=w.blocks.find(b=>b.type==='door');
 walk(w,0,-3.7);assert.ok(w.player.z>2,'closed door stops entry');
 assert.equal(toggleDoor(w.blocks,door,w.player),true);walk(w,0,-3.7,.8);
 assert.ok(w.player.z<1.5,'player crosses the entrance');assert.equal(w.player.y,2,'interior floor supports the player');
 assert.equal(collides(w.blocks,w.player.x,w.player.y,w.player.z),false);
 walk(w,0,-6,3);assert.ok(w.player.z> -1.3,'back wall stops the player');
});
test('door cannot be closed on the player and both halves keep their saved open state',()=>{
 const w=createDemo(),door=w.blocks.find(b=>b.type==='door');toggleDoor(w.blocks,door);
 w.player={...w.player,x:0,y:2,z:2};assert.equal(toggleDoor(w.blocks,door,w.player),false);
 w.activity='play';w.player.viewYaw=1.1;
 const restored=validateWorld(JSON.parse(JSON.stringify(w)));
 assert.equal(restored.activity,'play');assert.equal(restored.player.viewYaw,1.1);
 assert.equal(restored.blocks.filter(b=>b.type==='door').every(b=>b.open),true);
 assert.equal(validateWorld({...w,activity:'invalid'}).activity,'build');
});
test('jumping hits a ceiling and does not land on a roof above the player',()=>{
 const w=createWorld();w.blocks=[{x:0,y:3,z:0,type:'concrete'}];w.player={x:0,y:1,z:0};const v={y:5.8};
 let highest=1;for(let i=0;i<90;i++){stepPlayer(w.blocks,w.player,v,0,0,1/60);highest=Math.max(highest,w.player.y);}
 assert.ok(highest<=3-BODY.height+.001);assert.equal(w.player.y,0);
});
test('entering play relocates a character covered by newly placed blocks and the follow camera stays outside walls',()=>{
 const blocks=[{x:0,y:0,z:0,type:'brick'},{x:0,y:1,z:0,type:'brick'}],p=safePlayer(blocks,{x:0,y:0,z:0});
 assert.equal(collides(blocks,p.x,p.y,p.z),false);
 const eye=cameraClearance([{x:0,y:1,z:2,type:'brick'}],[0,1.5,0],[0,1.5,5]);assert.ok(eye[2]<1.5);
});
