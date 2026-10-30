import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MATERIALS,STAGES} from '../dist/core.js';
const pt=JSON.parse(fs.readFileSync(new URL('../dist/locales/pt-BR.json',import.meta.url)));
const en=JSON.parse(fs.readFileSync(new URL('../dist/locales/en.json',import.meta.url)));
test('both languages cover the complete static interface, materials and tutorial',()=>{
 assert.deepEqual(Object.keys(pt).sort(),Object.keys(en).sort());
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),js=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const used=[...html.matchAll(/data-(?:t|title)="([^"]+)"/g)].map(m=>m[1]);
 for(const m of js.matchAll(/\bt\('([a-zA-Z]\w*)'\s*[,)]/g))used.push(m[1]);
 for(const m of MATERIALS)used.push('m_'+m.id);for(let i=0;i<STAGES.length;i++)for(const k of['stage_','desc_','action_','tip_'])used.push(k+i);
 for(const k of used){assert.ok(pt[k],`missing Portuguese: ${k}`);assert.ok(en[k],`missing English: ${k}`);}
});
