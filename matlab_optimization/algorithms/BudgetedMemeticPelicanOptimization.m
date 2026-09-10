function [bestSol, bestFit, convergence, details] = BudgetedMemeticPelicanOptimization(problem, params)
%BudgetedMemeticPelicanOptimization Equal-FE-budget POA / POA+LS runner.
% Setting params.localSearchTrials = 0 reproduces the budgeted POA baseline.
% Positive localSearchTrials enables a problem-aware elite local search while
% keeping the same total number of structural evaluations.

if nargin < 2, params = struct(); end
if ~isfield(params, 'popSize'), params.popSize = 70; end
if ~isfield(params, 'maxEvaluations'), params.maxEvaluations = 35070; end
if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e7; end
if ~isfield(params, 'levyScale'), params.levyScale = 0.015; end
if ~isfield(params, 'localSearchTrials'), params.localSearchTrials = 0; end
if ~isfield(params, 'areaMoveProbability'), params.areaMoveProbability = 0.80; end
if ~isfield(params, 'shrinkProbability'), params.shrinkProbability = 0.65; end
if ~isfield(params, 'localSearchMinScale'), params.localSearchMinScale = 0.01; end
if ~isfield(params, 'localSearchMaxScale'), params.localSearchMaxScale = 0.05; end
if ~isfield(params, 'restartFraction'), params.restartFraction = 0.0; end
if ~isfield(params, 'stagnationEvaluations')
    params.stagnationEvaluations = max(params.popSize, round(0.06 * params.maxEvaluations));
end

validateattributes(params.popSize, {'numeric'}, {'scalar','integer','>=',2});
validateattributes(params.maxEvaluations, {'numeric'}, {'scalar','integer','>=',params.popSize});
validateattributes(params.localSearchTrials, {'numeric'}, {'scalar','integer','nonnegative'});
validateattributes(params.restartFraction, {'numeric'}, {'scalar','real','finite','>=',0,'<',1});
validateattributes(params.stagnationEvaluations, {'numeric'}, {'scalar','integer','nonnegative'});

bounds = problem.getBounds();
nVar = problem.nVar;

pelicans = repmat(bounds.lb, params.popSize, 1) + ...
    rand(params.popSize, nVar) .* repmat(bounds.ub - bounds.lb, params.popSize, 1);

topologyIdx = [];
areaIdx = 1:nVar;
isMixedTopology = isprop(problem, 'nBar') && nVar == 2 * problem.nBar;
if isMixedTopology
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

fitness = zeros(params.popSize, 1);
evaluationCount = 0;
for i = 1:params.popSize
    [f, g] = problem.evaluate(pelicans(i, :));
    evaluationCount = evaluationCount + 1;
    fitness(i) = f + params.penaltyCoef * g;
end

[bestFit, bestIdx] = min(fitness);
bestSol = pelicans(bestIdx, :);
lastImprovementEvaluation = evaluationCount;
restartCount = 0;
restartEvaluationHistory = [];

convergence = [];
evaluationHistory = [];
iteration = 0;

