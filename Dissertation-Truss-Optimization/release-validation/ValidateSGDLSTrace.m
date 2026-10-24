function ValidateSGDLSTrace()
startup; p=DiscreteDynamicSteelTruss('72-bar');
params=struct('popSize',70,'maxEvaluations',700,'randomLocalTrials',0,'sgdlsExactCandidates',3);
rng(2026,'twister'); [x0,W0,c0,d0]=BudgetedMemeticPelicanOptimizationFFSGDLS(p,params);
tracePath=[tempname '.csv']; clean=onCleanup(@() delete(tracePath)); %#ok<NASGU>
params.sgdlsTracePath=tracePath;
rng(2026,'twister'); [x1,W1,c1,d1]=BudgetedMemeticPelicanOptimizationFFSGDLS(p,params);
assert(isequal(x0,x1)&&W0==W1&&isequal(c0,c1));
assert(d0.evaluatorCalls==700&&d1.evaluatorCalls==700&&d0.sgdlsAccepted==d1.sgdlsAccepted&&d0.sgdlsAttempts==d1.sgdlsAttempts);
assert(d1.sgdlsAttempts>0); fprintf('Trace instrumentation preserves seeded solution, history and budget: PASS\n');
end
