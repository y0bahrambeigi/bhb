function [bestSol, bestFit, convergence] = GeneticAlgorithm(problem, params)
    % Genetic Algorithm for optimization
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
    if ~isfield(params, 'crossoverRate'), params.crossoverRate = 0.8; end
    if ~isfield(params, 'mutationRate'), params.mutationRate = 0.1; end
    if ~isfield(params, 'tournamentSize'), params.tournamentSize = 3; end
    if ~isfield(params, 'eliteCount'), params.eliteCount = 2; end
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
        % Selection, Crossover, and Mutation
        newPop = zeros(params.popSize, nVar);

        % Elitism: keep best solutions
        [~, sortIdx] = sort(fitness);
        for i = 1:params.eliteCount
            newPop(i, :) = pop(sortIdx(i), :);
        end

        % Generate offspring
        for i = (params.eliteCount + 1):2:params.popSize
            % Tournament selection
            parent1 = tournamentSelection(pop, fitness, params.tournamentSize);
            parent2 = tournamentSelection(pop, fitness, params.tournamentSize);

            % Crossover
            if rand < params.crossoverRate
                [child1, child2] = crossover(parent1, parent2);
            else
                child1 = parent1;
                child2 = parent2;
            end

            % Mutation
            child1 = mutate(child1, bounds, params.mutationRate);
            if i + 1 <= params.popSize
                child2 = mutate(child2, bounds, params.mutationRate);
            end

            newPop(i, :) = child1;
            if i + 1 <= params.popSize
                newPop(i + 1, :) = child2;
            end
        end

        % Update population
        pop = newPop;

        % Evaluate new population
        for i = 1:params.popSize
            [f, g] = problem.evaluate(pop(i, :));
            fitness(i) = f + params.penaltyCoef * g;
        end

        % Update best solution
        [minFit, idx] = min(fitness);
        if minFit < bestFit
            bestFit = minFit;
            bestSol = pop(idx, :);
        end

        convergence(iter) = bestFit;

        % Display progress
        if mod(iter, 50) == 0
            fprintf('GA - Iter %d: Best Fitness = %.6f\n', iter, bestFit);
        end
    end
end

function selected = tournamentSelection(pop, fitness, tournamentSize)
    % Tournament selection
    popSize = size(pop, 1);
    idx = randperm(popSize, tournamentSize);
    [~, minIdx] = min(fitness(idx));
    selected = pop(idx(minIdx), :);
end

function [child1, child2] = crossover(parent1, parent2)
    % Simulated binary crossover (SBX)
    nVar = length(parent1);
    child1 = zeros(1, nVar);
    child2 = zeros(1, nVar);

    for i = 1:nVar
        if rand < 0.5
            beta = 2 * rand;
        else
            beta = 1 / (2 * (1 - rand));
        end

        child1(i) = 0.5 * ((1 + beta) * parent1(i) + (1 - beta) * parent2(i));
        child2(i) = 0.5 * ((1 - beta) * parent1(i) + (1 + beta) * parent2(i));
    end
end

function child = mutate(child, bounds, mutationRate)
    % Polynomial mutation
    nVar = length(child);

    for i = 1:nVar
        if rand < mutationRate
            delta = min(child(i) - bounds.lb(i), bounds.ub(i) - child(i));
            rnd = rand;

            if rnd < 0.5
                deltaq = (2 * rnd)^(1/21) - 1;
            else
                deltaq = 1 - (2 * (1 - rnd))^(1/21);
            end

            child(i) = child(i) + deltaq * delta;
            child(i) = max(bounds.lb(i), min(bounds.ub(i), child(i)));
        end
    end
end
