classdef OneHundredTwentyBarDomeTruss
    %OneHundredTwentyBarDomeTruss Standard seven-group spatial dome.
    % Uses the 49-node/120-member geometry, layer loads, and AISC ASD
    % member allowables reported for the canonical sizing benchmark.

    properties
        nBar = 120;
        nVar = 7;
        decisionType = 'continuous';
        E = 30450000;       % psi
        rho = 0.288;        % lb/in^3
        yieldStress = 58000;% psi
        deltaMax = 0.1969;  % in
    end

    methods
        function bounds = getBounds(obj)
            bounds.lb = 0.775 * ones(1, obj.nVar);
            bounds.ub = 20.0 * ones(1, obj.nVar);
        end

        function x = projectDecision(obj, x)
            validateattributes(x, {'numeric'}, ...
                {'real','finite','vector','numel',obj.nVar}, mfilename, 'x');
            bounds = obj.getBounds();
            x = reshape(x,1,[]);
            x = max(bounds.lb, min(bounds.ub, x));
        end

        function [f, g, info] = evaluate(obj, x)
            x = obj.projectDecision(x);
            [nodes, elements, groupMap, loads, fixedNodes] = obj.definition();
            areas = reshape(x(groupMap), [], 1);
            [U, stress, lengths, conditionEstimate, penalty] = ...
                obj.solve(nodes, elements, areas, loads, fixedNodes);

            radius = 0.4993 * areas.^0.6777;
            slenderness = lengths ./ radius;
            Cc = sqrt(2*pi^2*obj.E/obj.yieldStress);
            compressionAllow = zeros(obj.nBar,1);
            inelastic = slenderness < Cc;
            lam = slenderness(inelastic);
            compressionAllow(inelastic) = ...
                (1-lam.^2/(2*Cc^2))*obj.yieldStress ./ ...
                (5/3 + 3*lam/(8*Cc) - lam.^3/(8*Cc^3));
            elastic = ~inelastic;
            compressionAllow(elastic) = 12*pi^2*obj.E ./ ...
                (23*slenderness(elastic).^2);
            tensionAllow = 0.6 * obj.yieldStress;
            stressRatio = zeros(obj.nBar,1);
            compression = stress < 0;
            stressRatio(compression) = abs(stress(compression)) ./ compressionAllow(compression);
            stressRatio(~compression) = abs(stress(~compression)) / tensionAllow;
            displacementRatio = abs(U) / obj.deltaMax;
            g = sum(max(0,stressRatio-1)) + ...
                sum(max(0,displacementRatio(:)-1)) + penalty;
            f = obj.rho * sum(areas .* lengths);

            info.benchmarkId = '120-bar';
            info.groupAreas = x;
            info.memberAreas = areas;
            info.groupMap = groupMap;
            info.nodes = nodes;
            info.elements = elements;
            info.lengths = lengths;
            info.loads = loads;
            info.fixedNodes = fixedNodes;
            info.displacement = U;
            info.stress = stress;
            info.compressionAllow = compressionAllow;
            info.stressRatio = stressRatio;
            info.maxStressRatio = max(stressRatio);
            info.maxDisp = max(abs(U));
            info.maxDisplacementRatio = max(displacementRatio);
            info.conditionEstimate = conditionEstimate;
            info.isStable = penalty == 0;
            info.isFeasible = info.isStable && g < 1e-8;
            info.nLoadCases = 1;
        end

        function [nodes, elements, groupMap, loads, fixedNodes] = definition(obj) %#ok<MANU>
            nodes = [0 0 275.59; 273.26 0 196.85; 236.6501 136.63 196.85; ...
                136.63 236.6501 196.85; 0 273.26 196.85; -136.63 236.6501 196.85; ...
                -236.6501 136.63 196.85; -273.26 0 196.85; -236.6501 -136.63 196.85; ...
                -136.63 -236.6501 196.85; 0 -273.26 196.85; 136.63 -236.6501 196.85; ...
                236.6501 -136.63 196.85; 492.12 0 118.11; 475.3514 127.37 118.11; ...
                426.1884 246.06 118.11; 347.9814 347.9814 118.11; 246.06 426.1884 118.11; ...
                127.37 475.3514 118.11; 0 492.12 118.11; -127.37 475.3514 118.11; ...
                -246.06 426.1884 118.11; -347.9814 347.9814 118.11; -426.1884 246.06 118.11; ...
                -475.3514 127.37 118.11; -492.12 0 118.11; -475.3514 -127.37 118.11; ...
                -426.1884 -246.06 118.11; -347.9814 -347.9814 118.11; -246.06 -426.1884 118.11; ...
                -127.37 -475.3514 118.11; 0 -492.12 118.11; 127.37 -475.3514 118.11; ...
                246.06 -426.1884 118.11; 347.9814 -347.9814 118.11; 426.1884 -246.06 118.11; ...
                475.3514 -127.37 118.11; 625.59 0 0; 541.7768 312.795 0; ...
                312.795 541.7768 0; 0 625.59 0; -312.795 541.7768 0; ...
                -541.7768 312.795 0; -625.59 0 0; -541.7768 -312.795 0; ...
                -312.795 -541.7768 0; 0 -625.59 0; 312.795 -541.7768 0; ...
                541.7768 -312.795 0];

            elements = [1 2;1 3;1 4;1 5;1 6;1 7;1 8;1 9;1 10;1 11;1 12;1 13; ...
                2 3;3 4;4 5;5 6;6 7;7 8;8 9;9 10;10 11;11 12;12 13;13 2; ...
                2 14;3 16;4 18;5 20;6 22;7 24;8 26;9 28;10 30;11 32;12 34;13 36; ...
                2 15;3 15;3 17;4 17;4 19;5 19;5 21;6 21;6 23;7 23;7 25;8 25; ...
                8 27;9 27;9 29;10 29;10 31;11 31;11 33;12 33;12 35;13 35;13 37;2 37; ...
                14 15;15 16;16 17;17 18;18 19;19 20;20 21;21 22;22 23;23 24;24 25; ...
                25 26;26 27;27 28;28 29;29 30;30 31;31 32;32 33;33 34;34 35;35 36;36 37;37 14; ...
                14 38;16 39;18 40;20 41;22 42;24 43;26 44;28 45;30 46;32 47;34 48;36 49; ...
                15 38;15 39;17 39;17 40;19 40;19 41;21 41;21 42;23 42;23 43;25 43;25 44; ...
                27 44;27 45;29 45;29 46;31 46;31 47;33 47;33 48;35 48;35 49;37 49;37 38];
            groupMap = [ones(12,1);2*ones(12,1);3*ones(12,1); ...
                4*ones(24,1);5*ones(24,1);6*ones(12,1);7*ones(24,1)];
            loads = zeros(147,1);
            loads(3) = -13490;
            for node = 2:14, loads(3*node) = -6744; end
            for node = 15:37, loads(3*node) = -2248; end
            fixedNodes = 38:49;
        end
    end

    methods (Access = private)
        function [U, stress, lengths, conditionEstimate, penalty] = ...
                solve(obj, nodes, elements, areas, loads, fixedNodes)
            nDOF = 3*size(nodes,1);
            K = zeros(nDOF);
            lengths = zeros(obj.nBar,1);
            direction = zeros(obj.nBar,3);
            for i = 1:obj.nBar
                n1 = elements(i,1); n2 = elements(i,2);
                delta = nodes(n2,:) - nodes(n1,:);
                lengths(i) = norm(delta);
                direction(i,:) = delta/lengths(i);
                n = direction(i,:);
                k3 = obj.E*areas(i)/lengths(i)*(n'*n);
                dof = [3*n1-2:3*n1,3*n2-2:3*n2];
                K(dof,dof) = K(dof,dof) + [k3,-k3;-k3,k3];
            end
            fixedDOFs = reshape([3*fixedNodes-2;3*fixedNodes-1;3*fixedNodes],1,[]);
            freeDOFs = setdiff(1:nDOF,fixedDOFs);
            Kff = K(freeDOFs,freeDOFs);
            conditionEstimate = rcond(Kff);
            U = zeros(nDOF,1);
            stress = zeros(obj.nBar,1);
            penalty = 0;
            if ~isfinite(conditionEstimate) || conditionEstimate < 1e-12
                penalty = 50;
                return;
            end
            try
                Ufree = Kff \ loads(freeDOFs);
                residual = norm(Kff*Ufree-loads(freeDOFs)) / max(norm(loads(freeDOFs)),eps);
                if any(~isfinite(Ufree)) || ~isfinite(residual) || residual > 1e-8
                    penalty = 50;
                    return;
                end
                U(freeDOFs) = Ufree;
            catch
                penalty = 50;
                return;
            end
            for i = 1:obj.nBar
                n1 = elements(i,1); n2 = elements(i,2);
                du = U(3*n2-2:3*n2) - U(3*n1-2:3*n1);
                stress(i) = obj.E/lengths(i)*direction(i,:)*du;
            end
        end
    end
end
