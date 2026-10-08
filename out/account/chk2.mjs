import {execFileSync} from 'child_process';import fs from 'fs';
for(const id of [8,9,26,30,31,32,33,34,36,41,42,43,44,45,46,54,55,60,61,62,63]){const f=`specs/post-${id}.json`;
const o=JSON.parse(execFileSync('/usr/bin/git',['show','HEAD:'+f]));const n=JSON.parse(fs.readFileSync(f));
const oc=(o.refinement||{}).changes||[];const nc=(n.refinement||{}).changes||[];
const key=c=>JSON.stringify([c.slide,c.field,c.from,c.to]);const os=new Set(oc.map(key));
const add=nc.filter(c=>!os.has(key(c)));
console.log('POST',id,'tier',o.ctaTier,'->',n.ctaTier,'newChanges',add.length,'ctaSwap',JSON.stringify(o.ctaSwap||null).slice(0,260),'=>',JSON.stringify(n.ctaSwap||null).slice(0,260));
for(const c of add)console.log('  ',c.slide,c.field,'|',String(c.from).slice(0,60),'=>',String(c.to).slice(0,60),'|',String(c.why).slice(0,60), /^Adi-authorized Oct 7:/.test(c.why)?'':'  <<BADWHY');
const dropped=oc.filter(c=>!new Set(nc.map(key)).has(key(c)));if(dropped.length)console.log('  DROPPED old changes',dropped.length);
}
