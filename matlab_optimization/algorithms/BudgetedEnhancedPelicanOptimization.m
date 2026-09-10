function [bestSol, bestFit, convergence, details] = BudgetedEnhancedPelicanOptimization(problem, params)
%BudgetedEnhancedPelicanOptimization EPOA under an exact FE-evaluation budget.
% Optional deterministic discrete elite local search is charged to the same
% structural-analysis budget as the population search.

if nargin < 2, params = struct(); end
if ~isfield(params, 'popSize'), params.popSize = 70; end
if ~isfield(params, 'maxEvaluations'), params.maxEvaluations = 35070; end
if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e7; end
if ~isfield(params, 'levyScale'), params.levyScale = 0.015; end
if ~isfield(params, 'useLocalSearch'), params.useLocalSearch = false; end
if ~isfield(params, 'lsPeriod'), params.lsPeriod = 5; end
if ~isfield(params, 'lsStep'), params.lsStep = 1; end

validateattributes(params.popSize, {'numeric'}, {'scalar','integer','>=',2});
validateattributes(params.maxEvaluations, {'numeric'}, {'scalar','integer','>=',params.popSize});
validateattributes(params.penaltyCoef, {'numeric'}, {'scalar','real','finite','positive'});
validateattributes(params.levyScale, {'numeric'}, {'scalar','real','finite','nonnegative'});
validateattributes(params.lsPeriod, {'numeric'}, {'scalar','integer','positive'});
validateattributes(params.lsStep, {'numeric'}, {'scalar','real','finite','positive'});

bounds = problem.getBounds();
nVar = problem.nVar;

pelicans = repmat(bounds.lb, params.popSize, 1) + ...
    rand(params.popSize, nVar) .* repmat(bounds.ub - bounds.lb, params.popSize, 1);

topologyIdx = [];
areaIdx = 1:nVar;
if isprop(problem, 'nBar') && nVar == 2 * problem.nBar
    areaIdx = 1:problem.nBar;
    topologyIdx = (problem.nBar + 1):nVar;
end

pelicans(1, areaIdx) = 0.5 * (bounds.lb(areaIdx) + bounds.ub(areaIdx));
if ~isempty(topologyIdx), pelicans(1, topologyIdx) = 1; end
if params.popSize >= 2, pelicans(2, :) = bounds.ub; end

if ismethod(problem, 'projectDecision')
    for i = 1:params.popSize
        pelicans(i, :) = problem.projectDecision(pelicans(i, :));
    end
end
initialPopulation = pelicans;

fitness = inf(params.popSize, 1);
bestFit = inf;
bestSol = pelicans(1, :);
bestObjective = inf;
bestViolation = inf;
bestInfo = struct();
bestEvaluation = 0;
evaluationCount = 0;
convergence = nan(params.maxEvaluations, 1);

for i = 1:params.popSize
    [f, g, info] = problem.evaluate(pelicans(i, :));
    evaluationCount = evaluationCount + 1;
    fit = f + params.penaltyCoef * g;
    fitness(i) = fit;
    if fit < bestFit
        bestFit = fit;
        bestSol = pelicans(i, :);
        bestObjective = f;
        bestViolation = g;
        bestInfo = info;
        bestEvaluation = evaluationCount;
    end
    convergence(evaluationCount) = bestFit;
end

generation = 0;
localSearchEvaluations = 0;
localSearchAccepted = 0;

