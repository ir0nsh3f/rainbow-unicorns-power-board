"""5U-only export from one validated upstream source checkout. No collection or refit."""
import json,shutil,sys,subprocess
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]
def segment(text,start,end):
 assert text.count(start)==1 and text.count(end)==1
 return text.split(start,1)[1].split(end,1)[0]
def export(source,out,sha):
 source=Path(source);out=Path(out);out.mkdir(parents=True,exist_ok=True)
 subprocess.run([sys.executable,str(source/'scripts/soccer_projections.py'),'validate'],check=True,cwd=source)
 data=json.loads((source/'site/data.json').read_text())
 ds=[d for d in data['divisions'] if d['sport']=='5ug']
 assert {(d['sport'],d['division']) for d in ds}=={('5ug','Akers'),('5ug','Boxx')}
 assert all(len(d['teams'])==12 and len(d['schedule'])==66 for d in ds)
 # Scope metadata explicitly; do not export other divisions or their error messages.
 scoped={k:data[k] for k in ('last_checked','last_successful_check','data_updated','status')}
 scoped.update(divisions=ds,errors=[] if data['status']=='ok' else ['Upstream source check failed; retained last accepted 5U results.'])
 (out/'data.json').write_text(json.dumps(scoped,ensure_ascii=False,separators=(',',':'))+'\n')
 for name in ('ratings.js','rainbow.js','league-schedule.css'):
  shutil.copyfile(source/'site'/name,out/name)
 css=segment((source/'site/index.html').read_text(),'<style>','</style>')
 (out/'board.css').write_text(css+'\n')
 s=(source/'site/schedules.js').read_text()
 helpers='  function chicagoDate'+segment(s,'  function chicagoDate','  function buildRows')+'  function escapeHTML'+segment(s,'  function escapeHTML','  function fieldHTML')
 (out/'schedules.js').write_text("(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SBMSASchedules=factory();})(globalThis,function(){\n"+helpers+'\nreturn {chicagoDate,escapeHTML,safeSourceURL,safeLocationURL};});\n')
 s=(source/'site/league-schedule.js').read_text()
 pure='  const key='+segment(s,'  const key=','  const favorites=')+'  const favorites={};\n  function buildRows'+segment(s,'  function buildRows','  function projectionFor')
 renderer='  function renderRows'+segment(s,'  function renderRows','  function projectionGuide')
 renderer=renderer.replace('${projectionLine(r,options)}','').replace('${lastPregameDetail(r,options.pregameResults)}','').replace('${projectionLine(r,options,true)}','')
 (out/'league-schedule.js').write_text("(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./schedules.js'),require('./ratings.js'));else root.SBMSALeagueSchedule=factory(root.SBMSASchedules,root.SBMSARatings);})(globalThis,function(S,R){\n"+pure+renderer+'\nreturn {buildRows,filterRows,renderRows,highlight};});\n')
 # Exact copies preserve original capture/receipt hashes and original observation provenance.
 shutil.copytree(source/'site/soccer-projections',out/'soccer-projections',dirs_exist_ok=True)
 method=(source/'site/soccer-method.html').read_text().replace(' and flag projections','').replace(' or flag histories',' histories').replace('; the existing flag evaluator is unchanged','')
 (out/'soccer-method.html').write_text(method)
 for file in (ROOT/'web').iterdir():shutil.copyfile(file,out/file.name)
 receipt={'exported_at':datetime.now(timezone.utc).isoformat(),'source_commit':sha,'source_repository':'https://github.com/ir0nsh3f/sbmsa-power-board','source_checked_at':data['last_successful_check'],'archive_provenance':'Copies retain original capture bytes and original observed-public receipts; this export does not claim a new first publication.'}
 (out/'export.json').write_text(json.dumps(receipt,indent=2)+'\n')
 return scoped
if __name__=='__main__':
 source=Path(sys.argv[1]);sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=source,text=True).strip()
 export(source,ROOT/'site',sha)
 print(json.dumps({'source_commit':sha,'site':str(ROOT/'site')}))
