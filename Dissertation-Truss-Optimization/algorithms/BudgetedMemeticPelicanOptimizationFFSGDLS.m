function [bestSol,bestObjective,convergence,details] = BudgetedMemeticPelicanOptimizationFFSGDLS(problem,params)
%BUDGETEDMEMETICPELICANOPTIMIZATIONFFSGDLS
% Feasibility-first BMPOA with optional Random-DiscreteLS or SG-DLS.
% All exact candidates consume the same evaluator-call budget.
% Analytical sensitivity overhead is logged separately.

if nargin < 2, params = struct(); end
if ~isfield(params,'popSize'), params.popSize = 70; end
if ~isfield(params,'maxEvaluations'), params.maxEvaluations = 35070; end
if ~isfield(params,'levyScale'), params.levyScale = 0.015; end
if ~isfield(params,'randomLocalTrials'), params.randomLocalTrials = 0; end
if ~isfield(params,'sgdlsExactCandidates'), params.sgdlsExactCandidates = 0; end
if ~isfield(params,'sgdlsAcceptance'), params.sgdlsAcceptance = 'first'; end
if ~isfield(params,'sgdlsSafetyMargin'), params.sgdlsSafetyMargin = 1e-4; end
if ~isfield(params,'constraintOptions') || isempty(params.constraintOptions), params.constraintOptions=struct(); end
if ~isfield(params.constraintOptions,'p'), params.constraintOptions.p = 4; end
if ~isfield(params.constraintOptions,'feasibilityTol'), params.constraintOptions.feasibilityTol=1e-6; end
if ~isfield(params,'sensitivityOptions') || isempty(params.sensitivityOptions), params.sensitivityOptions=struct(); end
if ~isfield(params.sensitivityOptions,'modalClusterTol'), params.sensitivityOptions.modalClusterTol=1e-5; end
if ~isfield(params,'restartFraction'), params.restartFraction = 0; end
if ~isfield(params,'stagnationEvaluations'), params.stagnationEvaluations=max(params.popSize,round(0.06*params.maxEvaluations)); end

validateattributes(params.popSize,{'numeric'},{'scalar','integer','>=',2});
validateattributes(params.maxEvaluations,{'numeric'},{'scalar','integer','>=',params.popSize});
validateattributes(params.randomLocalTrials,{'numeric'},{'scalar','integer','nonnegative'});
validateattributes(params.sgdlsExactCandidates,{'numeric'},{'scalar','integer','nonnegative'});
if ~(isprop(problem,'decisionType') && strcmpi(problem.decisionType,'discrete'))
    error('BudgetedMemeticPelicanOptimizationFFSGDLS:DiscreteOnly','Pure discrete sizing only.');
end

bounds = problem.getBounds(); nVar = problem.nVar;
pelicans = repmat(bounds.lb,params.popSize,1) + rand(params.popSize,nVar).*repmat(bounds.ub-bounds.lb,params.popSize,1);
pelicans(1,:) = 0.5*(bounds.lb+bounds.ub);
if params.popSize >= 2, pelicans(2,:) = bounds.ub; end
for i=1:params.popSize, pelicans(i,:)=problem.projectDecision(pelicans(i,:)); end

objectiveValues=zeros(params.popSize,1); cvRecords=cell(params.popSize,1); gRecords=cell(params.popSize,1); populationInfo=cell(params.popSize,1);
evaluationCount=0; loadCaseSolveCount=0; modalSolveCount=0;
randomLSAttempts=0; randomLSAccepted=0; sgdlsAttempts=0; sgdlsAccepted=0;
sensitivityCalls=0; staticSensitivityRHS=0; modalSensitivitySolves=0;
maxModalClusterSeen=1; minModalGapSeen=inf; firstFeasibleEvaluation=NaN;

