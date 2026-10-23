function result = RunDynamicDiscreteSGDLSAblation(maxEvaluations,seeds,benchmarkIds,pValue)
% Controlled equal-evaluator-budget ablation:
% BMPOA-FF-core vs BMPOA-FF-RandomDiscreteLS vs BMPOA-FF-SGDLS.
if nargin<1||isempty(maxEvaluations), maxEvaluations=35070; end
if nargin<2||isempty(seeds), seeds=2026:2030; end
if nargin<3||isempty(benchmarkIds), benchmarkIds={'72-bar','120-bar'}; end
if nargin<4||isempty(pValue), pValue=4; end
if ischar(benchmarkIds), benchmarkIds={benchmarkIds}; end
startup();
variantNames={'BMPOA-FF-core','BMPOA-FF-RandomDiscreteLS','BMPOA-FF-SGDLS'};
randomTrials=[0 3 0]; sgCandidates=[0 0 3]; rows={}; row=0;
for b=1:numel(benchmarkIds)
    problem=DiscreteDynamicSteelTruss(benchmarkIds{b});
    for v=1:numel(variantNames)
        for s=1:numel(seeds)
            params.popSize=70; params.maxEvaluations=maxEvaluations; params.levyScale=0.015;
            params.randomLocalTrials=randomTrials(v); params.sgdlsExactCandidates=sgCandidates(v);
            params.sgdlsAcceptance='first'; params.sgdlsSafetyMargin=1e-4; params.restartFraction=0;
            params.constraintOptions.p=pValue; params.constraintOptions.feasibilityTol=1e-6;
            params.sensitivityOptions.modalClusterTol=1e-5;
            rng(seeds(s),'twister'); tStart=tic;
            [bestSol,bestObjective,~,details]=BudgetedMemeticPelicanOptimizationFFSGDLS(problem,params);
            elapsedSec=toc(tStart); row=row+1;
            rows(row,:)={problem.benchmarkId,variantNames{v},seeds(s),pValue,bestObjective,details.Vp,details.Vinf,details.maxG, ...
                details.isFeasible,details.firstFeasibleEvaluation,details.evaluatorCalls,details.loadCaseSolves,details.modalSolves, ...
                details.randomLocalSearchAttempts,details.randomLocalSearchAccepted,details.sgdlsAttempts,details.sgdlsAccepted, ...
                details.sensitivityCalls,details.staticSensitivityRHS,details.modalSensitivitySolves,details.maxModalClusterSeen, ...
                details.minModalGapSeen,elapsedSec,mat2str(bestSol)}; %#ok<AGROW>
            fprintf('%s | %s | seed=%d | W=%.6g | Vp=%.3g | feasible=%d | firstFE=%g | FE=%d | sens=%d | t=%.1fs\n', ...
                problem.benchmarkId,variantNames{v},seeds(s),bestObjective,details.Vp,details.isFeasible,details.firstFeasibleEvaluation, ...
                details.evaluatorCalls,details.sensitivityCalls,elapsedSec);
        end
    end
end
columns={'benchmark','algorithm','seed','p_norm','weight','Vp','Vinf','maxG','feasible','first_feasible_FE','evaluator_calls', ...
    'static_load_case_solves','modal_solves','random_ls_attempts','random_ls_accepted','sgdls_attempts','sgdls_accepted', ...
    'sensitivity_calls','static_sensitivity_rhs','modal_sensitivity_solves','max_modal_cluster_seen','min_modal_gap_seen','elapsed_seconds','best_indices'};
result=MakeResultSet(rows,columns);
outDir=fullfile(fileparts(mfilename('fullpath')),'results','dynamic-discrete-sgdls'); if exist(outDir,'dir')~=7, mkdir(outDir); end
csvPath=fullfile(outDir,sprintf('dynamic_discrete_sgdls_equal_budget_%d_p%d.csv',maxEvaluations,pValue));
matPath=fullfile(outDir,sprintf('dynamic_discrete_sgdls_equal_budget_%d_p%d.mat',maxEvaluations,pValue));
WriteResultCsv(csvPath,result); payload.result=result; payload.maxEvaluations=maxEvaluations; payload.seeds=seeds; payload.benchmarkIds=benchmarkIds;
payload.variantNames=variantNames; payload.pValue=pValue; payload.createdUtc=datestr(now,31); SaveMatV7(matPath,payload);
fprintf('Saved %d runs to:\n%s\n%s\n',size(rows,1),csvPath,matPath);
end
