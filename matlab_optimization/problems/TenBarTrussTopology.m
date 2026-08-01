classdef TenBarTrussTopology
    % TenBarTrussTopology - Size + topology optimization for the 10-bar truss
    % Decision vector x = [A1..A10, z1..z10]
    %   Ai: bar area (in^2)
    %   zi: topology variable in [0,1], mapped to active/inactive bars.

    properties
        nBar = 10;
        nVar = 20;
        areaLb = 0.1;
        areaUb = 35.0;
        topoLb = 0.0;
        topoUb = 1.0;
        E = 10000;
        rho = 0.1;
        P = 100;
        L = 360;
        sigmaMax = 25;
        deltaMax = 2;
        minAreaActive = 0.1;
    end

    methods
        function obj = TenBarTrussTopology()
            % Constructor
        end

        function [f, g, info] = evaluate(obj, x)
            if size(x, 1) > 1
                x = x';
            end

            Araw = x(1:obj.nBar);
            zRaw = x(obj.nBar + 1:end);

            z = zRaw >= 0.5;
            A = Araw;
            A(~z) = 1e-6;            % Near-void members for topology removal
            A(z) = max(A(z), obj.minAreaActive);

            nodes = [obj.L*2, 0;
                     obj.L, 0;
                     0, 0;
                     obj.L*2, obj.L;
                     obj.L, obj.L;
                     0, obj.L];

            elements = [3, 5;
                        1, 3;
                        4, 6;
                        2, 4;
                        3, 4;
                        1, 2;
                        4, 5;
                        3, 6;
                        2, 3;
                        1, 4];

            nElem = size(elements, 1);
            elemLength = zeros(nElem, 1);
            c = zeros(nElem, 1);
            s = zeros(nElem, 1);

            for i = 1:nElem
                n1 = elements(i, 1);
                n2 = elements(i, 2);
                dx = nodes(n2, 1) - nodes(n1, 1);
                dy = nodes(n2, 2) - nodes(n1, 2);
                elemLength(i) = sqrt(dx^2 + dy^2);
                c(i) = dx / elemLength(i);
                s(i) = dy / elemLength(i);
            end

            f = sum(obj.rho * A' .* elemLength);

            nNodes = size(nodes, 1);
            nDOF = 2 * nNodes;
            K = zeros(nDOF, nDOF);

            for i = 1:nElem
                n1 = elements(i, 1);
                n2 = elements(i, 2);

                k = (obj.E * A(i)) / elemLength(i);
                c2 = c(i)^2;
                s2 = s(i)^2;
                cs = c(i) * s(i);

                ke = k * [c2,  cs, -c2, -cs;
                          cs,  s2, -cs, -s2;
                         -c2, -cs,  c2,  cs;
                         -cs, -s2,  cs,  s2];

                dof = [2*n1-1, 2*n1, 2*n2-1, 2*n2];
                K(dof, dof) = K(dof, dof) + ke;
            end

            F = zeros(nDOF, 1);
            F(4) = -obj.P;
            F(8) = -obj.P;

            fixedDOFs = [9, 10, 11, 12];
            freeDOFs = setdiff(1:nDOF, fixedDOFs);

            U = zeros(nDOF, 1);
            singularityPenalty = 0;
            Kff = K(freeDOFs, freeDOFs);
            Ff = F(freeDOFs);
            conditionEstimate = rcond(Kff);

            if ~isfinite(conditionEstimate) || conditionEstimate < 1e-12
                singularityPenalty = 50;
            else
                try
                    Ufree = Kff \ Ff;
                    relativeResidual = norm(Kff * Ufree - Ff) / max(norm(Ff), eps);
                    if any(~isfinite(Ufree)) || ~isfinite(relativeResidual) || relativeResidual > 1e-8
                        singularityPenalty = 50;
                    else
                        U(freeDOFs) = Ufree;
                    end
                catch
                    singularityPenalty = 50;
                end
            end

            sigma = zeros(nElem, 1);
            if singularityPenalty == 0
                for i = 1:nElem
                    n1 = elements(i, 1);
                    n2 = elements(i, 2);
                    dof = [2*n1-1, 2*n1, 2*n2-1, 2*n2];

                    B = (obj.E / elemLength(i)) * [-c(i), -s(i), c(i), s(i)];
                    sigma(i) = B * U(dof);
                end
            else
                sigma(:) = 1e3;
                U(:) = 1e3;
            end

            gStress = zeros(nElem, 1);
            gStress(z) = max(0, abs(sigma(z)) / obj.sigmaMax - 1);
            maxDisp = max(abs(U));
            gDisp = max(0, maxDisp / obj.deltaMax - 1);

            % Encourage practical topologies: keep at least 6 active bars
            nActive = sum(z);
            gActive = max(0, (6 - nActive) / 6);

            g = sum(gStress) + gDisp + gActive + singularityPenalty;

            info.activeBars = z;
            info.nActive = nActive;
            info.maxDisp = maxDisp;
            if any(z)
                info.maxStress = max(abs(sigma(z)));
            else
                info.maxStress = 0;
            end
            info.area = A;
        end

        function bounds = getBounds(obj)
            bounds.lb = [obj.areaLb * ones(1, obj.nBar), obj.topoLb * ones(1, obj.nBar)];
            bounds.ub = [obj.areaUb * ones(1, obj.nBar), obj.topoUb * ones(1, obj.nBar)];
        end
    end
end
