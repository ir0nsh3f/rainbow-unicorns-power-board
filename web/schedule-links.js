// Standalone 5U route contract, matching the original board hash semantics.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.SBMSAScheduleLinks=factory();
})(globalThis,function(){
  'use strict';
  function href(team){
    return '#league-schedule?'+new URLSearchParams({sport:team.sport,division:team.division,team:team.team}).toString();
  }
  function parse(hash,data){
    if(!hash.startsWith('#league-schedule?'))return null;
    const p=new URLSearchParams(hash.split('?').slice(1).join('?'));
    const team={sport:p.get('sport'),division:p.get('division'),team:p.get('team')};
    return team.sport==='5ug'&&(data?.divisions||[]).some(d=>d.sport===team.sport&&d.division===team.division&&d.teams.some(t=>t.team===team.team))?team:null;
  }
  return {href,parse};
});
