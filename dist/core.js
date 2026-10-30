export const VERSION = '1.0.0';
export const LIMITS = { x: 13, z: 11, height: 12, blocks: 5000 };
export const DEFAULT_AVATAR = {name:'Construtor',skin:'#bc8057',hair:'#30251e',shirt:'#436f54',pants:'#283e45',hat:'#eeb94a',hairStyle:'short',headwear:'helmet',outfit:'overalls',size:1,width:1};
export const DEFAULT_SETTINGS = {quality:'balanced',sound:true,volume:.35,dayMinutes:12,cycle:true,language:'auto'};
export const DEFAULT_ENERGY = {master:false,grid:false,lights:true,tv:true,breaker:500,charge:0,trip:false,pedal:0};
export const MATERIALS = [
 {id:'concrete',group:'structure',color:'#abb1a5'}, {id:'brick',group:'structure',color:'#c07b53'},
 {id:'pillar',group:'structure',color:'#c7c7b3'}, {id:'beam',group:'structure',color:'#c2c3b0'},
 {id:'roof',group:'structure',color:'#6d806a'}, {id:'wood',group:'structure',color:'#ae855c'},
 {id:'door',group:'structure',color:'#82583b'}, {id:'window',group:'structure',color:'#88b4b1'},
 {id:'plaster',group:'finish',color:'#ece7cf'}, {id:'sage',group:'finish',color:'#7e9b80'},
 {id:'sand',group:'finish',color:'#d5ad80'}, {id:'floor',group:'finish',color:'#c8b89b'},
 {id:'glass',group:'finish',color:'#9bc4c5'}, {id:'stone',group:'finish',color:'#8c9786'},
 {id:'grass',group:'finish',color:'#8eb172'}, {id:'water',group:'finish',color:'#6ba6be'},
 {id:'solar',group:'energy',color:'#4e7288'}, {id:'battery',group:'energy',color:'#4b6356'},
 {id:'wire',group:'energy',color:'#d6a32d'}, {id:'switch',group:'energy',color:'#d5dac9'},
 {id:'lamp',group:'energy',color:'#f1d47e'}, {id:'tv',group:'energy',color:'#354e53'},
 {id:'bike',group:'energy',color:'#ce8b4f'}, {id:'plant',group:'decor',color:'#679065'},
 {id:'flower',group:'decor',color:'#d4a5a1'}, {id:'chair',group:'decor',color:'#b48b62'},
 {id:'table',group:'decor',color:'#b59469'}, {id:'sofa',group:'decor',color:'#7b9c8b'},
 {id:'fence',group:'decor',color:'#d9d7bd'}, {id:'path',group:'decor',color:'#c1c2ab'},
 {id:'black',group:'structure',color:'#3d4a42'}
];
export const MATERIAL_MAP=Object.fromEntries(MATERIALS.map(m=>[m.id,m]));
export const STAGES = [
 {id:'base',material:'concrete',icon:'layers'},
 {id:'seal',material:'black',icon:'droplets'},
 {id:'pillars',material:'pillar',icon:'columns-3'},
 {id:'walls',material:'brick',icon:'brick-wall'},
 {id:'openings',material:'window',icon:'door-open'},
 {id:'roof',material:'roof',icon:'house'},
 {id:'finish',material:'plaster',icon:'paint-roller'},
 {id:'power',material:'solar',icon:'zap'}
];
export const key=b=>`${b.x},${b.y},${b.z}`;
export function validBlock(b) {return b && [b.x,b.y,b.z].every(Number.isInteger) && Math.abs(b.x)<=LIMITS.x && Math.abs(b.z)<=LIMITS.z && b.y>=0 && b.y<LIMITS.height && !!MATERIAL_MAP[b.type];}
export function addBlock(blocks,b){if(!validBlock(b)||blocks.length>=LIMITS.blocks||blocks.some(a=>key(a)===key(b)))return false;blocks.push({...b,rot:((b.rot||0)%4+4)%4});return true;}
export function createWorld(name='Minha primeira casa',mode='beginner') {return {version:VERSION,id:globalThis.crypto?.randomUUID?.()||`world-${Date.now()}`,name:name.slice(0,40),mode,blocks:[],stage:0,clock:10.5,day:1,energy:{...DEFAULT_ENERGY},player:{x:-5,z:5,y:0},created:Date.now(),updated:Date.now()};}
export function validateWorld(raw){
 if(!raw||!Array.isArray(raw.blocks)||!['beginner','pro'].includes(raw.mode)||raw.blocks.length>LIMITS.blocks)throw new Error('invalidWorld');
 const w=createWorld(typeof raw.name==='string'?raw.name:'ChimpiConstruções',raw.mode),seen=new Set();
 for(const b of raw.blocks){if(!validBlock(b)||seen.has(key(b)))throw new Error('invalidWorld');seen.add(key(b));w.blocks.push({...b,rot:Number.isInteger(b.rot)?b.rot%4:0});}
 w.id=typeof raw.id==='string'?raw.id.slice(0,80):w.id;w.stage=Math.min(8,Math.max(0,Math.trunc(Number(raw.stage)||0)));w.clock=Number.isFinite(raw.clock)?((raw.clock%24)+24)%24:10.5;
 w.day=Number.isFinite(raw.day)?Math.max(1,Math.floor(raw.day)):1;w.updated=Number(raw.updated)||Date.now();
 if(raw.energy){for(const k of ['master','grid','lights','tv','trip'])if(typeof raw.energy[k]==='boolean')w.energy[k]=raw.energy[k];w.energy.breaker=[250,500,1000,2000].includes(raw.energy.breaker)?raw.energy.breaker:500;w.energy.charge=Math.max(0,Math.min(50000,Number(raw.energy.charge)||0));}
 if(raw.player&&[raw.player.x,raw.player.z,raw.player.y].every(Number.isFinite))w.player={x:Math.max(-13,Math.min(13,raw.player.x)),z:Math.max(-11,Math.min(11,raw.player.z)),y:Math.max(0,Math.min(12,raw.player.y))};
 return w;
}
function put(a,x,y,z,type,rot=0){a.push({x,y,z,type,rot});}
export function blueprint(index){
 const a=[];
 if(index===0){for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)put(a,x,0,z,'concrete');put(a,0,0,3,'floor');}
 if(index===1){for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)if(Math.abs(x)===3||Math.abs(z)===2)put(a,x,1,z,'black');}
 if(index===2){for(const x of [-3,3])for(const z of [-2,2])for(let y=2;y<=4;y++)put(a,x,y,z,'pillar');}
 if(index===3){for(let y=2;y<=4;y++)for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++){
  if(Math.abs(x)!==3&&Math.abs(z)!==2)continue;if(Math.abs(x)===3&&Math.abs(z)===2)continue;
  if(z===2&&x===0&&y<4)continue;if(y===3&&((z===2&&x===-2)||(x===3&&z===0)||(z===-2&&x===0)))continue;
  put(a,x,y,z,'brick');
 }}
 if(index===4){put(a,0,2,2,'door');put(a,0,3,2,'door');put(a,-2,3,2,'window');put(a,3,3,0,'window',1);put(a,0,3,-2,'window');for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)if(Math.abs(x)===3||Math.abs(z)===2)put(a,x,5,z,'beam');}
 if(index===5){for(let x=-4;x<=4;x++)for(let z=-3;z<=3;z++)put(a,x,6+Math.max(0,2-Math.abs(z)),z,'roof',z<0?2:0);}
 if(index===6){for(let x=-2;x<=2;x++)for(let z=-1;z<=1;z++)put(a,x,1,z,'floor');put(a,-4,1,3,'plant');put(a,4,1,3,'flower');put(a,2,2,-1,'table');put(a,1,2,-1,'chair');}
 if(index===7){put(a,0,9,0,'solar');put(a,1,9,0,'solar');put(a,-2,2,-1,'battery');put(a,-2,3,-1,'switch');put(a,-2,4,-1,'wire');put(a,-1,4,-1,'lamp');put(a,2,3,-1,'tv');put(a,-5,0,0,'bike');}
 return a;
}
export function createDemo(){const w=createWorld('Casa Aurora','pro');for(let s=0;s<8;s++)for(const b of blueprint(s))addBlock(w.blocks,b);w.stage=8;w.energy={...DEFAULT_ENERGY,master:true,charge:370};return w;}
export function countMaterials(blocks){const n={};for(const b of blocks)n[b.type]=(n[b.type]||0)+1;return n;}
export function powerStep(world,dt=0,{cycle=true,dayMinutes=12}={}){
 const e=world.energy,n=countMaterials(world.blocks),hours=dt*24/(Math.max(2,dayMinutes)*60);
 if(cycle){const next=world.clock+hours;if(next>=24)world.day+=Math.floor(next/24);world.clock=next%24;}
 const sunlight=Math.max(0,Math.sin((world.clock-6)/12*Math.PI));
 const solar=(n.solar||0)*180*sunlight,bike=(n.bike||0)&&e.pedal>0?180:0;
 e.pedal=Math.max(0,(e.pedal||0)-dt);
 const capacity=(n.battery||0)*500;e.charge=Math.max(0,Math.min(capacity,e.charge));
 const connected=!!(n.wire&&n.switch),demand=(e.lights?(n.lamp||0)*12:0)+(e.tv?(n.tv||0)*120:0);
 if(e.master&&connected&&demand>e.breaker){e.trip=true;e.master=false;}
 const grid=e.grid?1500:0,production=solar+bike;
 const on=!!(e.master&&!e.trip&&connected&&(production+grid>0||e.charge>0));
 const use=on?demand:0;
 const available=production+grid;
 if(e.master&&!e.trip&&connected&&capacity)e.charge=Math.max(0,Math.min(capacity,e.charge+(available-use)*hours));
 const supplied=on?Math.min(use,available+(e.charge>0?e.breaker:0)):0;
 return {production,solar,bike,demand,use:supplied,capacity,charge:e.charge,percent:capacity?e.charge/capacity*100:0,on,connected,sunlight,grid,panels:n.solar||0,batteries:n.battery||0,net:available-use};
}
