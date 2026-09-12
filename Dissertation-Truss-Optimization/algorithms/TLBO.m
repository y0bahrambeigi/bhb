function [bestSol, bestFit, convergence] = TLBO(problem, params)
    % Teaching-Learning-Based Optimization
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
        % Calculate mean of population
        meanPop = mean(pop, 1);

        % Find teacher (best solution)
        [~, teacherIdx] = min(fitness);
        teacher = pop(teacherIdx, :);

        % ===== Teaching Phase =====
        for i = 1:params.popSize
            % Teaching factor (1 or 2 randomly)
            TF = randi([1, 2]);

            % Generate new solution based on teacher
            newSol = pop(i, :) + rand(1, nVar) .* (teacher - TF * meanPop);

            % Apply bounds
            newSol = max(bounds.lb, min(bounds.ub, newSol));

            % Evaluate
            [fNew, gNew] = problem.evaluate(newSol);
            fitNew = fNew + params.penaltyCoef * gNew;

            % Accept if better
            if fitNew < fitness(i)
                pop(i, :) = newSol;
                fitness(i) = fitNew;

                % Update best solution
                if fitNew < bestFit
                    bestFit = fitNew;
                    bestSol = newSol;
                end
            end
        end

        % ===== Learning Phase =====
        for i = 1:params.popSize
            % Select a random partner (different from i)
            partners = setdiff(1:params.popSize, i);
            j = partners(randi(length(partners)));

            % Learn from better student
            if fitness(i) < fitness(j)
                newSol = pop(i, :) + rand(1, nVar) .* (pop(i, :) - pop(j, :));
            else
                newSol = pop(i, :) + rand(1, nVar) .* (pop(j, :) - pop(i, :));
            end

            % Apply bounds
            newSol = max(bounds.lb, min(bounds.ub, newSol));

            % Evaluate
            [fNew, gNew] = problem.evaluate(newSol);
            fitNew = fNew + params.penaltyCoef * gNew;

            % Accept if better
            if fitNew < fitness(i)
                pop(i, :) = newSol;
                fitness(i) = fitNew;

                % Update best solution
                if fitNew < bestFit
                    bestFit = fitNew;
                    bestSol = newSol;
                end
            end
        end

        convergence(iter) = bestFit;

        % Display progress
        if mod(iter, 50) == 0
            fprintf('TLBO - Iter %d: Best Fitness = %.6f\n', iter, bestFit);
        end
    end
end
