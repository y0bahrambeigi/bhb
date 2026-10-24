#!/usr/bin/env python3
"""Reproduce the archived-output audit; never pool diagnostic replay rows."""
import argparse,csv,hashlib,itertools,json,pathlib,statistics,zipfile
P=argparse.ArgumentParser();P.add_argument('archive');P.add_argument('output');a=P.parse_args()
out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True)
p=pathlib.Path(a.archive); expected='3f2986f47f5d28d859427224c3d5c1387ddc3b31185608e0f844947a2ee05bbd'
assert hashlib.sha256(p.read_bytes()).hexdigest()==expected
with zipfile.ZipFile(p) as z:
 raw=z.read('SGDLS_FULL_30RUN_35070_P4.csv'); rows=list(csv.DictReader(raw.decode().splitlines()))
 assert hashlib.sha256(raw).hexdigest()=='2e13eba58e4ccbfb9f3e8b28fd359bba337edd01717d6264ffc49f5b37fc590e'
 shard=[]
 for name in z.namelist():
  if name.startswith('shards/') and name.endswith('.csv'):shard.extend(csv.DictReader(z.read(name).decode().splitlines()))
 def key(r):return r['benchmark'],r['algorithm'],int(r['seed'])
 assert sorted(rows,key=key)==sorted(shard,key=key)
 for n in z.namelist():
  if n.endswith('provenance/run.txt'):
   t=z.read(n).decode();assert 'workflow_run_id=39207965973' in t and 'commit_sha=a8d9fc46966842ec56980853a4ee4ab56395a7e0' in t
 assert len(rows)==30 and len({key(r) for r in rows})==30
 methods=['BMPOA-FF-core','BMPOA-FF-RandomDiscreteLS','BMPOA-FF-SGDLS'];bs=['72-bar-steel-dynamic-discrete','120-bar-steel-dynamic-discrete']
 assert {key(r) for r in rows}==set(itertools.product(bs,methods,range(2026,2031)))
 assert all(int(r['evaluator_calls'])==35070 and float(r['p_norm'])==4 for r in rows)
 assert all(r['feasible']=='1' and float(r['Vp'])==float(r['Vinf'])==0 and float(r['maxG'])<0 and float(r['first_feasible_FE'])==1 for r in rows)
 summary=[]; paired=[]
 for b in bs:
  for m in methods:
   rr=[r for r in rows if r['benchmark']==b and r['algorithm']==m]
   summary.append(dict(benchmark=b,method=m,runs=len(rr),mean_weight=statistics.mean(float(r['weight']) for r in rr),median_weight=statistics.median(float(r['weight']) for r in rr),median_seconds=statistics.median(float(r['elapsed_seconds']) for r in rr)))
  sg=sorted([r for r in rows if r['benchmark']==b and r['algorithm']==methods[2]],key=key)
  for base in methods[:2]:
   cr=sorted([r for r in rows if r['benchmark']==b and r['algorithm']==base],key=key)
   d=[float(x['weight'])-float(y['weight']) for x,y in zip(sg,cr)]; obs=abs(statistics.mean(d))
   pv=sum(abs(statistics.mean(x*s for x,s in zip(d,ss)))>=obs-1e-10 for ss in itertools.product([-1,1],repeat=5))/32
   paired.append(dict(benchmark=b,baseline=base,wins=sum(x < -1e-8 for x in d),ties=sum(abs(x)<=1e-8 for x in d),losses=sum(x>1e-8 for x in d),sign_flip_p=pv,median_paired_runtime_overhead_percent=statistics.median(100*(float(x['elapsed_seconds'])/float(y['elapsed_seconds'])-1) for x,y in zip(sg,cr))))
 report=dict(pass_audit=True,reference_run=39207965973,experiment_source='a8d9fc46966842ec56980853a4ee4ab56395a7e0',zip_sha256=expected,summary=summary,paired=paired,claim='No established statistical superiority; equal evaluator budget is not equal computational cost.')
 (out/'reference-audit.json').write_text(json.dumps(report,indent=2)+'\n')
 with (out/'results-summary.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=summary[0]);w.writeheader();w.writerows(summary)
 (out/'SGDLS_FULL_30RUN_35070_P4.csv').write_bytes(raw)
 print(json.dumps(report,indent=2))
