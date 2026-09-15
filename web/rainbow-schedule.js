(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../site/league-schedule.js'));else root.SBMSARainbowSchedule=factory(root.SBMSALeagueSchedule);})(globalThis,function(L){
  'use strict';
  // Full season, not a search: other tabs' division/status/query never narrow it.
  function buildRows(data,today=new Date()){
    return L.buildRows(data,'5ug',today).filter(r=>r.division==='Boxx'&&[r.home.team,r.away.team].includes('Rainbow Unicorns'));
  }
  return {buildRows};
});
