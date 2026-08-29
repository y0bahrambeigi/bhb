classdef TwentyFiveBarSpaceTruss
    % TwentyFiveBarSpaceTruss - Discrete grouped sizing benchmark.
    %
    % Eight decision variables select cross-sectional areas for the 25
    % members. The evaluator considers two load cases, group-dependent
    % compression limits, a common tension limit, and nodal displacement.

    properties
        nBar = 25;
        nVar = 8;
        E = 10000;                 % ksi
        rho = 0.1;                 % lb/in^3
        deltaMax = 0.35;           % in
        tensionAllow = 40.0;       % ksi
        compressionAllow = [35.09, 11.59, 17.31, 35.09, 35.09, 6.76, 6.76, 11.08]; % ksi
        sectionCatalog = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, ...
                          0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, ...
                          1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, ...
                          2.5, 2.6, 2.8, 3.0, 3.2, 3.4]; % in^2
    end

    methods
        function obj = TwentyFiveBarSpaceTruss()
            % Constructor retained for a uniform benchmark interface.
        end

        function bounds = getBounds(obj)
            bounds.lb = ones(1, obj.nVar);
            bounds.ub = numel(obj.sectionCatalog) * ones(1, obj.nVar);
        end

        function x = projectDecision(obj, x)
            validateattributes(x, {'numeric'}, {'real', 'finite', 'vector', 'numel', obj.nVar}, ...
                mfilename, 'x');
            bounds = obj.getBounds();
            x = round(reshape(x, 1, []));
            x = max(bounds.lb, min(bounds.ub, x));
        end

        function [f, g, info] = evaluate(obj, x)
            x = obj.projectDecision(x);
            groupAreas = obj.sectionCatalog(x);
            [nodes, elements, groupMap, loads, fixedNodes] = obj.definition();
            memberAreas = groupAreas(groupMap);

            nNodes = size(nodes, 1);
            nDOF = 3 * nNodes;
            nLoad = size(loads, 2);
            K = zeros(nDOF, nDOF);
            lengths = zeros(obj.nBar, 1);
            direction = zeros(obj.nBar, 3);

            for i = 1:obj.nBar
                n1 = elements(i, 1);
                n2 = elements(i, 2);
                delta = nodes(n2, :) - nodes(n1, :);
                lengths(i) = norm(delta);
                direction(i, :) = delta / lengths(i);
                n = direction(i, :);
                k3 = (obj.E * memberAreas(i) / lengths(i)) * (n' * n);
                ke = [k3, -k3; -k3, k3];
                dof = [3*n1-2:3*n1, 3*n2-2:3*n2];
                K(dof, dof) = K(dof, dof) + ke;
            end

            fixedDOFs = [];
            for node = fixedNodes
                fixedDOFs = [fixedDOFs, 3*node-2:3*node]; %#ok<AGROW>
            end
            freeDOFs = setdiff(1:nDOF, fixedDOFs);
            Kff = K(freeDOFs, freeDOFs);
            conditionEstimate = rcond(Kff);

            U = zeros(nDOF, nLoad);
            stress = zeros(obj.nBar, nLoad);
            singularityPenalty = 0;
            if ~isfinite(conditionEstimate) || conditionEstimate < 1e-12
                singularityPenalty = 50;
            else
                try
                    Ufree = Kff \ loads(freeDOFs, :);
                    residual = norm(Kff * Ufree - loads(freeDOFs, :), 'fro') / ...
                               max(norm(loads(freeDOFs, :), 'fro'), eps);
                    if any(~isfinite(Ufree(:))) || ~isfinite(residual) || residual > 1e-8
                        singularityPenalty = 50;
                    else
                        U(freeDOFs, :) = Ufree;
                    end
                catch
                    singularityPenalty = 50;
                end
            end

            if singularityPenalty == 0
                for i = 1:obj.nBar
                    n1 = elements(i, 1);
                    n2 = elements(i, 2);
                    du = U(3*n2-2:3*n2, :) - U(3*n1-2:3*n1, :);
                    stress(i, :) = (obj.E / lengths(i)) * direction(i, :) * du;
                end
            end

            stressRatio = zeros(size(stress));
            for i = 1:obj.nBar
                for lc = 1:nLoad
                    if stress(i, lc) >= 0
                        stressRatio(i, lc) = stress(i, lc) / obj.tensionAllow;
                    else
                        stressRatio(i, lc) = abs(stress(i, lc)) / obj.compressionAllow(groupMap(i));
                    end
                end
            end

            stressExcess = max(0, stressRatio - 1);
            displacementRatio = abs(U(freeDOFs, :)) / obj.deltaMax;
            displacementExcess = max(0, displacementRatio - 1);
            g = sum(stressExcess(:)) + sum(displacementExcess(:)) + singularityPenalty;
            f = obj.rho * sum(memberAreas(:) .* lengths);

            info.benchmarkId = '25-bar';
            info.decisionIndices = x;
            info.groupAreas = groupAreas;
            info.memberAreas = memberAreas;
            info.groupMap = groupMap;
            info.nodes = nodes;
            info.elements = elements;
            info.lengths = lengths;
            info.loads = loads;
            info.fixedNodes = fixedNodes;
            info.displacement = U;
            info.stress = stress;
            info.stressRatio = stressRatio;
            info.maxStressRatio = max(stressRatio(:));
            info.maxDisp = max(abs(U(:)));
            info.maxDisplacementRatio = info.maxDisp / obj.deltaMax;
            info.conditionEstimate = conditionEstimate;
            info.isStable = singularityPenalty == 0;
            info.isFeasible = info.isStable && g < 1e-8;
            info.nLoadCases = nLoad;
        end

        function [nodes, elements, groupMap, loads, fixedNodes] = definition(obj) %#ok<MANU>
            nodes = [-37.5,    0.0, 200.0;
                      37.5,    0.0, 200.0;
                     -37.5,   37.5, 100.0;
                      37.5,   37.5, 100.0;
                      37.5,  -37.5, 100.0;
                     -37.5,  -37.5, 100.0;
                    -100.0,  100.0,   0.0;
                     100.0,  100.0,   0.0;
                     100.0, -100.0,   0.0;
                    -100.0, -100.0,   0.0];

            elements = [1, 2;
                        1, 4; 2, 3; 1, 5; 2, 6;
                        2, 5; 2, 4; 1, 6; 1, 3;
                        3, 6; 4, 5;
                        3, 4; 5, 6;
                        3,10; 6, 7; 4, 9; 5, 8;
                        3, 8; 4, 7; 6, 9; 5,10;
                        3, 7; 4, 8; 5, 9; 6,10];

            groupMap = [1; 2;2;2;2; 3;3;3;3; 4;4; 5;5; ...
                        6;6;6;6; 7;7;7;7; 8;8;8;8];

            loads = zeros(30, 2);
            % Load case 1: opposing lateral loads and downward gravity.
            loads(1:3, 1) = [0; 20; -5];
            loads(4:6, 1) = [0; -20; -5];
            % Load case 2: combined x/y lateral action and gravity.
            loads(1:3, 2) = [1; 10; -5];
            loads(4:6, 2) = [0; 10; -5];
            fixedNodes = 7:10;
        end
    end
end
