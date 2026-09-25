from pathlib import Path
import csv, json, hashlib
import numpy as np
import matplotlib.pyplot as plt
from ifd_reference import *

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'results'/'qa'; FIG=ROOT/'figures'/'qa'
OUT.mkdir(parents=True,exist_ok=True); FIG.mkdir(parents=True,exist_ok=True)

cfg=default_config()
n=6;masses=np.full(n,2e5);k=np.full(n,1.8e8);h=np.full(n,3.2)
S=build_shear_building(masses,k,0.05)
suite=[synthetic_record(x) for x in ['SYN-A','SYN-B','SYN-C']]

baseline=np.array([1.,0.,0.,0.])
default=np.array([1.,1500.,25000.,2000.])
res_base=evaluate_suite(baseline,suite,S,h,cfg)
res_def=evaluate_suite(default,suite,S,h,cfg)

rng=np.random.default_rng(2026)
C=[]
for story in range(1,n+1):
    C.append([story,1500.,25000.,2000.])
for _ in range(36):
    C.append([rng.integers(1,n+1),rng.uniform(0,6000),rng.uniform(0,150000),rng.uniform(0,20000)])

rows=[];best=None
for j,x in enumerate(C):
    r=evaluate_suite(np.asarray(x,float),suite,S,h,cfg)
    penalized=r['Jraw']+1e7*r['violation']
    row={'candidate':j,'story':r['story'],'b_kg':r['params']['b'],'Fc_N':r['params']['Fc'],
         'c_Ns_m':r['params']['c'],'Jraw':r['Jraw'],'violation':r['violation'],
         'penalized':penalized,'max_drift_ratio':r['worst_ratios'][0],
         'max_acc_ratio':r['worst_ratios'][1],'max_force_ratio':r['worst_ratios'][2],
         'mean_energy_J':float(np.mean(r['energy']))}
    rows.append(row)
    if best is None or penalized<best[0]: best=(penalized,np.asarray(x,float),r)

with open(OUT/'synthetic_candidate_screen.csv','w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)

summary={
 'qa_scope':'software verification only; synthetic motions and provisional IFD law; not experimental validation',
 'first_three_frequencies_Hz':[float(v) for v in S.fn[:3]],
 'baseline':{'Jraw':res_base['Jraw'],'violation':res_base['violation'],'worst_ratios':res_base['worst_ratios'].tolist()},
 'default':{'Jraw':res_def['Jraw'],'violation':res_def['violation'],'worst_ratios':res_def['worst_ratios'].tolist()},
 'screen_best':{'x':best[1].tolist(),'Jraw':best[2]['Jraw'],'violation':best[2]['violation'],'worst_ratios':best[2]['worst_ratios'].tolist()},
 'tests':{}
}
summary['tests']['frequencies_positive']=bool(np.all(S.fn>0))
summary['tests']['mass_symmetric']=bool(np.allclose(S.M,S.M.T))
summary['tests']['stiffness_symmetric']=bool(np.allclose(S.K,S.K.T))
summary['tests']['damping_symmetric']=bool(np.allclose(S.C,S.C.T))
summary['tests']['effective_mass_spd']=True
for story in range(1,n+1):
    q=device_incidence_vector(n,story)
    Me=S.M+1500*np.outer(q,q)
    if np.min(np.linalg.eigvalsh(Me))<=0: summary['tests']['effective_mass_spd']=False
summary['tests']['finite_metrics']=bool(all(np.isfinite([r['Jraw'],r['violation']]).all() for r in [res_base,res_def,best[2]]))
summary['tests']['nonnegative_energy_default']=bool(np.all(res_def['energy']>=-1e-8))
summary['tests']['all_pass']=bool(all(summary['tests'].values()))
(OUT/'qa_summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')

plt.figure(figsize=(8,4.5))
for rec in suite: plt.plot(rec['t'],rec['ag']/G,label=rec['id'],linewidth=1)
plt.xlabel('Time (s)');plt.ylabel('Acceleration (g)');plt.title('Synthetic motions used only for software verification');plt.legend();plt.tight_layout()
plt.savefig(FIG/'synthetic_records.png',dpi=180);plt.close()

labels=['Drift','Acceleration','Device force']
vals=np.vstack([res_base['worst_ratios'],res_def['worst_ratios'],best[2]['worst_ratios']])
x=np.arange(3); width=.25
plt.figure(figsize=(7.5,4.5))
for i,name in enumerate(['No-device baseline','Default provisional IFD','Best screened candidate']):
    plt.bar(x+(i-1)*width,vals[i],width,label=name)
plt.axhline(1.0,linestyle='--',linewidth=1)
plt.xticks(x,labels);plt.ylabel('Normalized worst-case metric');plt.title('Verification-only comparison (synthetic records)');plt.legend(fontsize=8);plt.tight_layout()
plt.savefig(FIG/'qa_metric_comparison.png',dpi=180);plt.close()

hashes={}
for p in sorted(list(OUT.glob('*'))+list(FIG.glob('*'))):
    hashes[str(p.relative_to(ROOT))]=hashlib.sha256(p.read_bytes()).hexdigest()
(OUT/'qa_output_sha256.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')

print(json.dumps(summary,indent=2))
if not summary['tests']['all_pass']:
    raise SystemExit('QA invariant failed')
