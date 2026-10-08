import {execFileSync} from 'child_process';import fs from 'fs';
const ids=[8,9,26,30,31,32,33,34,36,41,42,43,44,45,46,54,55,60,61,62,63];
function strs(o,p,out){if(typeof o==='string')out[p]=o;else if(o&&typeof o==='object')for(const k of Object.keys(o)){if(k==='refinement')continue;strs(o[k],p?p+'.'+k:k,out)}return out}
const nums=s=>new Set((s||'').match(/\$?\d[\d,.]*%?/g)||[]);
const caps=s=>new Set((s||'').match(/(?<=[a-z,] )[A-Z][a-zA-Z]+/g)||[]);
for(const id of ids){const f=`specs/post-${id}.json`;
const old=JSON.parse(execFileSync('/usr/bin/git',['show',`HEAD:${f}`]).toString());const nw=JSON.parse(fs.readFileSync(f));
const a=strs(old,'',{}),b=strs(nw,'',{});
const changes=(nw.refinement?.changes||[]);
const bad=changes.filter(c=>!/^Adi-authorized Oct 7:/.test(c.why||''));
const diffs=[];for(const k of new Set([...Object.keys(a),...Object.keys(b)])){if(a[k]!==b[k])diffs.push([k,a[k],b[k]])}
console.log(`\n== ${id} diffs=${diffs.length} changes=${changes.length} badwhy=${bad.length}`);
for(const [k,x,y] of diffs){
 const lg=changes.some(c=>c.to===y&&c.from===x)||changes.some(c=>c.to===y)||changes.some(c=>c.from===x);
 const nn=[...nums(y)].filter(n=>!nums(x).has(n));const nc=[...caps(y)].filter(n=>!caps(x).has(n));
 console.log(` ${lg?'L':'UNLOGGED'} ${k}\n   - ${x}\n   + ${y}${nn.length?'\n   NEWNUM '+nn:''}${nc.length?'\n   NEWCAP '+nc:''}`)}
for(const c of changes){ if(!Object.values(b).includes(c.to)&&c.to!==''&&c.to!=null) console.log(' LOGGED-BUT-NOT-PRESENT',JSON.stringify(c).slice(0,200));}
}
