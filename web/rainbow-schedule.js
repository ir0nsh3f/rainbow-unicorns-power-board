(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../site/league-schedule.js'),require('../site/playoffs.js'));else root.SBMSARainbowSchedule=factory(root.SBMSALeagueSchedule,root.SBMSAPlayoffs);})(globalThis,function(L,P){
  'use strict';
  // Full season plus actual official assignments; TBD paths never assigned to a team.
  function buildRows(data,today=new Date()){
    const rows=L.buildRows(data,'5ug',today).filter(r=>r.division==='Boxx'&&[r.home.team,r.away.team].includes('Rainbow Unicorns'));
    const profiles=P.profiles(data,'5ug'),key=i=>i?JSON.stringify([i.sport,i.division,i.team]):'';
    for(const g of P.fixtures(data,{sport:'5ug',division:'Boxx',team:'Rainbow Unicorns'})){
      const profile=p=>profiles.get(key(p.identity))||{team:p.name||p.label,rank:null,coach:p.coach||null};
      const outcomeOnly=['W/L','L/W'].includes(g.home_outcome+'/'+g.away_outcome),completed=outcomeOnly||[g.home_score,g.away_score].every(Number.isInteger);
      rows.push({id:g.id,sport:'5ug',division:'Playoff · '+g.playoff,playoff:true,home:profile(g.home),away:profile(g.away),dateISO:g.date_iso,start:g.start_iso?Date.parse(g.start_iso):null,timeLabel:g.time||'Time TBD',outcomeOnly,homeOutcome:g.home_outcome,awayOutcome:g.away_outcome,completed,homeScore:g.home_score,awayScore:g.away_score,status:completed?'Final':'Upcoming',location:g.location,locationUrl:g.location_url,sourceUrl:g.source,followedTeam:true});
    }
    return rows.sort((a,b)=>(a.dateISO||'9999').localeCompare(b.dateISO||'9999')||(a.start||0)-(b.start||0));
  }
  return {buildRows};
});
