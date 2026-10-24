#!/usr/bin/env python3
import csv,json,pathlib,sys
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.io import loadmat
root=pathlib.Path(__file__).resolve().parent; out=root/'evidence';out.mkdir(exist_ok=True)
rows=list(csv.DictReader((out/'SGDLS_FULL_30RUN_35070_P4.csv').open()))
methods=['BMPOA-FF-core','BMPOA-FF-RandomDiscreteLS','BMPOA-FF-SGDLS'];colors=['#506680','#c18b3c','#087e8b']
fig,axes=plt.subplots(2,2,figsize=(11,7),constrained_layout=True)
for i,b in enumerate(['72-bar','120-bar']):
 for j,(metric,label) in enumerate([('weight','Final structural weight (lb)'),('elapsed_seconds','Reference runtime (s)')]):
  ax=axes[i,j]
  for k,m in enumerate(methods):
   rr=sorted([r for r in rows if r['benchmark'].startswith(b+'-') and r['algorithm']==m],key=lambda r:int(r['seed']))
   vals=[float(r[metric]) for r in rr]; ax.plot(range(2026,2031),vals,'o-',color=colors[k],label=m.replace('BMPOA-FF-',''),lw=1.3)
  ax.set(title=b,xlabel='Paired seed',ylabel=label,xticks=range(2026,2031));ax.grid(alpha=.2)
axes[0,0].legend(frameon=False);fig.suptitle('Archived 30-run reference study | 35,070 evaluator calls per run\nDescriptive comparison; no established statistical superiority',fontsize=12)
fig.savefig(out/'reference-results.png',dpi=180);fig.savefig(out/'reference-results.pdf');plt.close(fig)
files=sorted((root/'original-replays').glob('replay-*.mat'))
if files:
 fig,ax=plt.subplots(figsize=(8,4.5),constrained_layout=True)
 for p in files:
  d=loadmat(p,simplify_cells=True);ax.step(d['details']['evaluationHistory'],d['convergence']['weight'],where='post',label=f"72-bar seed {int(d['details']['parameters']['maxEvaluations']) and p.stem.split('-')[-1]}")
 ax.set(title='Supplementary diagnostic replays — SG-DLS only\nSeparate from the historical 30-run dataset',xlabel='Evaluator calls',ylabel='Best feasible weight (lb)');ax.grid(alpha=.2);ax.legend(frameon=False)
 fig.savefig(out/'supplementary-replay-convergence.png',dpi=180);fig.savefig(out/'supplementary-replay-convergence.pdf');plt.close(fig)
print('Plots written to',out)
