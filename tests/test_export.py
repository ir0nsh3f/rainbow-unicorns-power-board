import json,unittest,tempfile,hashlib
from pathlib import Path
from scripts.export_site import export
class ExportTest(unittest.TestCase):
 def test_only_5ug_and_exact_immutable_provenance(self):
  source=Path('upstream') if Path('upstream').exists() else Path('/workspace/sbmsa-power-board')
  with tempfile.TemporaryDirectory() as tmp:
   out=Path(tmp);export(source,out,'test-source-sha')
   d=json.loads((out/'data.json').read_text());self.assertEqual({(x['sport'],x['division']) for x in d['divisions']},{('5ug','Akers'),('5ug','Boxx')});self.assertEqual(sum(len(x['teams']) for x in d['divisions']),24)
   p=json.loads((out/'soccer-projections/current.json').read_text());self.assertEqual(p['model']['prior_games'],3)
   for file in (source/'site/soccer-projections').rglob('*.json'):self.assertEqual(file.read_bytes(),(out/'soccer-projections'/file.relative_to(source/'site/soccer-projections')).read_bytes())
   for file in out.rglob('*'):
    if file.is_file():self.assertNotRegex(file.read_text(),r'Dexter|Beckham|Buccaneers|Arsenal|Vipers')
   self.assertFalse((out/'projections').exists());self.assertFalse((out/'history').exists())
