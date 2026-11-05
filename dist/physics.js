import {LIMITS} from './core.js';

export const BODY={radius:.23,height:1.78,step:1.01};
const PASSABLE=new Set(['wire','lamp','solar','plant','flower','switch','tv','water']);
const EPS=.0001;
export function bounds(b){
 if(PASSABLE.has(b.type)||(b.type==='door'&&b.open))return null;
 let hx=.5,hz=.5,height=1;
 if(b.type==='door'||b.type==='window'){hx=.49;hz=.09;if((b.rot||0)%2)[hx,hz]=[hz,hx];}
 if(b.type==='path')height=.1;
 return {x0:b.x-hx,x1:b.x+hx,z0:b.z-hz,z1:b.z+hz,y0:b.y,y1:b.y+height};
}
function under(b,x,z,r=BODY.radius){return x+r>b.x0+EPS&&x-r<b.x1-EPS&&z+r>b.z0+EPS&&z-r<b.z1-EPS;}
export function collides(blocks,x,y,z){return blocks.some(a=>{const b=bounds(a);return b&&under(b,x,z)&&y+BODY.height>b.y0+EPS&&y<b.y1-EPS;});}
export function supportHeight(blocks,x,z,maxY){let top=0;for(const a of blocks){const b=bounds(a);if(b&&under(b,x,z)&&b.y1<=maxY+EPS)top=Math.max(top,b.y1);}return top;}
export function onGround(blocks,p){return p.y<=supportHeight(blocks,p.x,p.z,p.y+.025)+.025;}
export function safePlayer(blocks,p){
 if(!collides(blocks,p.x,p.y,p.z))return {...p};
 const candidates=[{x:p.x,z:p.z}];
 for(let r=1;r<=26;r++)for(let x=-r;x<=r;x++)for(const z of[-r,r])candidates.push({x:p.x+x*.5,z:p.z+z*.5},{x:p.x+z*.5,z:p.z+x*.5});
 for(const q of candidates){if(Math.abs(q.x)>LIMITS.x||Math.abs(q.z)>LIMITS.z)continue;const y=supportHeight(blocks,q.x,q.z,Math.max(2,p.y+BODY.step));if(!collides(blocks,q.x,y,q.z))return {...p,...q,y};}
 return {...p,x:0,z:Math.min(LIMITS.z,5),y:LIMITS.height};
}
export function stepPlayer(blocks,p,velocity,dx,dz,dt){
 const slices=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.1));
 for(let i=0;i<slices;i++)for(const [axis,delta,limit]of[['x',dx/slices,LIMITS.x],['z',dz/slices,LIMITS.z]]){
  const value=Math.max(-limit,Math.min(limit,p[axis]+delta));if(!delta)continue;
  const x=axis==='x'?value:p.x,z=axis==='z'?value:p.z;
  if(!collides(blocks,x,p.y,z)){p[axis]=value;continue;}
  const step=supportHeight(blocks,x,z,p.y+BODY.step);
  if(velocity.y<=0&&onGround(blocks,p)&&step>p.y+EPS&&step-p.y<=BODY.step&&!collides(blocks,x,step,z)){p.y=step;p[axis]=value;velocity.y=0;}
 }
 velocity.y-=15*dt;let next=p.y+velocity.y*dt;
 if(velocity.y<=0){const ground=supportHeight(blocks,p.x,p.z,p.y+.025);if(next<=ground){next=ground;velocity.y=0;}}
 else for(const a of blocks){const b=bounds(a);if(b&&under(b,p.x,p.z)&&p.y+BODY.height<=b.y0+EPS&&next+BODY.height>=b.y0){next=Math.min(next,b.y0-BODY.height);velocity.y=0;}}
 p.y=Math.max(0,next);
 return p;
}
export function toggleDoor(blocks,door,player=null){
 const linked=blocks.filter(b=>b.type==='door'&&b.x===door.x&&b.z===door.z&&(b.rot||0)%2===(door.rot||0)%2);
 const open=!door.open,preview=linked.map(b=>({...b,open}));
 if(!open&&player&&collides(preview,player.x,player.y,player.z))return false;
 for(const b of linked)b.open=open;
 return true;
}
export function cameraClearance(blocks,target,eye){
 const delta=eye.map((v,i)=>v-target[i]),distance=Math.hypot(...delta),steps=Math.ceil(distance/.08);
 for(let i=1;i<=steps;i++){const q=target.map((v,a)=>v+delta[a]*i/steps);if(blocks.some(a=>{const b=bounds(a);return b&&q[0]>b.x0-.12&&q[0]<b.x1+.12&&q[2]>b.z0-.12&&q[2]<b.z1+.12&&q[1]>b.y0-.12&&q[1]<b.y1+.12;})){const t=Math.max(.04,(i-2)/steps);return target.map((v,a)=>v+delta[a]*t);}}
 return eye;
}