for i=1:params.popSize
    [f,~,info]=problem.evaluate(pelicans(i,:)); evaluationCount=evaluationCount+1;
    loadCaseSolveCount=loadCaseSolveCount+localLoadCaseCount(info); modalSolveCount=modalSolveCount+localModalSolveCount(info);
    [cv,g]=BuildDynamicDiscreteConstraintCV(problem,info,params.constraintOptions);
    objectiveValues(i)=f; cvRecords{i}=cv; gRecords{i}=g; populationInfo{i}=info;
    if isnan(firstFeasibleEvaluation) && cv.feasible, firstFeasibleEvaluation=evaluationCount; end
end

bestIdx=localBestIndex(objectiveValues,cvRecords); bestSol=pelicans(bestIdx,:);
bestObjective=objectiveValues(bestIdx); bestCV=cvRecords{bestIdx}; bestG=gRecords{bestIdx}; bestInfo=populationInfo{bestIdx};
lastImprovementEvaluation=evaluationCount; iteration=0; restartCount=0; restartEvaluationHistory=[]; evaluationHistory=[];
convergence.weight=[]; convergence.Vp=[]; convergence.Vinf=[]; convergence.feasible=[];

while evaluationCount < params.maxEvaluations
    iteration=iteration+1; progress=min(1,evaluationCount/params.maxEvaluations);
    huntFactor=2*(1-progress); diveFactor=0.2+0.8*progress; meanPelican=mean(pelicans,1);

    for i=1:params.popSize
        if evaluationCount>=params.maxEvaluations, break; end
        Xi=pelicans(i,:);
        if rand<0.5
            r1=rand(1,nVar); r2=rand(1,nVar);
            candidate=Xi+huntFactor*(r1.*(bestSol-Xi)+r2.*(meanPelican-Xi));
        else
            localPerturb=randn(1,nVar).*(bounds.ub-bounds.lb)*params.levyScale;
            candidate=bestSol+diveFactor*(Xi-bestSol).*rand(1,nVar)+localPerturb;
        end
        candidate=max(bounds.lb,min(bounds.ub,candidate)); candidate=problem.projectDecision(candidate);
        [candF,~,candInfo]=problem.evaluate(candidate); evaluationCount=evaluationCount+1;
        loadCaseSolveCount=loadCaseSolveCount+localLoadCaseCount(candInfo); modalSolveCount=modalSolveCount+localModalSolveCount(candInfo);
        [candCV,candG]=BuildDynamicDiscreteConstraintCV(problem,candInfo,params.constraintOptions);
        if isnan(firstFeasibleEvaluation) && candCV.feasible, firstFeasibleEvaluation=evaluationCount; end
        if localIsBetter(candF,candCV,objectiveValues(i),cvRecords{i})
            pelicans(i,:)=candidate; objectiveValues(i)=candF; cvRecords{i}=candCV; gRecords{i}=candG; populationInfo{i}=candInfo;
            if localIsBetter(candF,candCV,bestObjective,bestCV)
                bestSol=candidate; bestObjective=candF; bestCV=candCV; bestG=candG; bestInfo=candInfo; lastImprovementEvaluation=evaluationCount;
            end
        end
    end

    for trial=1:params.randomLocalTrials
        if evaluationCount>=params.maxEvaluations, break; end
        candidate=bestSol; j=randi(nVar); step=2*(rand>=0.5)-1;
        candidate(j)=candidate(j)+step; candidate=problem.projectDecision(candidate);
        if isequal(candidate,bestSol), candidate=bestSol; candidate(j)=candidate(j)-step; candidate=problem.projectDecision(candidate); end
        randomLSAttempts=randomLSAttempts+1;
        [candF,~,candInfo]=problem.evaluate(candidate); evaluationCount=evaluationCount+1;
        loadCaseSolveCount=loadCaseSolveCount+localLoadCaseCount(candInfo); modalSolveCount=modalSolveCount+localModalSolveCount(candInfo);
        [candCV,candG]=BuildDynamicDiscreteConstraintCV(problem,candInfo,params.constraintOptions);
        if isnan(firstFeasibleEvaluation) && candCV.feasible, firstFeasibleEvaluation=evaluationCount; end
        if localIsBetter(candF,candCV,bestObjective,bestCV)
            randomLSAccepted=randomLSAccepted+1; bestSol=candidate; bestObjective=candF; bestCV=candCV; bestG=candG; bestInfo=candInfo;
            lastImprovementEvaluation=evaluationCount; worstIdx=localWorstIndex(objectiveValues,cvRecords);
            pelicans(worstIdx,:)=candidate; objectiveValues(worstIdx)=candF; cvRecords{worstIdx}=candCV; gRecords{worstIdx}=candG; populationInfo{worstIdx}=candInfo;
        end
    end

    if params.sgdlsExactCandidates>0 && evaluationCount<params.maxEvaluations
        current.x=bestSol; current.W=bestObjective; current.cv=bestCV; current.g=bestG; current.info=bestInfo;
        [sens,sStats]=ComputeDynamicDiscreteSensitivities(problem,bestSol,bestInfo,params.sensitivityOptions);
        sensitivityCalls=sensitivityCalls+1; staticSensitivityRHS=staticSensitivityRHS+sStats.staticSensitivityRHS;
        modalSensitivitySolves=modalSensitivitySolves+sStats.modalEigenSolves;
        maxModalClusterSeen=max(maxModalClusterSeen,sStats.maxModalClusterSize);
        minModalGapSeen=min(minModalGapSeen,sStats.minConstrainedModalRelativeGap);
        rankOpts.safetyMargin=params.sgdlsSafetyMargin; rankOpts.constraintOptions=params.constraintOptions; rankOpts.allowRepairFallback=true;
        moves=RankDynamicSGDLSMoves(problem,current,sens,rankOpts);
        nTry=min([params.sgdlsExactCandidates,numel(moves),params.maxEvaluations-evaluationCount]);
        bestLocalSol=[]; bestLocalF=NaN; bestLocalCV=[]; bestLocalG=[]; bestLocalInfo=[];
        for k=1:nTry
            candidate=bestSol; candidate(moves(k).group)=candidate(moves(k).group)+moves(k).direction; candidate=problem.projectDecision(candidate);
            sgdlsAttempts=sgdlsAttempts+1;
            [candF,~,candInfo]=problem.evaluate(candidate); evaluationCount=evaluationCount+1;
            loadCaseSolveCount=loadCaseSolveCount+localLoadCaseCount(candInfo); modalSolveCount=modalSolveCount+localModalSolveCount(candInfo);
            [candCV,candG]=BuildDynamicDiscreteConstraintCV(problem,candInfo,params.constraintOptions);
            if isnan(firstFeasibleEvaluation) && candCV.feasible, firstFeasibleEvaluation=evaluationCount; end
            if localIsBetter(candF,candCV,bestObjective,bestCV)
                if isempty(bestLocalSol) || localIsBetter(candF,candCV,bestLocalF,bestLocalCV)
                    bestLocalSol=candidate; bestLocalF=candF; bestLocalCV=candCV; bestLocalG=candG; bestLocalInfo=candInfo;
                end
                if strcmpi(params.sgdlsAcceptance,'first'), break; end
            end
        end
        if ~isempty(bestLocalSol)
            sgdlsAccepted=sgdlsAccepted+1; bestSol=bestLocalSol; bestObjective=bestLocalF; bestCV=bestLocalCV; bestG=bestLocalG; bestInfo=bestLocalInfo;
            lastImprovementEvaluation=evaluationCount; worstIdx=localWorstIndex(objectiveValues,cvRecords);
            pelicans(worstIdx,:)=bestSol; objectiveValues(worstIdx)=bestObjective; cvRecords{worstIdx}=bestCV; gRecords{worstIdx}=bestG; populationInfo{worstIdx}=bestInfo;
        end
    end

    if params.restartFraction>0 && (evaluationCount-lastImprovementEvaluation)>=params.stagnationEvaluations
        nRestart=max(1,round(params.restartFraction*params.popSize)); restartIdx=localWorstIndices(objectiveValues,cvRecords,nRestart);
        for k=1:numel(restartIdx)
            if evaluationCount>=params.maxEvaluations, break; end
            idx=restartIdx(k); candidate=bounds.lb+rand(1,nVar).*(bounds.ub-bounds.lb); candidate=problem.projectDecision(candidate);
            [candF,~,candInfo]=problem.evaluate(candidate); evaluationCount=evaluationCount+1;
            loadCaseSolveCount=loadCaseSolveCount+localLoadCaseCount(candInfo); modalSolveCount=modalSolveCount+localModalSolveCount(candInfo);
            [candCV,candG]=BuildDynamicDiscreteConstraintCV(problem,candInfo,params.constraintOptions);
            if isnan(firstFeasibleEvaluation) && candCV.feasible, firstFeasibleEvaluation=evaluationCount; end
            pelicans(idx,:)=candidate; objectiveValues(idx)=candF; cvRecords{idx}=candCV; gRecords{idx}=candG; populationInfo{idx}=candInfo;
            if localIsBetter(candF,candCV,bestObjective,bestCV), bestSol=candidate; bestObjective=candF; bestCV=candCV; bestG=candG; bestInfo=candInfo; end
        end
        restartCount=restartCount+1; restartEvaluationHistory(end+1,1)=evaluationCount; lastImprovementEvaluation=evaluationCount; %#ok<AGROW>
    end

    evaluationHistory(end+1,1)=evaluationCount; convergence.weight(end+1,1)=bestObjective; convergence.Vp(end+1,1)=bestCV.Vp; %#ok<AGROW>
    convergence.Vinf(end+1,1)=bestCV.Vinf; convergence.feasible(end+1,1)=bestCV.feasible; %#ok<AGROW>
