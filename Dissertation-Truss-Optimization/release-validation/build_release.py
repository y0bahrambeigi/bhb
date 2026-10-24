#!/usr/bin/env python3
import hashlib,json,os,pathlib,shutil,subprocess,sys,zipfile
root=pathlib.Path(__file__).resolve().parent; project=root.parent
sha,run,outpath=sys.argv[1:]; assert len(sha)==40 and all(c in '0123456789abcdef' for c in sha)
out=pathlib.Path(outpath);out.mkdir(parents=True,exist_ok=True)
r=json.loads((root/'derivatives.json').read_text());assert r['pass']
replays=json.loads((root/'evidence/replay-diagnostics.json').read_text());assert all(x['exact_reference_match'] for x in replays)
assert 'PASSED' in (root/'regression-passed.txt').read_text()
files=[root/'reference-data/reference.zip',root/'reference-data/experiment-source.tar.gz',root/'evidence/SGDLS_FULL_30RUN_35070_P4.csv',root/'evidence/results-summary.csv',root/'evidence/reference-results.pdf',root/'evidence/supplementary-replay-convergence.pdf',root/'SCIENTIFIC_AUDIT.md',project/'CITATION_SGDLS.cff']
for p in files:shutil.copy2(p,out/p.name)
manifest=dict(version='0.1.0',tag='sgdls-v0.1.0',release_sha=sha,release_workflow_run=run,reference_run=39207965973,experiment_source='a8d9fc46966842ec56980853a4ee4ab56395a7e0',validation=r,replays=replays,historical_environment='reference-preflight.log; full historical hardware/package manifest unavailable',claims='No established statistical superiority; equal evaluator-call budget does not imply equal computational cost.')
(out/'RELEASE_MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
notes=(project/'RELEASE_NOTES_SGDLS_V0.1.0.md').read_text().replace('{RELEASE_SHA}',sha).replace('{RELEASE_RUN}',run);(out/'release-notes.md').write_text(notes)
repo=project.parent; source=out/'release-source.tar.gz'
subprocess.run(['git','archive','--format=tar.gz',f'--output={source}',sha,'Dissertation-Truss-Optimization','.github/workflows/sgdls-release.yml'],cwd=repo,check=True)
# Preserve all validation outputs from the live merged-source check as well.
with zipfile.ZipFile(out/'sgdls-v0.1.0-reproducibility.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.write(source,source.name);z.write(out/'RELEASE_MANIFEST.json','RELEASE_MANIFEST.json')
 for p in sorted(root.rglob('*')):
  if p.is_file() and '__pycache__' not in p.parts:z.write(p,'validation/'+str(p.relative_to(root)))
 for p in files:z.write(p,'assets/'+p.name)
(out/'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in sorted(out.iterdir()) if p.is_file() and p.name!='SHA256SUMS.txt'))
print('Release assets ready:',out)
