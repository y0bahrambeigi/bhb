import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const data=JSON.parse(readFileSync('app/data/runs.json','utf8'));
const summary=JSON.parse(readFileSync('public/summary.json','utf8'));
const methods=['BMPOA-FF-core','BMPOA-FF-RandomDiscreteLS','BMPOA-FF-SGDLS'];
assert.equal(data.length,30);
assert.equal(new Set(data.map(x=>`${x.benchmark}/${x.algorithm}/${x.seed}`)).size,30);
const median=v=>{const s=[...v].sort((a,b)=>a-b);return s[(s.length-1)/2]};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
for(const b of ['72-bar-steel-dynamic-discrete','120-bar-steel-dynamic-discrete']) for(const a of methods){
 const r=data.filter(x=>x.benchmark===b&&x.algorithm===a),s=summary[b][a];
 assert.deepEqual(r.map(x=>x.seed).sort(),[2026,2027,2028,2029,2030]);
 assert.ok(r.every(x=>x.p_norm===4&&x.evaluator_calls===35070&&x.feasible===1&&x.Vp===0&&x.Vinf===0&&x.maxG<0&&x.first_feasible_FE===1));
 close(r.reduce((sum,x)=>sum+x.weight,0)/5,s.mean_feasible_weight);
 close(median(r.map(x=>x.weight)),s.median_feasible_weight);
 close(median(r.map(x=>x.elapsed_seconds)),s.median_elapsed_seconds);
}
const sha=createHash('sha256').update(readFileSync('public/results.csv')).digest('hex');
assert.equal(sha,'2e13eba58e4ccbfb9f3e8b28fd359bba337edd01717d6264ffc49f5b37fc590e');
assert.equal(readFileSync('public/SHA256SUMS.txt','utf8').split(' ')[0],sha);
const anomaly=data.find(x=>x.algorithm===methods[2]&&x.benchmark.startsWith('72-')&&x.seed===2030);
assert.equal(anomaly.sgdls_attempts,239);assert.equal(anomaly.sgdls_accepted,25);
console.log('PASS: complete paired design, 30 rows, numerical summaries, evaluator budget, checksum and anomaly retained.');
