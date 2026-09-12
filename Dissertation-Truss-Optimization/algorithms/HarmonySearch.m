function [bestSol, bestFit, convergence] = HarmonySearch(problem, params)
    % Harmony Search for optimization
    % Input:
    %   problem - problem object with evaluate() and getBounds() methods
    %   params - structure with algorithm parameters
    % Output:
    %   bestSol - best solution found
    %   bestFit - best fitness value
    %   convergence - convergence history

    % Default parameters
    if nargin < 2
        params = struct();
    end

    if ~isfield(params, 'HMS'), params.HMS = 30; end          % Harmony Memory Size
    if ~isfield(params, 'maxIter'), params.maxIter = 500; end
    if ~isfield(params, 'HMCR'), params.HMCR = 0.9; end      % Harmony Memory Consideration Rate
    if ~isfield(params, 'PAR'), params.PAR = 0.3; end        % Pitch Adjustment Rate
    if ~isfield(params, 'bw'), params.bw = 0.01; end         % Bandwidth
    if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e6; end

    % Get problem bounds
    bounds = problem.getBounds();
    nVar = problem.nVar;

    % Initialize Harmony Memory
    HM = repmat(bounds.lb, params.HMS, 1) + ...
         rand(params.HMS, nVar) .* repmat(bounds.ub - bounds.lb, params.HMS, 1);

    % Evaluate Harmony Memory
    fitness = zeros(params.HMS, 1);
    for i = 1:params.HMS
        [f, g] = problem.evaluate(HM(i, :));
        fitness(i) = f + params.penaltyCoef * g;
    end

    % Track best solution
    [bestFit, idx] = min(fitness);
    bestSol = HM(idx, :);
    convergence = zeros(params.maxIter, 1);

    % Main loop
    for iter = 1:params.maxIter
        % Generate new harmony
        newHarmony = zeros(1, nVar);

        for j = 1:nVar
            if rand < params.HMCR
                % Memory consideration
                idx = randi(params.HMS);
                newHarmony(j) = HM(idx, j);

                % Pitch adjustment
                if rand < params.PAR
                    newHarmony(j) = newHarmony(j) + ...
                                   (rand - 0.5) * 2 * params.bw * (bounds.ub(j) - bounds.lb(j));
                end
            else
                % Random selection
                newHarmony(j) = bounds.lb(j) + rand * (bounds.ub(j) - bounds.lb(j));
            end

            % Apply bounds
            newHarmony(j) = max(bounds.lb(j), min(bounds.ub(j), newHarmony(j)));
        end

        % Evaluate new harmony
        [fNew, gNew] = problem.evaluate(newHarmony);
        fitNew = fNew + params.penaltyCoef * gNew;

        % Update Harmony Memory
        [worstFit, worstIdx] = max(fitness);
        if fitNew < worstFit
            HM(worstIdx, :) = newHarmony;
            fitness(worstIdx) = fitNew;

            % Update best solution
            if fitNew < bestFit
                bestFit = fitNew;
                bestSol = newHarmony;
            end
        end

        convergence(iter) = bestFit;

        % Display progress
        if mod(iter, 50) == 0
            fprintf('HS - Iter %d: Best Fitness = %.6f\n', iter, bestFit);
        end
    end
end
