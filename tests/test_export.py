import json,unittest,tempfile,hashlib
from pathlib import Path
from scripts.export_site import export
class ExportTest(unittest.TestCase):
 def test_outcome_only_shared_renderer_and_ranking_denominator(self):
  import subprocess
  source=Path('upstream') if Path('upstream').exists() else Path('/workspace/sbmsa-power-board')
  with tempfile.TemporaryDirectory() as tmp:
   out=Path(tmp);export(source,out,'outcome-test')
   script=r'''const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=process.argv[1],L=require(root+'/league-schedule.js'),S=require(root+'/schedules.js'),R=require(root+'/ratings.js'),Rainbow=require(root+'/rainbow.js');
const t=(team,w,l)=>({team,w,l,t:0,gp:2,scored_gp:1,outcome_only_gp:1,pf:4,pa:1,margin_sum:3,capped_margin_sum:3});
const g={home:'Rainbow Unicorns',away:'Other',home_score:null,away_score:null,home_outcome:'L',away_outcome:'W',start_iso:'2026-09-20T12:00:00Z',date_iso:'2026-09-20'};
const d={divisions:[{sport:'5ug',division:'Boxx',teams:[t('Rainbow Unicorns',1,1),t('Other',1,1)],games:[{home:g.home,away:g.away,home_score:4,away_score:1}],schedule:[g]}]};
const rows=L.buildRows(d,'5ug');assert.equal(rows[0].completed,true);assert.match(L.renderRows(rows,{showStatus:true}),/Other W – Rainbow Unicorns L · score unavailable/);
assert.equal(Rainbow.nextTwo(d.divisions,Date.parse('2026-09-16T12:00:00Z')).length,0);
for(const ratingMode of ['raw','capped']){
 const ranked=L.buildRows({...d,ratingMode},'5ug');
 const html=L.renderRows(ranked,{showStatus:true});
 for(const t of [ranked[0].away,ranked[0].home])assert.ok(html.includes(`>#${t.rank}</span> ${t.team}</b>`));
}
assert.ok(fs.existsSync(root+'/schedule-links.js'));
const nodes=new Proxy({}, {get(o,k){return o[k]||(o[k]={value:k==='division'?'all':'',textContent:'',innerHTML:''});}});
const context={document:{getElementById:id=>nodes[id]},SBMSAScheduleLinks:require(root+'/schedule-links.js'),SBMSASchedules:S,SBMSARatings:R,SBMSALeagueSchedule:L,SBMSARainbowSchedule:{buildRows:()=>rows},SBMSARainbow:{render:()=>{}},fixture:d};
vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/app.js','utf8').split('function setView')[0]+';data=fixture;render();',context);
assert.match(nodes.rows.innerHTML,/0?1 scored \/ 2 GP/);assert.match(nodes.rows.innerHTML,/class="result">\+3</);assert.doesNotMatch(nodes.rows.innerHTML,/NaN|Infinity/);
'''
   subprocess.run(['node','-e',script,str(out)],check=True)

 def test_only_5ug_and_exact_immutable_provenance(self):
  source=Path('upstream') if Path('upstream').exists() else Path('/workspace/sbmsa-power-board')
  with tempfile.TemporaryDirectory() as tmp:
   out=Path(tmp);export(source,out,'test-source-sha')
   d=json.loads((out/'data.json').read_text());self.assertEqual({(x['sport'],x['division']) for x in d['divisions']},{('5ug','Akers'),('5ug','Boxx')});self.assertEqual(sum(len(x['teams']) for x in d['divisions']),24)
   p=json.loads((out/'soccer-projections/current.json').read_text());self.assertEqual(p['model']['prior_games'],3)
   self.assertEqual(p['model']['sport'],'5ug')
   for age in ('8u','6u'):self.assertFalse((out/('soccer-projections-'+age)).exists())
   for capture in (out/'soccer-projections/captures').glob('*.json'):
    c=json.loads(capture.read_text());self.assertEqual(c['model']['sport'],'5ug')
    self.assertTrue(all(f['fixture_id'][1]=='5ug' for f in c['forecasts']))
   for receipt in (out/'soccer-projections/publication').glob('*.json'):
    self.assertEqual(json.loads(receipt.read_text())['sport'],'5ug')
   for file in (source/'site/soccer-projections').rglob('*.json'):self.assertEqual(file.read_bytes(),(out/'soccer-projections'/file.relative_to(source/'site/soccer-projections')).read_bytes())
   for file in out.rglob('*'):
    if file.is_file():self.assertNotRegex(file.read_text(),r'Dexter|Beckham|Buccaneers|Arsenal|Vipers')
   self.assertFalse((out/'projections').exists());self.assertFalse((out/'history').exists())
