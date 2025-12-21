function [bestSol, bestFit, convergence] = ParticleSwarmOptimization(problem, params)
    % Particle Swarm Optimization for optimization
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
    if ~isfield(params, 'w'), params.w = 0.729; end          % Inertia weight
    if ~isfield(params, 'c1'), params.c1 = 1.49445; end      % Cognitive component
    if ~isfield(params, 'c2'), params.c2 = 1.49445; end      % Social component
    if ~isfield(params, 'penaltyCoef'), params.penaltyCoef = 1e6; end

    % Get problem bounds
    bounds = problem.getBounds();
    nVar = problem.nVar;

    % Initialize particles
    particles = repmat(bounds.lb, params.popSize, 1) + ...
                rand(params.popSize, nVar) .* repmat(bounds.ub - bounds.lb, params.popSize, 1);

    % Initialize velocities
    vMax = 0.2 * (bounds.ub - bounds.lb);
    velocities = -repmat(vMax, params.popSize, 1) + ...
                 2 * rand(params.popSize, nVar) .* repmat(vMax, params.popSize, 1);

    % Evaluate initial particles
    fitness = zeros(params.popSize, 1);
    for i = 1:params.popSize
        [f, g] = problem.evaluate(particles(i, :));
        fitness(i) = f + params.penaltyCoef * g;
    end

    % Initialize personal best
    pBest = particles;
    pBestFit = fitness;

    % Initialize global best
    [gBestFit, idx] = min(pBestFit);
    gBest = pBest(idx, :);

    convergence = zeros(params.maxIter, 1);

    % Main loop
    for iter = 1:params.maxIter
        for i = 1:params.popSize
            % Update velocity
            r1 = rand(1, nVar);
            r2 = rand(1, nVar);

            velocities(i, :) = params.w * velocities(i, :) + ...
                               params.c1 * r1 .* (pBest(i, :) - particles(i, :)) + ...
                               params.c2 * r2 .* (gBest - particles(i, :));

            % Limit velocity
            velocities(i, :) = max(-vMax, min(vMax, velocities(i, :)));

            % Update position
            particles(i, :) = particles(i, :) + velocities(i, :);

            % Apply bounds
            particles(i, :) = max(bounds.lb, min(bounds.ub, particles(i, :)));

            % Evaluate
            [f, g] = problem.evaluate(particles(i, :));
            fitness(i) = f + params.penaltyCoef * g;

            % Update personal best
            if fitness(i) < pBestFit(i)
                pBest(i, :) = particles(i, :);
                pBestFit(i) = fitness(i);

                % Update global best
                if fitness(i) < gBestFit
                    gBest = particles(i, :);
                    gBestFit = fitness(i);
                end
            end
        end

        convergence(iter) = gBestFit;

        % Display progress
        if mod(iter, 50) == 0
            fprintf('PSO - Iter %d: Best Fitness = %.6f\n', iter, gBestFit);
        end
    end

    bestSol = gBest;
    bestFit = gBestFit;
end