end

details.objective=bestObjective; details.constraintViolation=bestCV.Vp; details.Vp=bestCV.Vp; details.Vinf=bestCV.Vinf; details.maxG=bestCV.maxG;
details.constraintRecord=bestCV; details.info=bestInfo; details.evaluationCount=evaluationCount; details.evaluatorCalls=evaluationCount;
details.loadCaseSolves=loadCaseSolveCount; details.modalSolves=modalSolveCount;
details.randomLocalSearchAttempts=randomLSAttempts; details.randomLocalSearchAccepted=randomLSAccepted;
details.sgdlsAttempts=sgdlsAttempts; details.sgdlsAccepted=sgdlsAccepted; details.sensitivityCalls=sensitivityCalls;
details.staticSensitivityRHS=staticSensitivityRHS; details.modalSensitivitySolves=modalSensitivitySolves;
details.maxModalClusterSeen=maxModalClusterSeen; details.minModalGapSeen=minModalGapSeen;
details.firstFeasibleEvaluation=firstFeasibleEvaluation; details.iterationsCompleted=iteration; details.evaluationHistory=evaluationHistory;
details.restartCount=restartCount; details.restartEvaluationHistory=restartEvaluationHistory; details.isFeasible=bestCV.feasible;
details.parameters=params; details.constraintHandling='feasibility-first-family-balanced-pnorm';
end

