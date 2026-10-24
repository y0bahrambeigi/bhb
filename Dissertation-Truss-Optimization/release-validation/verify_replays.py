#!/usr/bin/env python3
import collections,csv,json,pathlib
root=pathlib.Path(__file__).resolve().parent
reference=list(csv.DictReader((root/'evidence/SGDLS_FULL_30RUN_35070_P4.csv').open()))
result=[]
for seed in [2026,2030]:
 p=root/'original-replays'/f'replay-72-bar-{seed}.json'; d=json.loads(p.read_text())
 rr=next(r for r in reference if r['seed']==str(seed) and r['benchmark'].startswith('72-bar-') and r['algorithm']=='BMPOA-FF-SGDLS')
 trace=list(csv.DictReader((p.parent/f'trace-72-bar-{seed}.csv').open()))
 assert d['evaluator_calls']==35070 and d['Vp']==0 and d['maxG']<0
 assert len(trace)==d['attempts'] and sum(int(r['accepted']) for r in trace)==d['accepted']
 assert all(int(r['accepted'])==int(r['candidate_feasible']=='1' and float(r['candidate_weight'])<float(r['baseline_weight'])-1e-8) for r in trace)
 rejected=[r for r in trace if r['accepted']=='0']
 reasons=collections.Counter(max(['stress','disp','freq'],key=lambda f:float(r[f+'_maxG'])) for r in rejected)
 repeated=collections.Counter((r['group'],r['baseline_weight'],r['candidate_weight'],str(round(float(r['exact_maxG']),12))) for r in rejected)
 result.append(dict(seed=seed,reference_attempts=int(rr['sgdls_attempts']),reference_accepted=int(rr['sgdls_accepted']),reference_weight=float(rr['weight']),replay=d,exact_reference_match=abs(d['weight']-float(rr['weight']))<1e-8 and d['attempts']==int(rr['sgdls_attempts']) and d['accepted']==int(rr['sgdls_accepted']),rejection_active_family=dict(reasons),largest_repeated_rejection_count=max(repeated.values(),default=0),rejected_predicted_safe=sum(float(r['pred_maxG'])<=-1e-4 for r in rejected),max_first_order_maxG_error=max((float(r['exact_maxG'])-float(r['pred_maxG']) for r in rejected),default=0)))
(root/'evidence/replay-diagnostics.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
# Numerical/BLAS environments can change a stochastic trajectory. Never claim
# an exact historical reproduction unless the recorded values match.
assert all(r['exact_reference_match'] for r in result), 'Replay differs from historical reference; scientific anomaly remains open.'
