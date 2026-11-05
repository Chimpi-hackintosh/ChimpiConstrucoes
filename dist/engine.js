import {MATERIAL_MAP} from './core.js';
import {cameraClearance} from './physics.js';
const v3={sub:(a,b)=>a.map((v,i)=>v-b[i]),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit:a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)},dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)};
function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function invert(a){const b=Array.from({length:4},(_,r)=>[...Array.from({length:4},(_,c)=>a[c*4+r]),...Array.from({length:4},(_,c)=>r===c?1:0)]);for(let i=0;i<4;i++){let row=i;for(let j=i+1;j<4;j++)if(Math.abs(b[j][i])>Math.abs(b[row][i]))row=j;[b[i],b[row]]=[b[row],b[i]];const d=b[i][i]||1e-10;for(let c=0;c<8;c++)b[i][c]/=d;for(let r=0;r<4;r++)if(r!==i){const k=b[r][i];for(let c=0;c<8;c++)b[r][c]-=b[i][c]*k;}}return new Float32Array(Array.from({length:16},(_,i)=>b[i%4][Math.floor(i/4)+4]));}
function transform(m,p){const r=[0,0,0,0];for(let i=0;i<4;i++)for(let j=0;j<4;j++)r[i]+=m[j*4+i]*(p[j]??1);return r.slice(0,3).map(v=>v/r[3]);}
function lookAt(eye,target){const z=v3.unit(v3.sub(eye,target)),x=v3.unit(v3.cross([0,1,0],z)),y=v3.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-v3.dot(x,eye),-v3.dot(y,eye),-v3.dot(z,eye),1]);}
function perspective(fov,aspect,near,far,offset=0){const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,offset,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
function rgb(hex){return hex.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16)/255);}
function shade(c,k){return c.map(v=>Math.min(1,v*k));}
function rotate(p,rx=0,ry=0,rz=0){let[x,y,z]=p;[y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];[x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];return [x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];}
class Geometry{
 constructor(){this.vertices=[];}
 tri(a,b,c,color){const n=v3.unit(v3.cross(v3.sub(b,a),v3.sub(c,a))),col=typeof color==='string'?rgb(color):color;for(const p of[a,b,c])this.vertices.push(...p,...n,...col);}
 box(x,y,z,w,h,d,color,rx=0,ry=0,rz=0){const pts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>{const q=rotate([p[0]*w/2,p[1]*h/2,p[2]*d/2],rx,ry,rz);return [q[0]+x,q[1]+y,q[2]+z]});const faces=[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]];for(const f of faces){this.tri(pts[f[0]],pts[f[1]],pts[f[2]],color);this.tri(pts[f[0]],pts[f[2]],pts[f[3]],color);}}
 cylinder(x,y,z,r,h,color,sides=8){for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2,p=[x+Math.cos(a)*r,y-h/2,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y-h/2,z+Math.sin(b)*r],s=[p[0],y+h/2,p[2]],t=[q[0],y+h/2,q[2]];this.tri(p,s,t,color);this.tri(p,t,q,color);this.tri([x,y+h/2,z],t,s,color);}}
}
function model(g,b,on=true){
 const {x,y,z,type}=b,Y=y+.5,c=MATERIAL_MAP[type]?.color||'#aaaaaa',r=((b.rot||0)+(b.open?1:0))*Math.PI/2,hinge=type==='door'&&b.open?rotate([-.41,0,-.4],0,(b.rot||0)*Math.PI/2):[0,0,0];
 const box=(dx,dy,dz,w,h,d,col=c)=>{const p=rotate([dx,dy,dz],0,r,0);g.box(x+p[0]+hinge[0],Y+p[1],z+p[2]+hinge[2],w,h,d,col,0,r);};
 if(['brick','concrete','pillar','beam','plaster','sage','sand','floor','wood','stone','grass','water','glass','black'].includes(type)){
  box(0,0,0,.99,.99,.99);
  if(type==='brick'){for(const sy of[-.33,0,.33]){box(0,sy,.5,.99,.026,.008,'#d6ab83');box(.5,sy,0,.008,.026,.99,'#d6ab83');}box(0,.17,.501,.025,.31,.008,'#d6ab83');box(-.25,-.17,.501,.025,.31,.008,'#d6ab83');box(.501,.17,0,.008,.31,.025,'#d6ab83');}
  if(type==='wood'||type==='floor'){for(const i of[-.25,0,.25])box(i,.501,0,.012,.006,.98,'#98754f');}
  if(type==='pillar'){box(0,0,.501,.11,.94,.008,'#d5d4bf');}
  return;
 }
 if(type==='roof'){box(0,0,0,1.04,1,1.06);for(const j of[-.36,-.12,.12,.36])box(j,.51,0,.025,.025,1.05,'#8b9a7d');return;}
 if(type==='window'){box(0,0,0,.99,.99,.18,'#f4eeda');box(-.22,0,.11,.39,.76,.04,'#8fbfc1');box(.22,0,.11,.39,.76,.04,'#8fbfc1');box(0,0,.15,.045,.85,.045,'#f4eeda');box(0,-.16,.15,.85,.04,.045,'#f4eeda');box(-.1,.18,.16,.03,.22,.01,'#d5ece5');return;}
 if(type==='door'){box(0,0,0,.97,.99,.18,c);box(-.3,0,.12,.05,.85,.03,'#a48054');box(.3,0,.12,.05,.85,.03,'#a48054');box(.3,-.15,.17,.08,.06,.08,'#e3bc67');return;}
 if(type==='solar'){box(0,-.3,0,1.02,.2,.98,'#cbd0bd');box(0,-.18,0,.94,.05,.9,'#3b617f');for(let i=-.3;i<=.31;i+=.2)box(i,-.15,0,.012,.008,.9,'#93b9cd');for(let i=-.3;i<=.31;i+=.2)box(0,-.15,i,.94,.008,.012,'#93b9cd');return;}
 if(type==='battery'){box(0,0,0,.66,.8,.55,'#354d45');box(0,.43,0,.45,.08,.3,'#27392f');box(0,0,.285,.38,.53,.018,'#9ba985');for(let i=0;i<3;i++)box(0,-.16+i*.15,.3,.27,.09,.02,on?'#c9e783':'#6a7764');return;}
 if(type==='wire'){box(0,0,0,.08,.99,.08,'#d1aa46');for(let i=-.35;i<=.36;i+=.18)box(0,i,.05,.1,.05,.03,'#344c45');return;}
 if(type==='switch'){box(0,0,0,.45,.65,.17,'#dce0cf');box(0,0,.12,.17,.25,.12,on?'#a7c167':'#7b7e70');return;}
 if(type==='lamp'){box(0,.3,0,.08,.4,.08,'#344c3d');box(0,-.02,0,.7,.18,.7,'#d6b75e');box(0,-.16,0,.35,.18,.35,on?'#fff0b8':'#bbc6a9');return;}
 if(type==='tv'){box(0,0,0,.9,.59,.13,'#344b4a');box(0,0,.08,.79,.47,.02,on?'#99bfbe':'#526260');if(on){box(-.18,-.06,.1,.27,.2,.008,'#b6d0a5');box(.2,.05,.1,.3,.23,.008,'#d8c790');}box(0,-.4,0,.09,.2,.1,'#344b4a');box(0,-.48,0,.5,.04,.25,'#344b4a');return;}
 if(type==='plant'||type==='flower'){box(0,-.3,0,.58,.38,.58,'#b27c55');box(0,-.08,0,.66,.1,.66,'#c49369');box(0,.2,0,.09,.5,.09,'#5a8055');for(let i=0;i<5;i++){const a=i*2.4;box(Math.cos(a)*.19,.18+(i%2)*.14,Math.sin(a)*.18,.32,.22,.25,type==='flower'?(i%2?'#efc1a4':'#d7a19b'):'#719267');}return;}
 if(type==='chair'){box(0,-.05,0,.73,.13,.7);box(0,.3,-.29,.73,.6,.12);for(const a of[-.27,.27])for(const b of[-.25,.25])box(a,-.3,b,.09,.5,.09);return;}
 if(type==='table'){box(0,.25,0,.96,.16,.9);for(const a of[-.35,.35])for(const b of[-.3,.3])box(a,-.15,b,.1,.7,.1);return;}
 if(type==='sofa'){box(0,-.17,0,.98,.4,.83);box(0,.2,-.3,.98,.65,.2);for(const a of[-.43,.43])box(a,.03,0,.14,.4,.85);return;}
 if(type==='fence'){for(const a of[-.37,.37])box(a,0,0,.12,1,.12);for(const a of[-.16,.2])box(0,a,0,1,.1,.09);return;}
 if(type==='path'){box(0,-.45,0,.85,.1,.85);return;}
 if(type==='bike'){for(const a of[-.32,.32]){box(a,-.15,0,.1,.59,.59,'#324b42');box(a,-.15,0,.12,.37,.37,'#bbbea6');}box(0,.02,0,.65,.12,.09);box(.3,.25,0,.09,.54,.09);box(.3,.45,0,.09,.09,.44,'#3a4e3f');box(-.22,.36,0,.35,.12,.24,'#394d42');return;}
 box(0,0,0,1,1,1);
}
export class WorldRenderer{
 constructor(canvas){
  this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});if(!this.gl)throw Error('WebGL');
  const gl=this.gl,vs=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;uniform mat4 uMatrix;varying vec3 vColor;varying float vLight;void main(){gl_Position=uMatrix*vec4(aPosition,1.0);vColor=aColor;vLight=0.68+max(dot(normalize(aNormal),normalize(vec3(-0.6,1.0,0.8))),0.0)*0.34;}`,
  fs=`precision mediump float;varying vec3 vColor;varying float vLight;uniform float uDay;uniform float uAlpha;void main(){vec3 c=vColor*vLight*mix(vec3(0.35,0.46,0.58),vec3(1.0),uDay);gl_FragColor=vec4(c,uAlpha);}`;
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error('Shader link');gl.useProgram(this.program);
  this.attr=['aPosition','aNormal','aColor'].map(n=>gl.getAttribLocation(this.program,n));this.uMatrix=gl.getUniformLocation(this.program,'uMatrix');this.uDay=gl.getUniformLocation(this.program,'uDay');this.uAlpha=gl.getUniformLocation(this.program,'uAlpha');
  this.staticBuffer=gl.createBuffer();this.dynamicBuffer=gl.createBuffer();this.staticCount=0;this.yaw=.64;this.pitch=.65;this.distance=26;this.target=[0,2,0];this.menu=true;this.mode='orbit';this.blocks=[];this.quality='balanced';this.time=0;this.on=true;this.inverse=null;
  gl.enable(gl.DEPTH_TEST);this.resize();this.environment=new Geometry();this.makeEnvironment();
 }
 resize(){const ratio=Math.min(devicePixelRatio||1,this.quality==='low'?1:this.quality==='high'?2:1.5),w=Math.round(this.canvas.clientWidth*ratio),h=Math.round(this.canvas.clientHeight*ratio);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.gl.viewport(0,0,w,h);}
 makeEnvironment(){const g=this.environment;
  for(let x=-13;x<=13;x++)for(const z of[-11.75,11.75])g.box(x,-.8,z,1,1.5,.5,'#aebf8c');
  for(let z=-11;z<=11;z++)for(const x of[-13.75,13.75])g.box(x,-.8,z,.5,1.5,1,'#aebf8c');
  for(let x=-13;x<=13;x++)for(let z=-11;z<=11;z++){const v=(Math.sin(x*38.3+z*12.9)+1)/2,c=v>.5?'#a7c18b':'#a4be86';g.tri([x-.49,0,z-.49],[x-.49,0,z+.49],[x+.49,0,z+.49],c);g.tri([x-.49,0,z-.49],[x+.49,0,z+.49],[x+.49,0,z-.49],c);}
  // Cut soil layers give the site the feel of a small architectural model
  g.box(0,-.82,11.99,28,.28,.03,'#b5a27e');g.box(13.99,-.82,0,.03,.28,24,'#b5a27e');
  for(let x=-11;x<=10;x+=2){g.box(x,.7,-9,.16,1.5,.16,'#ded8bc');g.box(x+1,.48,-9,2,.13,.1,'#ded8bc');g.box(x+1,1,-9,2,.13,.1,'#ded8bc');}
  for(let z=-9;z<=6;z+=2){g.box(-11,.7,z,.16,1.5,.16,'#ded8bc');g.box(-11,.48,z+1,.1,.13,2,'#ded8bc');g.box(-11,1,z+1,.1,.13,2,'#ded8bc');}
  for(const [x,z,s] of[[-9,-6,1.2],[10,-7,1.4],[10,5,1.05],[-10,5,.7]]){
   g.box(x,-.001,z,3.1*s,.025,2.1*s,'#94ae78');g.box(x,1.25*s,z,.35*s,2.5*s,.35*s,'#8a7952');
   g.box(x,2.8*s,z,1.85*s,1.75*s,1.75*s,'#6d925e',0,.3);g.box(x-.65*s,2.4*s,z+.25*s,1.3*s,1.35*s,1.35*s,'#7f9e67',0,.15);g.box(x+.5*s,3.3*s,z-.16*s,1.2*s,1.3*s,1.3*s,'#87a873',0,.2);
  }
  for(let z=4;z<=10;z++)g.box(.1,-.002,z,.91,.04,.72,'#d4d0b6');
  // Lumber, brick pallets, workbench and site marker
  for(let i=0;i<5;i++)g.box(-7+i*.16,.18,1.5,.13,.2,2.5,'#bb9564');
  g.box(6,.13,2,2,.2,1.6,'#aa875e');for(let y=0;y<3;y++)for(let x=0;x<3;x++)for(let z=0;z<2;z++){const X=5.4+x*.5,Z=1.6+z*.52;g.box(X,.34+y*.24,Z,.46,.21,.46,'#c58961');for(const dx of[-.12,.08])g.box(X+dx,.45+y*.24,Z,.09,.005,.29,'#8f6147');}
  for(const x of[-5,5]){g.box(x,.5,5,.1,1,.1,'#a68554');g.box(x,.85,5,.75,.38,.07,'#f4cf62');for(const dx of[-.2,.12])g.box(x+dx,.85,5.045,.12,.39,.01,'#505e45',0,0,-.25);}
  for(let i=0;i<35;i++){let x=Math.sin(i*13.2)*12,z=Math.cos(i*7.13)*10;if(Math.abs(x)<6&&Math.abs(z)<6)continue;g.box(x,.08,z,.05,.18,.05,'#729464');g.box(x+.07,.055,z,.08,.11,.04,'#7d9b69');}
 }
 update(blocks,on=true){this.blocks=blocks;this.on=on;const g=new Geometry();g.vertices=this.environment.vertices.slice();for(const b of blocks)model(g,b,on);const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.vertices),gl.STATIC_DRAW);this.staticCount=g.vertices.length/9;}
 avatar(g,player,a,time,moving=false){
  const size=a.size||1,w=a.width||1,walk=moving?Math.sin(time*11)*.22:Math.sin(time*1.8)*.025,yaw=player.yaw||0;
  const box=(dx,dy,dz,bw,bh,bd,c,rz=0)=>{const q=rotate([dx*w,dy,dz],0,yaw);g.box(player.x+q[0]*size,player.y+q[1]*size,player.z+q[2]*size,bw*w*size,bh*size,bd*size,c,0,yaw,rz);};
  for(const s of[-1,1]){box(s*.16,.38,walk*s,.23,.68,.27,a.pants);box(s*.16,.08,.06+walk*s,.25,.16,.42,'#4e4f3c');}
  box(0,1,0,.64,.66,.39,a.shirt);if(a.outfit==='overalls'){box(0,.82,.205,.47,.32,.03,a.pants);for(const s of[-1,1])box(s*.2,1.12,.205,.07,.44,.025,a.pants);}if(a.outfit==='vest'){for(const s of[-1,1])box(s*.2,1.05,.21,.1,.5,.025,'#edc55f');}
  for(const s of[-1,1]){box(s*.43,1.05,-walk*s,.2,.35,.25,a.shirt);box(s*.43,.76,-walk*s,.17,.29,.21,a.skin);}
  box(0,1.62,0,.57,.57,.51,a.skin);box(0,1.46,.27,.17,.06,.03,'#9f5c43');for(const s of[-1,1]){box(s*.15,1.68,.262,.06,.075,.023,'#283d33');box(s*.29,1.59,0,.07,.16,.14,a.skin);}
  if(a.hairStyle!=='bald'){box(0,1.91,-.02,.6,.14,.55,a.hair);box(0,1.72,-.24,.58,.38,.08,a.hair);if(a.hairStyle==='bob')for(const s of[-1,1])box(s*.28,1.67,0,.1,.5,.48,a.hair);if(a.hairStyle==='curly'){for(let i=0;i<3;i++)box(-.18+i*.18,1.99,0,.2,.2,.52,a.hair);}if(a.hairStyle==='pony')box(0,1.68,-.4,.22,.47,.22,a.hair);}
  if(a.headwear==='helmet'){box(0,2,0,.65,.22,.6,a.hat);box(0,1.9,.06,.79,.08,.79,a.hat);box(0,2.12,0,.1,.1,.5,a.hat);}else if(a.headwear==='cap'){box(0,1.99,0,.64,.18,.58,a.hat);box(0,1.91,.24,.62,.055,.35,a.hat);}
 }
 matrix(player){let eye,target;
  if(this.mode==='first'&&!this.menu){eye=[player.x,player.y+1.65,player.z];const p=Math.max(-1.25,Math.min(1.25,this.lookPitch||0));target=[eye[0]-Math.sin(this.yaw)*Math.cos(p),eye[1]+Math.sin(p),eye[2]-Math.cos(this.yaw)*Math.cos(p)];}
  else{target=this.mode==='follow'&&!this.menu?[player.x,player.y+1,player.z]:this.target;const d=this.menu?(this.canvas.clientWidth<750?31:29):this.distance;eye=[target[0]+Math.sin(this.yaw)*Math.cos(this.pitch)*d,target[1]+Math.sin(this.pitch)*d,target[2]+Math.cos(this.yaw)*Math.cos(this.pitch)*d];}
  if(this.mode==='follow'&&!this.menu)eye=cameraClearance(this.blocks,target,eye);
  const p=perspective(this.mode==='first'&&!this.menu?1.1:.67,this.canvas.width/this.canvas.height,.08,150,this.menu&&this.canvas.clientWidth>=850?-.39:0);this.vp=multiply(p,lookAt(eye,target));this.inverse=invert(this.vp);this.eye=eye;return this.vp;
 }
 drawBuffer(buffer,count,dynamic=false){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);for(let i=0;i<3;i++){gl.enableVertexAttribArray(this.attr[i]);gl.vertexAttribPointer(this.attr[i],3,gl.FLOAT,false,36,i*12);}gl.drawArrays(gl.TRIANGLES,0,count);}
 render({player,avatar,time,day=1,ghost=null,moving=false}){
  this.time=time;this.resize();const gl=this.gl;gl.useProgram(this.program);const night=Math.max(.05,Math.min(1,day)),bg=rgb('#e5ecd9').map((c,i)=>c*(.45+night*.55));gl.clearColor(...bg,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(this.uMatrix,false,this.matrix(player));gl.uniform1f(this.uDay,night);gl.uniform1f(this.uAlpha,1);this.drawBuffer(this.staticBuffer,this.staticCount);
  const g=new Geometry();if(this.mode!=='first'||this.menu)this.avatar(g,player,avatar,time,moving);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.vertices),gl.DYNAMIC_DRAW);this.drawBuffer(this.dynamicBuffer,g.vertices.length/9);
  if(ghost){const h=new Geometry();h.box(ghost.x,ghost.y+.5,ghost.z,1.015,1.015,1.015,ghost.remove?'#e07756':'#d6ed83');gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(this.uAlpha,.42);gl.depthMask(false);gl.bindBuffer(gl.ARRAY_BUFFER,this.dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(h.vertices),gl.DYNAMIC_DRAW);this.drawBuffer(this.dynamicBuffer,h.vertices.length/9);gl.depthMask(true);gl.disable(gl.BLEND);}
 }
 ray(clientX,clientY){if(!this.inverse)return null;const r=this.canvas.getBoundingClientRect(),x=(clientX-r.left)/r.width*2-1,y=1-(clientY-r.top)/r.height*2,a=transform(this.inverse,[x,y,-1,1]),b=transform(this.inverse,[x,y,1,1]);return {origin:a,direction:v3.unit(v3.sub(b,a))};}
 pick(clientX,clientY,layer=0){
  const ray=this.ray(clientX,clientY);if(!ray)return null;const {origin:o,direction:d}=ray;let nearest=Infinity,hit=null;
  for(let i=0;i<this.blocks.length;i++){const b=this.blocks[i];let near=-Infinity,far=Infinity,axis=-1,sign=0;for(let a=0;a<3;a++){const center=[b.x,b.y+.5,b.z][a],lo=center-.5,hi=center+.5;if(Math.abs(d[a])<1e-8){if(o[a]<lo||o[a]>hi){far=-1;break;}continue;}let t1=(lo-o[a])/d[a],t2=(hi-o[a])/d[a],s=-1;if(t1>t2){[t1,t2]=[t2,t1];s=1;}if(t1>near){near=t1;axis=a;sign=s;}far=Math.min(far,t2);}if(far>=Math.max(near,0)&&near>0&&near<nearest){nearest=near;const normal=[0,0,0];normal[axis]=sign;hit={block:b,index:i,normal,distance:near,x:b.x+normal[0],y:b.y+normal[1],z:b.z+normal[2]};}}
  const t=(layer-o[1])/d[1];if(t>0&&t<nearest){hit={x:Math.round(o[0]+d[0]*t),y:layer,z:Math.round(o[2]+d[2]*t),block:null,index:-1,normal:[0,1,0],distance:t};}
  return hit;
 }
}
// A software 3D renderer keeps the same world, camera and ray casting available
// on devices where WebGL is disabled. It projects actual world triangles.
export class SoftwareRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});if(!this.ctx)throw Error('Canvas');this.yaw=.64;this.pitch=.65;this.distance=26;this.target=[0,2,0];this.menu=true;this.mode='orbit';this.blocks=[];this.quality='balanced';this.on=true;this.time=0;this.environment=new Geometry();this.makeEnvironment();this.resize();this.lastFrame=-1;this.geometry=[];}
 resize(){const w=Math.round(this.canvas.clientWidth),h=Math.round(this.canvas.clientHeight);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}}
 update(blocks,on=true){this.blocks=blocks;this.on=on;const g=new Geometry();g.vertices=this.environment.vertices.slice();for(const b of blocks)model(g,b,on);this.geometry=g.vertices;this.lastFrame=-1;}
 projectGeometry(vertices,day){
  const a=vertices,polys=[],m=this.vp,W=this.canvas.width,H=this.canvas.height,light=v3.unit([-.6,1,.8]),eye=this.eye;
  const clip=p=>{let out=[];for(let i=0;i<p.length;i++){const v=p[i],u=p[(i+p.length-1)%p.length],dv=v[2]+v[3],du=u[2]+u[3];if((dv>=0)!==(du>=0)){const t=du/(du-dv);out.push(u.map((n,j)=>n+(v[j]-n)*t));}if(dv>=0)out.push(v);}return out;};
  for(let i=0;i<a.length;i+=27){
   const normal=a.slice(i+3,i+6),view=[eye[0]-a[i],eye[1]-a[i+1],eye[2]-a[i+2]];if(v3.dot(normal,view)<-.001)continue;
   const raw=[0,9,18].map(o=>{const x=a[i+o],y=a[i+o+1],z=a[i+o+2];return [0,1,2,3].map(r=>m[r]*x+m[4+r]*y+m[8+r]*z+m[12+r]);}),polygon=clip(raw);
   if(polygon.length<3)continue;
   const pts=polygon.map(p=>[(p[0]/p[3]+1)*W/2,(1-p[1]/p[3])*H/2]);
   if(pts.every(p=>p[0]<0)||pts.every(p=>p[0]>W)||pts.every(p=>p[1]<0)||pts.every(p=>p[1]>H))continue;
   const depth=polygon.reduce((sum,p)=>sum+p[2]/p[3],0)/polygon.length,k=.68+Math.max(0,v3.dot(normal,light))*.34,colors=a.slice(i+6,i+9).map((v,j)=>Math.round(Math.min(255,v*k*([.35,.46,.58][j]*(1-day)+day)*255)));
   polys.push({points:pts,depth,color:`rgb(${colors.join(',')})`});
  }return polys;
 }
 render({player,avatar,time,day=1,ghost=null,moving=false}){
  if(time-this.lastFrame<1/(this.quality==='low'?14:22))return;this.lastFrame=time;this.resize();this.matrix(player);const c=this.ctx,night=Math.max(.05,Math.min(1,day)),bg=rgb('#e5ecd9').map(v=>Math.round(v*(.45+night*.55)*255));c.fillStyle=`rgb(${bg.join(',')})`;c.fillRect(0,0,this.canvas.width,this.canvas.height);
  const g=new Geometry();if(this.mode!=='first'||this.menu)this.avatar(g,player,avatar,time,moving);const p=[...this.projectGeometry(this.geometry,night),...this.projectGeometry(g.vertices,night)];p.sort((a,b)=>b.depth-a.depth);
  for(const v of p){c.beginPath();c.moveTo(...v.points[0]);for(const p of v.points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=v.color;c.fill();}
  if(ghost){const h=new Geometry();h.box(ghost.x,ghost.y+.5,ghost.z,1.015,1.015,1.015,ghost.remove?'#e07756':'#e0edac');c.globalAlpha=.38;for(const v of this.projectGeometry(h.vertices,1)){c.beginPath();c.moveTo(...v.points[0]);for(const p of v.points.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=v.color;c.fill();c.strokeStyle=ghost.remove?'#b45b46':'#63814b';c.lineWidth=.8;c.stroke();}c.globalAlpha=1;}
 }
}
for(const name of['makeEnvironment','avatar','matrix','ray','pick'])SoftwareRenderer.prototype[name]=WorldRenderer.prototype[name];