while evaluationCount < params.maxEvaluations
    generation = generation + 1;
    progress = evaluationCount / params.maxEvaluations;
    huntFactor = 2.0 * (1 - progress);
    diveFactor = 0.2 + 0.8 * progress;
    meanPelican = mean(pelicans, 1);

    for i = 1:params.popSize
        if evaluationCount >= params.maxEvaluations, break; end
        Xi = pelicans(i, :);

        if rand < 0.5
            r1 = rand(1, nVar);
            r2 = rand(1, nVar);
            candidate = Xi + huntFactor * ...
                (r1 .* (bestSol - Xi) + r2 .* (meanPelican - Xi));
        else
            localPerturb = randn(1, nVar) .* (bounds.ub - bounds.lb) * params.levyScale;
            candidate = bestSol + diveFactor * (Xi - bestSol) .* rand(1, nVar) + localPerturb;
        end

        if ~isempty(topologyIdx)
            flipMask = rand(1, numel(topologyIdx)) < (0.15 * (1 - progress));
            candidate(topologyIdx(flipMask)) = 1 - candidate(topologyIdx(flipMask));
        end

        candidate = max(bounds.lb, min(bounds.ub, candidate));
        if ismethod(problem, 'projectDecision')
            candidate = problem.projectDecision(candidate);
        end

        [candF, candG, candInfo] = problem.evaluate(candidate);
        evaluationCount = evaluationCount + 1;
        candFit = candF + params.penaltyCoef * candG;

        if candFit < fitness(i)
            pelicans(i, :) = candidate;
            fitness(i) = candFit;
            if candFit < bestFit
                bestFit = candFit;
                bestSol = candidate;
                bestObjective = candF;
                bestViolation = candG;
                bestInfo = candInfo;
                bestEvaluation = evaluationCount;
            end
        end
        convergence(evaluationCount) = bestFit;
    end

    if params.useLocalSearch && mod(generation, params.lsPeriod) == 0 && ...
            evaluationCount < params.maxEvaluations
        remaining = params.maxEvaluations - evaluationCount;
        [bestSol, bestFit, bestObjective, bestViolation, bestInfo, ...
            lsHistory, accepted] = discreteEliteLocalSearch( ...
            problem, bestSol, bestFit, bestObjective, bestViolation, bestInfo, ...
            params, bounds, remaining);

        nLS = numel(lsHistory);
        if nLS > 0
            convergence(evaluationCount + (1:nLS)) = lsHistory;
            evaluationCount = evaluationCount + nLS;
            localSearchEvaluations = localSearchEvaluations + nLS;
            localSearchAccepted = localSearchAccepted + accepted;
            if accepted > 0
                [~, worstIdx] = max(fitness);
                pelicans(worstIdx, :) = bestSol;
                fitness(worstIdx) = bestFit;
                bestEvaluation = evaluationCount - nLS + find(lsHistory == bestFit, 1, 'first');
            end
        end
    end
end

convergence = convergence(1:evaluationCount);
details.objective = bestObjective;
details.constraintViolation = bestViolation;
details.info = bestInfo;
details.evaluationCount = evaluationCount;
details.bestEvaluation = bestEvaluation;
details.generations = generation;
details.localSearchEvaluations = localSearchEvaluations;
details.localSearchAccepted = localSearchAccepted;
details.isFeasible = bestInfo.isFeasible;
details.parameters = params;
details.initialPopulation = initialPopulation;
end

function [xBest, fitBest, objBest, gBest, infoBest, history, accepted] = ...
    discreteEliteLocalSearch(problem, xBest, fitBest, objBest, gBest, infoBest, ...
    params, bounds, maxTrials)

history = zeros(0, 1);
accepted = 0;
if ~ismethod(problem, 'projectDecision') || maxTrials <= 0
    return;
end

nVar = problem.nVar;
for j = 1:nVar
    for direction = [-1, 1]
        if numel(history) >= maxTrials, return; end

        candidate = xBest;
        candidate(j) = candidate(j) + direction * params.lsStep;
        candidate = max(bounds.lb, min(bounds.ub, candidate));
        candidate = problem.projectDecision(candidate);

        if all(candidate == xBest)
            continue;
        end

        [candF, candG, candInfo] = problem.evaluate(candidate);
        candFit = candF + params.penaltyCoef * candG;
        if candFit < fitBest
            xBest = candidate;
            fitBest = candFit;
            objBest = candF;
            gBest = candG;
            infoBest = candInfo;
            accepted = accepted + 1;
        end
        history(end + 1, 1) = fitBest; %#ok<AGROW>
    end
end
end
