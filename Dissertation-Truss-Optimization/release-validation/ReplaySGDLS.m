function ReplaySGDLS(seed,outDir,benchmark)
if nargin<3, benchmark='72-bar'; end
startup; if exist(outDir,'dir')~=7, mkdir(outDir); end
p=DiscreteDynamicSteelTruss(benchmark);
params=struct('popSize',70,'maxEvaluations',35070,'levyScale',0.015,'randomLocalTrials',0,'sgdlsExactCandidates',3, ...
 'sgdlsAcceptance','first','sgdlsSafetyMargin',1e-4,'restartFraction',0, ...
 'constraintOptions',struct('p',4,'feasibilityTol',1e-6),'sensitivityOptions',struct('modalClusterTol',1e-5), ...
 'sgdlsTracePath',fullfile(outDir,sprintf('trace-%s-%d.csv',benchmark,seed)));
rng(seed,'twister'); t=tic;
[x,W,convergence,details]=BudgetedMemeticPelicanOptimizationFFSGDLS(p,params);
elapsed=toc(t); save('-mat7-binary',fullfile(outDir,sprintf('replay-%s-%d.mat',benchmark,seed)),'x','W','convergence','details','elapsed');
r=struct('seed',seed,'benchmark',benchmark,'weight',W,'Vp',details.Vp,'maxG',details.maxG,'evaluator_calls',details.evaluatorCalls, ...
 'accepted',details.sgdlsAccepted,'attempts',details.sgdlsAttempts,'sensitivity_calls',details.sensitivityCalls,'seconds',elapsed);
fid=fopen(fullfile(outDir,sprintf('replay-%s-%d.json',benchmark,seed)),'w');fprintf(fid,'%s\n',jsonencode(r));fclose(fid);disp(r);
end