function tf=localIsBetter(fA,cvA,fB,cvB), A.W=fA; A.cv=cvA; B.W=fB; B.cv=cvB; tf=isBetter(A,B); end
function idx=localBestIndex(f,cv), idx=1; for i=2:numel(f), if localIsBetter(f(i),cv{i},f(idx),cv{idx}), idx=i; end, end, end
function idx=localWorstIndex(f,cv), idx=1; for i=2:numel(f), if localIsBetter(f(idx),cv{idx},f(i),cv{i}), idx=i; end, end, end
function idx=localWorstIndices(f,cv,n)
remaining=1:numel(f); idx=zeros(1,min(n,numel(f)));
for k=1:numel(idx), w=1; for j=2:numel(remaining), a=remaining(w); b=remaining(j); if localIsBetter(f(a),cv{a},f(b),cv{b}), w=j; end, end, idx(k)=remaining(w); remaining(w)=[]; end
end
function n=localLoadCaseCount(info), if isfield(info,'nLoadCases'), n=info.nLoadCases; elseif isfield(info,'loads')&&~isempty(info.loads), n=size(info.loads,2); else, n=1; end, end
function n=localModalSolveCount(info), if isfield(info,'modalAnalysisPerformed')&&info.modalAnalysisPerformed, n=1; else, n=0; end, end
