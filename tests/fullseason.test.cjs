const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('generated girls full-season inputs stay 5U-only and agree with upstream full-age ranks',()=>{
 const root=fs.existsSync('upstream')?'upstream':'/workspace/sbmsa-power-board';
 const R=require('../site/ratings.js'),read=p=>JSON.parse(fs.readFileSync(p));
 const d=read('site/data.json'),p=read('site/playoffs.json'),before=JSON.stringify(d),f=R.fullSeason(d,p);
 const source=R.fullSeason(read(root+'/site/data.json'),read(root+'/site/playoffs.json'));
 assert.equal(JSON.stringify(d),before);assert.equal(f.divisions.length,2);assert.ok(f.coverage.sources.every(s=>s.sport==='5ug'));assert.equal(f.coverage.sources.length,3);
 assert.ok(f.coverage.crossDivision.every(g=>g.sport==='5ug'));
 for(const mode of ['raw','capped'])assert.deepEqual(R.compute(f.divisions,'5ug',mode),R.compute(source.divisions,'5ug',mode));
 const combined={...d,divisions:f.divisions,playoffs:p,powerCoverage:f.coverage,ratingMode:'capped'};
 const rows=require('../web/rainbow-schedule.js').buildRows(combined),ranked=R.compute(f.divisions,'5ug','capped');
 for(const row of rows)for(const side of [row.home,row.away])if(side.rank){const t=ranked.find(t=>t.team===side.team&&t.division===side.division);assert.equal(side.rank,t.rank);assert.equal(side.power,t.power);}
});
