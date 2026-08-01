function [bestSol, bestFit, convergence, details] = EnhancedPelicanOptimization(problem, params)
    % Enhanced Pelican Optimization Algorithm (EPOA)
    % Hybrid exploration/exploitation strategy tailored for truss topology problems.

    if nargin < 2
        params = struct();
    end

    if ~isfield(params, 'popSize'), params.popSize = 60; end
    if ~isfield(params, 'maxIter'), params.maxIter = 400; end
    if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e7; end
    if ~isfield(params, 'levyScale'), params.levyScale = 0.02; end

    bounds = problem.getBounds();
    nVar = problem.nVar;

    % Initialize pelicans and include stable all-member seed designs.
    pelicans = repmat(bounds.lb, params.popSize, 1) + ...
               rand(params.popSize, nVar) .* repmat(bounds.ub - bounds.lb, params.popSize, 1);

    topologyIdx = (problem.nBar + 1):nVar;
    areaIdx = 1:problem.nBar;
    pelicans(1, areaIdx) = 0.5 * (bounds.lb(areaIdx) + bounds.ub(areaIdx));
    pelicans(1, topologyIdx) = 1;
    if params.popSize >= 2
        pelicans(2, areaIdx) = bounds.ub(areaIdx);
        pelicans(2, topologyIdx) = 1;
    end

    fitness = zeros(params.popSize, 1);
    for i = 1:params.popSize
        [f, g] = problem.evaluate(pelicans(i, :));
        fitness(i) = f + params.penaltyCoef * g;
    end

    [bestFit, bestIdx] = min(fitness);
    bestSol = pelicans(bestIdx, :);

    convergence = zeros(params.maxIter, 1);

    for iter = 1:params.maxIter
        progress = iter / params.maxIter;

        % Adaptive coefficients
        huntFactor = 2.0 * (1 - progress);       % Exploration fades over time
        diveFactor = 0.2 + 0.8 * progress;       % Exploitation grows over time

        meanPelican = mean(pelicans, 1);

        for i = 1:params.popSize
            Xi = pelicans(i, :);

            if rand < 0.5
                % Phase 1 - Ocean scouting (global exploration)
                r1 = rand(1, nVar);
                r2 = rand(1, nVar);
                candidate = Xi + huntFactor * (r1 .* (bestSol - Xi) + r2 .* (meanPelican - Xi));
            else
                % Phase 2 - Surface strike (local intensification)
                localPerturb = randn(1, nVar) .* (bounds.ub - bounds.lb) * params.levyScale;
                candidate = bestSol + diveFactor * (Xi - bestSol) .* rand(1, nVar) + localPerturb;
            end

            % Topology-aware perturbation of the binary-like variables.
            flipMask = rand(1, numel(topologyIdx)) < (0.15 * (1 - progress));
            candidate(topologyIdx(flipMask)) = 1 - candidate(topologyIdx(flipMask));

            % Bound correction
            candidate = max(bounds.lb, min(bounds.ub, candidate));

            [candF, candG] = problem.evaluate(candidate);
            candFit = candF + params.penaltyCoef * candG;

            if candFit < fitness(i)
                pelicans(i, :) = candidate;
                fitness(i) = candFit;

                if candFit < bestFit
                    bestFit = candFit;
                    bestSol = candidate;
                end
            end
        end

        convergence(iter) = bestFit;

        if mod(iter, 50) == 0
            fprintf('EPOA - Iter %d: Best Fitness = %.6f\n', iter, bestFit);
        end
    end

    [objective, violation, info] = problem.evaluate(bestSol);
    details.objective = objective;
    details.constraintViolation = violation;
    details.info = info;
end
