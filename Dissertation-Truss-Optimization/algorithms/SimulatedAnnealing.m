function [bestSol, bestFit, convergence] = SimulatedAnnealing(problem, params)
    % Simulated Annealing for optimization
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

    if ~isfield(params, 'maxIter'), params.maxIter = 500; end
    if ~isfield(params, 'T0'), params.T0 = 100; end         % Initial temperature
    if ~isfield(params, 'alpha'), params.alpha = 0.95; end  % Cooling rate
    if ~isfield(params, 'iterPerTemp'), params.iterPerTemp = 10; end
    if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e6; end

    % Get problem bounds
    bounds = problem.getBounds();
    nVar = problem.nVar;

    % Initialize solution
    currentSol = bounds.lb + rand(1, nVar) .* (bounds.ub - bounds.lb);
    [f, g] = problem.evaluate(currentSol);
    currentFit = f + params.penaltyCoef * g;

    % Initialize best solution
    bestSol = currentSol;
    bestFit = currentFit;

    % Temperature
    T = params.T0;

    % Convergence tracking
    convergence = zeros(params.maxIter, 1);
    iter = 0;

    % Main loop
    while iter < params.maxIter
        for k = 1:params.iterPerTemp
            iter = iter + 1;
            if iter > params.maxIter
                break;
            end

            % Generate neighbor solution
            neighborSol = currentSol + randn(1, nVar) .* (bounds.ub - bounds.lb) * 0.1;

            % Apply bounds
            neighborSol = max(bounds.lb, min(bounds.ub, neighborSol));

            % Evaluate neighbor
            [fNew, gNew] = problem.evaluate(neighborSol);
            neighborFit = fNew + params.penaltyCoef * gNew;

            % Calculate acceptance probability
            deltaE = neighborFit - currentFit;

            if deltaE < 0
                % Accept better solution
                currentSol = neighborSol;
                currentFit = neighborFit;

                % Update best solution
                if currentFit < bestFit
                    bestSol = currentSol;
                    bestFit = currentFit;
                end
            else
                % Accept worse solution with probability
                if rand < exp(-deltaE / T)
                    currentSol = neighborSol;
                    currentFit = neighborFit;
                end
            end

            convergence(iter) = bestFit;

            % Display progress
            if mod(iter, 50) == 0
                fprintf('SA - Iter %d: Best Fitness = %.6f, T = %.6f\n', ...
                        iter, bestFit, T);
            end
        end

        % Cool down
        T = T * params.alpha;
    end

    % Trim convergence array if needed
    convergence = convergence(1:iter);
end
