classdef SeventyTwoBarSpaceTruss
    %SeventyTwoBarSpaceTruss Camp-Farshchin continuous 72-bar benchmark.
    % Sixteen grouped areas are bounded by 0.1 and 3.0 in^2. Two load
    % cases, a 25 ksi stress limit, and top-storey displacement limits are
    % evaluated with a three-dimensional direct-stiffness analysis.

    properties
        nBar = 72;
        nVar = 16;
        decisionType = 'continuous';
        E = 1e7;             % psi
        rho = 0.1;           % lb/in^3
        stressAllow = 25000; % psi
        deltaMax = 0.25;     % in, nodes 17:20 only
    end

    methods
        function bounds = getBounds(obj)
            bounds.lb = 0.1 * ones(1, obj.nVar);
            bounds.ub = 3.0 * ones(1, obj.nVar);
        end

        function x = projectDecision(obj, x)
            validateattributes(x, {'numeric'}, ...
                {'real','finite','vector','numel',obj.nVar}, mfilename, 'x');
            bounds = obj.getBounds();
            x = reshape(x, 1, []);
            x = max(bounds.lb, min(bounds.ub, x));
        end

        function [f, g, info] = evaluate(obj, x)
            x = obj.projectDecision(x);
            [nodes, elements, groupMap, loads, fixedNodes, controlNodes] = obj.definition();
            memberAreas = reshape(x(groupMap), [], 1);
            [U, stress, lengths, conditionEstimate, singularityPenalty] = ...
                obj.solve(nodes, elements, memberAreas, loads, fixedNodes);

            stressRatio = abs(stress) / obj.stressAllow;
            controlDOFs = reshape([3*controlNodes-2; 3*controlNodes-1; 3*controlNodes], 1, []);
            displacementRatio = abs(U(controlDOFs, :)) / obj.deltaMax;
            g = sum(max(0, stressRatio(:) - 1)) + ...
                sum(max(0, displacementRatio(:) - 1)) + singularityPenalty;
            f = obj.rho * sum(memberAreas(:) .* lengths);

            info.benchmarkId = '72-bar';
            info.groupAreas = x;
            info.memberAreas = memberAreas;
            info.groupMap = groupMap;
            info.nodes = nodes;
            info.elements = elements;
            info.lengths = lengths;
            info.loads = loads;
            info.fixedNodes = fixedNodes;
            info.controlNodes = controlNodes;
            info.displacement = U;
            info.stress = stress;
            info.stressRatio = stressRatio;
            info.maxStressRatio = max(stressRatio(:));
            info.maxDisp = max(max(abs(U(controlDOFs, :))));
            info.maxDisplacementRatio = max(displacementRatio(:));
            info.conditionEstimate = conditionEstimate;
            info.isStable = singularityPenalty == 0;
            info.isFeasible = info.isStable && g < 1e-8;
            info.nLoadCases = size(loads, 2);
        end

        function [nodes, elements, groupMap, loads, fixedNodes, controlNodes] = definition(obj) %#ok<MANU>
            base = [0,0,0; 120,0,0; 120,120,0; 0,120,0];
            nodes = zeros(20, 3);
            for storey = 0:4
                rows = 4*storey + (1:4);
                nodes(rows, :) = [base(:,1:2), 60*storey*ones(4,1)];
            end

            storeyElements = [1,5;2,6;3,7;4,8;1,6;2,5;2,7;3,6;3,8; ...
                4,7;4,5;1,8;5,6;6,7;7,8;8,5;5,7;6,8];
            elements = zeros(72, 2);
            for storey = 0:3
                rows = 18*storey + (1:18);
                elements(rows, :) = storeyElements + 4*storey;
            end

            groups = {1:4, 5:12, 13:16, 17:18, 19:22, 23:30, ...
                31:34, 35:36, 37:40, 41:48, 49:52, 53:54, ...
                55:58, 59:66, 67:70, 71:72};
            groupMap = zeros(obj.nBar, 1);
            for k = 1:numel(groups), groupMap(groups{k}) = k; end

            loads = zeros(60, 2);
            for node = 17:20
                loads(3*node, 1) = -5000;
            end
            loads(3*17-2:3*17, 2) = [5000; 5000; -5000];
            fixedNodes = 1:4;
            controlNodes = 17:20;
        end
    end

    methods (Access = private)
        function [U, stress, lengths, conditionEstimate, penalty] = ...
                solve(obj, nodes, elements, areas, loads, fixedNodes)
            nDOF = 3 * size(nodes, 1);
            K = zeros(nDOF);
            lengths = zeros(obj.nBar, 1);
            direction = zeros(obj.nBar, 3);
            for i = 1:obj.nBar
                n1 = elements(i,1); n2 = elements(i,2);
                delta = nodes(n2,:) - nodes(n1,:);
                lengths(i) = norm(delta);
                direction(i,:) = delta / lengths(i);
                n = direction(i,:);
                k3 = obj.E * areas(i) / lengths(i) * (n' * n);
                dof = [3*n1-2:3*n1, 3*n2-2:3*n2];
                K(dof,dof) = K(dof,dof) + [k3,-k3;-k3,k3];
            end
            fixedDOFs = reshape([3*fixedNodes-2;3*fixedNodes-1;3*fixedNodes],1,[]);
            freeDOFs = setdiff(1:nDOF, fixedDOFs);
            Kff = K(freeDOFs,freeDOFs);
            conditionEstimate = rcond(Kff);
            U = zeros(nDOF, size(loads,2));
            stress = zeros(obj.nBar, size(loads,2));
            penalty = 0;
            if ~isfinite(conditionEstimate) || conditionEstimate < 1e-12
                penalty = 50;
                return;
            end
            try
                Ufree = Kff \ loads(freeDOFs,:);
                residual = norm(Kff*Ufree-loads(freeDOFs,:),'fro') / ...
                    max(norm(loads(freeDOFs,:),'fro'), eps);
                if any(~isfinite(Ufree(:))) || ~isfinite(residual) || residual > 1e-8
                    penalty = 50;
                    return;
                end
                U(freeDOFs,:) = Ufree;
            catch
                penalty = 50;
                return;
            end
            for i = 1:obj.nBar
                n1 = elements(i,1); n2 = elements(i,2);
                du = U(3*n2-2:3*n2,:) - U(3*n1-2:3*n1,:);
                stress(i,:) = obj.E / lengths(i) * direction(i,:) * du;
            end
        end
    end
end
