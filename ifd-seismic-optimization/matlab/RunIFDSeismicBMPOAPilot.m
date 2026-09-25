function result = RunIFDSeismicBMPOAPilot(manifestFile,recordsRoot,scaling,runMode)
if nargin<1||isempty(manifestFile)
    root=fileparts(fileparts(mfilename('fullpath')));
    manifestFile=fullfile(root,'records','record_manifest_v0.6.csv');
end
if nargin<2||isempty(recordsRoot),recordsRoot=fileparts(manifestFile);end
if nargin<3||isempty(scaling),scaling=struct('mode','none','opts',struct());end
if nargin<4||isempty(runMode),runMode='smoke';end
if exist('BudgetedMemeticPelicanOptimization','file')~=2
    error('Missing BudgetedMemeticPelicanOptimization.m dependency.');
end
cfg=default_config();
S=build_shear_building(cfg.mdof.masses,cfg.mdof.story_stiffness,cfg.mdof.zeta);
suite=load_record_manifest(manifestFile,recordsRoot,scaling);
if isempty(suite),error('No real waveform files were loaded.');end
problem=IFDSeismicBMPOAProblem(suite,S,cfg.mdof.story_heights,cfg);
switch lower(string(runMode))
    case "smoke", seeds=2026; maxEvaluations=700;
    case "locked", seeds=2026:2030; maxEvaluations=35070;
    otherwise, error('runMode must be smoke or locked.');
end
variantNames={'BMPOA-core','BMPOA-LS','BMPOA-restart','BMPOA-LS-restart'};
localTrials=[0 3 0 3]; restartFractions=[0 0 0.30 0.30];
rows=cell(numel(variantNames)*numel(seeds),19); row=0;
for v=1:numel(variantNames)
    for s=1:numel(seeds)
        params=struct('popSize',70,'maxEvaluations',maxEvaluations,'penaltyCoef',1e7,'levyScale',0.015,...
            'localSearchTrials',localTrials(v),'qioTrials',0,'restartFraction',restartFractions(v),...
            'stagnationEvaluations',max(70,round(0.06*maxEvaluations)));
        rng(seeds(s),'twister'); tic;
        [bestSol,bestFit,convergence,details]=BudgetedMemeticPelicanOptimization(problem,params);
        elapsed=toc; info=details.info; row=row+1;
        rows(row,:)={variantNames{v},seeds(s),maxEvaluations,details.evaluatorCalls,details.loadCaseSolves,...
            details.modalSolves,details.objective,details.constraintViolation,details.isFeasible,bestFit,...
            bestSol(1),bestSol(2),bestSol(3),bestSol(4),info.maxDriftRatio,info.maxAccelerationRatio,...
            info.maxDeviceForceRatio,elapsed,numel(convergence)};
    end
end
varNames={'algorithm','seed','locked_max_evaluations','evaluator_calls','record_time_history_solves','modal_solves',...
    'objective_raw','violation','feasible','penalized_fitness','story','b_kg','Fc_N','c_Ns_m',...
    'max_drift_ratio','max_acc_ratio','max_force_ratio','elapsed_s','iterations'};
result=cell2table(rows,'VariableNames',varNames);
end