while evaluationCount < params.maxEvaluations
    iteration = iteration + 1;
    progress = min(1, evaluationCount / params.maxEvaluations);
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
            localPerturb = randn(1, nVar) .* ...
                (bounds.ub - bounds.lb) * params.levyScale;
            candidate = bestSol + diveFactor * (Xi - bestSol) .* ...
                rand(1, nVar) + localPerturb;
        end

        if ~isempty(topologyIdx)
            flipMask = rand(1, numel(topologyIdx)) < (0.15 * (1 - progress));
            candidate(topologyIdx(flipMask)) = 1 - candidate(topologyIdx(flipMask));
        end

        candidate = max(bounds.lb, min(bounds.ub, candidate));
        if ismethod(problem, 'projectDecision')
            candidate = problem.projectDecision(candidate);
        end

        [candF, candG] = problem.evaluate(candidate);
        evaluationCount = evaluationCount + 1;
        candFit = candF + params.penaltyCoef * candG;

        if candFit < fitness(i)
            pelicans(i, :) = candidate;
            fitness(i) = candFit;
            if candFit < bestFit
                bestFit = candFit;
                bestSol = candidate;
                lastImprovementEvaluation = evaluationCount;
            end
        end
    end

    for trial = 1:params.localSearchTrials
        if evaluationCount >= params.maxEvaluations, break; end

        candidate = bestSol;

        if ismethod(problem, 'projectDecision') && ~isMixedTopology
            % Discrete/grouped sizing: one-step catalog neighborhood.
            j = randi(nVar);
            if rand < 0.5, step = -1; else, step = 1; end
            candidate(j) = candidate(j) + step;
            candidate = problem.projectDecision(candidate);

        elseif isMixedTopology
            % Mixed sizing/topology benchmark: local coordinate search.
            if rand < params.areaMoveProbability
                j = randi(problem.nBar);
                if rand < params.shrinkProbability
                    direction = -1;
                else
                    direction = 1;
                end
                scale = params.localSearchMinScale + ...
                    (params.localSearchMaxScale - params.localSearchMinScale) * rand;
                candidate(j) = candidate(j) + direction * scale * ...
                    (bounds.ub(j) - bounds.lb(j));
            else
                j = problem.nBar + randi(problem.nBar);
                candidate(j) = 1 - candidate(j);
            end
            candidate = max(bounds.lb, min(bounds.ub, candidate));

        else
            % Generic continuous fallback.
            j = randi(nVar);
            step = (2 * rand - 1) * params.localSearchMaxScale * ...
                (bounds.ub(j) - bounds.lb(j));
            candidate(j) = candidate(j) + step;
            candidate = max(bounds.lb, min(bounds.ub, candidate));
        end

        [candF, candG] = problem.evaluate(candidate);
        evaluationCount = evaluationCount + 1;
        candFit = candF + params.penaltyCoef * candG;

        if candFit < bestFit
            bestFit = candFit;
            bestSol = candidate;
            lastImprovementEvaluation = evaluationCount;
            [~, worstIdx] = max(fitness);
            pelicans(worstIdx, :) = candidate;
            fitness(worstIdx) = candFit;
        end
    end

    % Stagnation-triggered diversity restart. Restart evaluations consume the
    % same finite-element budget, so restart variants remain directly comparable.
    if params.restartFraction > 0 && ...
            (evaluationCount - lastImprovementEvaluation) >= params.stagnationEvaluations
        nRestart = max(1, round(params.restartFraction * params.popSize));
        [~, order] = sort(fitness, 'descend');
        restartIdx = order(1:min(nRestart, numel(order)));

        for k = 1:numel(restartIdx)
            if evaluationCount >= params.maxEvaluations, break; end
            idx = restartIdx(k);
            candidate = bounds.lb + rand(1, nVar) .* (bounds.ub - bounds.lb);
            if ismethod(problem, 'projectDecision')
                candidate = problem.projectDecision(candidate);
            end

            [candF, candG] = problem.evaluate(candidate);
            evaluationCount = evaluationCount + 1;
            candFit = candF + params.penaltyCoef * candG;

            % Replace unconditionally to inject diversity; the elite is protected
            % because only the current worst population members are restarted.
            pelicans(idx, :) = candidate;
            fitness(idx) = candFit;
            if candFit < bestFit
                bestFit = candFit;
                bestSol = candidate;
            end
        end

        restartCount = restartCount + 1;
        restartEvaluationHistory(end + 1, 1) = evaluationCount; %#ok<AGROW>
        lastImprovementEvaluation = evaluationCount;
    end

    convergence(end + 1, 1) = bestFit; %#ok<AGROW>
    evaluationHistory(end + 1, 1) = evaluationCount; %#ok<AGROW>
end

[objective, violation, info] = problem.evaluate(bestSol);
details.objective = objective;
details.constraintViolation = violation;
details.info = info;
details.evaluationCount = evaluationCount;
details.iterationsCompleted = iteration;
details.evaluationHistory = evaluationHistory;
details.restartCount = restartCount;
details.restartEvaluationHistory = restartEvaluationHistory;
details.isFeasible = info.isFeasible;
details.parameters = params;
end
