const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const N=require('../site/schedule-links.js'),L=require('../site/league-schedule.js'),S=require('../site/schedules.js');
test('exported route preserves exact identity and escaping, rejecting unknown sports/divisions/teams',()=>{
 const team={sport:'5ug',division:'Boxx',team:'A & B <"Unicorns"> + #?'},data={divisions:[{sport:'5ug',division:'Boxx',teams:[{team:team.team}]}]};
 assert.deepEqual(N.parse(N.href(team),data),team);assert.match(S.escapeHTML(N.href(team)),/&amp;/);
 for(const t of [{...team,sport:'6u'},{...team,division:'Akers'},{...team,team:'A & B'}])assert.equal(N.parse(N.href(t),data),null);
 assert.equal(N.parse(N.href(team),null),null);assert.equal(N.parse('#rankings',data),null);
 const fixture=(sport,division,name)=>({sport,division,away:{team:name},home:{team:'Other'},completed:true,status:'Final'});
 const good=fixture('5ug','Boxx',team.team),rows=[good,fixture('5ug','Akers',team.team),fixture('6u','Boxx',team.team),fixture('5ug','Boxx',team.team+' FC')];
 assert.deepEqual(L.filterRows(rows,{team,filter:'Results'}),[good]);assert.deepEqual(L.filterRows(rows,{team,filter:'Upcoming'}),[]);assert.match(L.renderRows([]),/No games match these filters\. Try All\./);assert.doesNotMatch(L.renderRows([]),/Watchlist/);
 assert.match(fs.readFileSync('site/index.html','utf8'),/schedule-links\.js\?v=20260922-team-results-1/);
});
