const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const L=require('../site/league-schedule.js');
const source=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../site/data.json')));
test('entire season selects only exact 5ug / Boxx / Rainbow Unicorns in chronological order',()=>{
 const S=require('../web/rainbow-schedule.js');
 const d=structuredClone(source),box=d.divisions.find(d=>d.division==='Boxx');
 const expected=box.schedule.flatMap((g,i)=>[g.home,g.away].includes('Rainbow Unicorns')?[JSON.stringify(['5ug','Boxx',i])]:[]);
 d.divisions.push({...structuredClone(box),sport:'other'}, {...structuredClone(box),division:'Other'});
 const rows=S.buildRows(d,'2026-09-15');
 assert.deepEqual([...rows.map(r=>r.id)].sort(),expected.sort());
 assert.ok(rows.every(r=>r.sport==='5ug'&&r.division==='Boxx'&&[r.home.team,r.away.team].includes('Rainbow Unicorns')));
 assert.deepEqual(rows.map(r=>r.start),rows.map(r=>r.start).sort((a,b)=>a-b));
 assert.ok(rows.some(r=>r.completed));assert.ok(rows.some(r=>r.status==='Upcoming'));
 assert.equal(rows.length,11);
 assert.match(L.renderRows(rows,{showStatus:true}),/ · Upcoming/);
 const html=L.renderRows(rows);assert.match(html,/Final/);assert.match(html,/field-map/);
 for(const mode of ['raw','capped']){d.ratingMode=mode;const all=L.buildRows(d,'5ug','2026-09-15');for(const r of S.buildRows(d,'2026-09-15'))assert.deepEqual(r,all.find(x=>x.id===r.id));}
});
