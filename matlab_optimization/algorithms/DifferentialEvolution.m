function [bestSol, bestFit, convergence] = DifferentialEvolution(problem, params)
    % Differential Evolution for optimization
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

    if ~isfield(params, 'popSize'), params.popSize = 50; end
    if ~isfield(params, 'maxIter'), params.maxIter = 500; end
    if ~isfield(params, 'F'), params.F = 0.5; end           % Scaling factor
    if ~isfield(params, 'CR'), params.CR = 0.9; end         % Crossover rate
    if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e6; end

    % Get problem bounds
    bounds = problem.getBounds();
    nVar = problem.nVar;

    % Initialize population
    pop = repmat(bounds.lb, params.popSize, 1) + ...
          rand(params.popSize, nVar) .* repmat(bounds.ub - bounds.lb, params.popSize, 1);

    % Evaluate initial population
    fitness = zeros(params.popSize, 1);
    for i = 1:params.popSize
        [f, g] = problem.evaluate(pop(i, :));
        fitness(i) = f + params.penaltyCoef * g;
    end

    % Track best solution
    [bestFit, idx] = min(fitness);
    bestSol = pop(idx, :);
    convergence = zeros(params.maxIter, 1);

    % Main loop
    for iter = 1:params.maxIter
        for i = 1:params.popSize
            % Mutation: DE/rand/1 strategy
            % Select three random distinct individuals
            candidates = setdiff(1:params.popSize, i);
            selectedIdx = candidates(randperm(length(candidates), 3));
            r1 = selectedIdx(1);
            r2 = selectedIdx(2);
            r3 = selectedIdx(3);

            % Mutant vector
            mutant = pop(r1, :) + params.F * (pop(r2, :) - pop(r3, :));

            % Apply bounds
            mutant = max(bounds.lb, min(bounds.ub, mutant));

            % Crossover
            trial = pop(i, :);
            jRand = randi(nVar);  % Ensure at least one parameter from mutant

            for j = 1:nVar
                if rand < params.CR || j == jRand
                    trial(j) = mutant(j);
                end
            end

            % Evaluate trial vector
            [fTrial, gTrial] = problem.evaluate(trial);
            fitTrial = fTrial + params.penaltyCoef * gTrial;

            % Selection
            if fitTrial < fitness(i)
                pop(i, :) = trial;
                fitness(i) = fitTrial;

                % Update best solution
                if fitTrial < bestFit
                    bestFit = fitTrial;
                    bestSol = trial;
                end
            end
        end

        convergence(iter) = bestFit;

        % Display progress
        if mod(iter, 50) == 0
            fprintf('DE - Iter %d: Best Fitness = %.6f\n', iter, bestFit);
        end
    end
end
