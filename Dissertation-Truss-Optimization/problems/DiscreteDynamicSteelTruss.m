classdef DiscreteDynamicSteelTruss
    %DiscreteDynamicSteelTruss Combined static/dynamic discrete steel-truss extension.
    % Keeps the source-locked 72-/120-bar geometries separate from the
    % canonical continuous benchmarks. Decisions are catalog indices.
    %
    % Dynamic formulation:
    %   (K - omega^2 M) phi = 0
    % with a consistent translational element mass matrix and published
    % non-structural lumped masses. Static stress/displacement constraints
    % are evaluated simultaneously with minimum-frequency constraints.

    properties
        benchmarkId
        nBar
        nVar
        decisionType = 'discrete'
        E
        rhoWeight
        gAccel = 386.088582677165  % in/s^2
        deltaMax
        stressAllow
        yieldStress
        sectionCatalog
        frequencyModeIndices
        frequencyMinimumHz
        addedMassKg
        baseProblem
    end

    methods
        function obj = DiscreteDynamicSteelTruss(benchmarkId)
            if nargin < 1, benchmarkId = '72-bar'; end
            benchmarkId = lower(strtrim(benchmarkId));

            switch benchmarkId
                case {'72-bar','72'}
                    obj.benchmarkId = '72-bar-steel-dynamic-discrete';
                    obj.baseProblem = SeventyTwoBarSpaceTruss();
                    obj.nBar = 72;
                    obj.nVar = 16;
                    obj.E = 29.0e6;          % psi, structural steel extension
                    obj.rhoWeight = 0.2836;  % lb/in^3
                    obj.deltaMax = 0.25;     % in
                    obj.stressAllow = 25000; % psi
                    obj.yieldStress = NaN;
                    obj.sectionCatalog = 0.1:0.1:3.0; % controlled area catalog, in^2
                    obj.frequencyModeIndices = [1 2 3];
                    obj.frequencyMinimumHz = [4 4 6];
                    obj.addedMassKg = zeros(20,1);
                    % Source dynamic benchmark labels the four top nodes 1:4.
                    % In this repository's bottom-up node numbering they are 17:20.
                    obj.addedMassKg(17:20) = 2270;

                case {'120-bar','120'}
                    obj.benchmarkId = '120-bar-steel-dynamic-discrete';
                    obj.baseProblem = OneHundredTwentyBarDomeTruss();
                    obj.nBar = 120;
                    obj.nVar = 7;
                    obj.E = obj.baseProblem.E;
                    obj.rhoWeight = obj.baseProblem.rho;
                    obj.deltaMax = obj.baseProblem.deltaMax;
                    obj.stressAllow = NaN;
                    obj.yieldStress = obj.baseProblem.yieldStress;
                    % Frequency-benchmark bounds are 1.0 to 129.3 cm^2.
                    % Use a controlled 1 cm^2 discrete grid plus the exact upper bound.
                    obj.sectionCatalog = unique([1:129,129.3] / 6.4516); % in^2
                    obj.frequencyModeIndices = [1 2];
                    obj.frequencyMinimumHz = [9 11];
                    obj.addedMassKg = zeros(49,1);
                    obj.addedMassKg(1) = 3000;
                    obj.addedMassKg(2:13) = 500;
                    obj.addedMassKg(14:37) = 100;

                otherwise
                    error('DiscreteDynamicSteelTruss:UnknownBenchmark', ...
                        'Supported benchmark IDs are 72-bar and 120-bar.');
            end
        end

        function bounds = getBounds(obj)
            bounds.lb = ones(1,obj.nVar);
            bounds.ub = numel(obj.sectionCatalog) * ones(1,obj.nVar);
        end

        function x = projectDecision(obj,x)
            validateattributes(x, {'numeric'}, ...
                {'real','finite','vector','numel',obj.nVar}, mfilename, 'x');
            bounds = obj.getBounds();
            % floor(x+0.5) makes half-integer projection deterministic in
            % MATLAB and GNU Octave.
            x = floor(reshape(x,1,[]) + 0.5);
            x = max(bounds.lb, min(bounds.ub, x));
        end

        function [f,g,info] = evaluate(obj,x)
            x = obj.projectDecision(x);
            groupAreas = obj.sectionCatalog(x);
            [nodes,elements,groupMap,loads,fixedNodes,controlNodes] = obj.definition();
            memberAreas = reshape(groupAreas(groupMap),[],1);

            [U,stress,lengths,Kff,Mff,conditionEstimate,penalty,freeDOFs] = ...
                obj.solveStaticAndAssembleModal(nodes,elements,memberAreas,loads,fixedNodes);

            [naturalFrequenciesHz,modalPenalty] = obj.solveFrequencies(Kff,Mff);
            penalty = penalty + modalPenalty;

            if strcmp(obj.benchmarkId,'72-bar-steel-dynamic-discrete')
                stressRatio = abs(stress) / obj.stressAllow;
                controlDOFs = reshape([3*controlNodes-2;3*controlNodes-1;3*controlNodes],1,[]);
                displacementRatio = abs(U(controlDOFs,:)) / obj.deltaMax;
            else
                radius = 0.4993 * memberAreas.^0.6777;
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
                stressRatio = zeros(size(stress));
                compression = stress < 0;
                compressionAllowMatrix = repmat(compressionAllow,1,size(stress,2));
                stressRatio(compression) = abs(stress(compression)) ./ ...
                    compressionAllowMatrix(compression);
                stressRatio(~compression) = abs(stress(~compression)) / tensionAllow;
                displacementRatio = abs(U(freeDOFs,:)) / obj.deltaMax;
            end

            staticViolation = sum(max(0,stressRatio(:)-1)) + ...
                sum(max(0,displacementRatio(:)-1));

            constrainedFrequencies = naturalFrequenciesHz(obj.frequencyModeIndices);
            frequencyRatios = obj.frequencyMinimumHz ./ constrainedFrequencies;
            frequencyViolation = sum(max(0,frequencyRatios - 1));
            g = staticViolation + frequencyViolation + penalty;
            f = obj.rhoWeight * sum(memberAreas .* lengths);

            info.benchmarkId = obj.benchmarkId;
            info.decisionIndices = x;
            info.groupAreas = groupAreas;
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
            info.maxDisp = max(abs(U(:)));
            info.maxDisplacementRatio = max(displacementRatio(:));
            info.naturalFrequenciesHz = naturalFrequenciesHz;
            info.frequencyModeIndices = obj.frequencyModeIndices;
            info.frequencyMinimumHz = obj.frequencyMinimumHz;
            info.frequencyRatios = frequencyRatios;
            info.staticViolation = staticViolation;
            info.frequencyViolation = frequencyViolation;
            info.conditionEstimate = conditionEstimate;
            info.isStable = penalty == 0;
            info.isFeasible = info.isStable && g < 1e-8;
            info.nLoadCases = size(loads,2);
            info.modalAnalysisPerformed = true;
            info.massModel = 'consistent-translational-plus-lumped';
            info.material = 'steel';
            if strcmp(obj.benchmarkId,'120-bar-steel-dynamic-discrete')
                info.geometryVariant = 'frequency-benchmark-120bar-585cm-inner-ring';
            else
                info.geometryVariant = '72bar-steel-extension';
            end
        end
    end

    methods (Access = private)
        function [nodes,elements,groupMap,loads,fixedNodes,controlNodes] = definition(obj)
            if strcmp(obj.benchmarkId,'72-bar-steel-dynamic-discrete')
                [nodes,elements,groupMap,loads,fixedNodes,controlNodes] = ...
                    obj.baseProblem.definition();
            else
                [nodes,elements,groupMap,loads,fixedNodes] = obj.baseProblem.definition();
                % The canonical frequency-constrained 120-bar dome uses a
                % 585 cm (230.31 in) elevation for nodes 2:13. The static
                % sizing benchmark stored in OneHundredTwentyBarDomeTruss
                % uses a different intermediate-ring elevation, so the
                % dynamic extension must override it explicitly.
                nodes(2:13,3) = 230.31;
                controlNodes = [];
            end
        end

        function [U,stress,lengths,Kff,Mff,conditionEstimate,penalty,freeDOFs] = ...
                solveStaticAndAssembleModal(obj,nodes,elements,areas,loads,fixedNodes)
            nDOF = 3*size(nodes,1);
            nLoad = size(loads,2);
            K = zeros(nDOF);
            M = zeros(nDOF);
            lengths = zeros(obj.nBar,1);
            direction = zeros(obj.nBar,3);
            I3 = eye(3);

            for i = 1:obj.nBar
                n1 = elements(i,1); n2 = elements(i,2);
                delta = nodes(n2,:) - nodes(n1,:);
                lengths(i) = norm(delta);
                direction(i,:) = delta / lengths(i);
                n = direction(i,:);
                k3 = obj.E * areas(i) / lengths(i) * (n' * n);
                dof = [3*n1-2:3*n1,3*n2-2:3*n2];
                K(dof,dof) = K(dof,dof) + [k3,-k3;-k3,k3];

                % rhoWeight is weight density. Divide by g to obtain the
                % inertial mass compatible with lbf/in stiffness units.
                elementMass = obj.rhoWeight * areas(i) * lengths(i) / obj.gAccel;
                Me = (elementMass/6) * [2*I3,I3;I3,2*I3];
                M(dof,dof) = M(dof,dof) + Me;
            end

            kgToLbm = 2.20462262184878;
            for node = 1:numel(obj.addedMassKg)
                if obj.addedMassKg(node) <= 0, continue; end
                dynamicMass = obj.addedMassKg(node) * kgToLbm / obj.gAccel;
                dof = 3*node-2:3*node;
                M(dof,dof) = M(dof,dof) + dynamicMass * I3;
            end

            fixedDOFs = reshape([3*fixedNodes-2;3*fixedNodes-1;3*fixedNodes],1,[]);
            freeDOFs = setdiff(1:nDOF,fixedDOFs);
            Kff = K(freeDOFs,freeDOFs);
            Mff = M(freeDOFs,freeDOFs);
            conditionEstimate = rcond(Kff);

            U = zeros(nDOF,nLoad);
            stress = zeros(obj.nBar,nLoad);
            penalty = 0;
            if ~isfinite(conditionEstimate) || conditionEstimate < 1e-12
                penalty = 50;
                return;
            end

            try
                Ufree = Kff \ loads(freeDOFs,:);
                residual = norm(Kff*Ufree-loads(freeDOFs,:),'fro') / ...
                    max(norm(loads(freeDOFs,:),'fro'),eps);
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

        function [freqHz,penalty] = solveFrequencies(obj,Kff,Mff)
            penalty = 0;
            nNeeded = max(obj.frequencyModeIndices);
            freqHz = inf(1,nNeeded);

            if isempty(Kff) || isempty(Mff) || any(~isfinite(Kff(:))) || ...
                    any(~isfinite(Mff(:))) || rcond(Mff) < 1e-14
                penalty = 50;
                return;
            end

            try
                lambda = [];
                if size(Kff,1) > max(20,2*nNeeded)
                    try
                        [~,D] = eigs(Kff,Mff,nNeeded,'sm');
                        lambda = real(diag(D));
                    catch
                        lambda = real(eig(Kff,Mff));
                    end
                else
                    lambda = real(eig(Kff,Mff));
                end
                lambda = sort(lambda(isfinite(lambda) & lambda > 1e-10));
                if numel(lambda) < nNeeded
                    penalty = 50;
                    return;
                end
                freqHz = reshape(sqrt(lambda(1:nNeeded))/(2*pi),1,[]);
                if any(~isfinite(freqHz)) || any(freqHz <= 0)
                    penalty = 50;
                end
            catch
                penalty = 50;
            end
        end
    end
end
