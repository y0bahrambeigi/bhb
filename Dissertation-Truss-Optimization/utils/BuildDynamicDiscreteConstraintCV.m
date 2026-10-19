function [cv, g] = BuildDynamicDiscreteConstraintCV(problem, info, opts)
%BUILDDYNAMICDISCRETECONSTRAINTCV Build normalized constraint families from
% DiscreteDynamicSteelTruss.evaluate() output for feasibility-first ranking.
%
% The original problem.evaluate returns:
%   f : structural weight
%   g : legacy scalar sum of violations + failure penalty
%   info : detailed static/modal response
%
% This adapter reconstructs normalized constraint families WITHOUT using the
% legacy scalar penalty in the optimizer ranking.
%
% Families:
%   stress : stressRatio - 1
%   disp   : displacementRatio - 1, reconstructed from stored U
%   freq   : frequencyRatios - 1
%
% For the 120-bar model, the published repository stressRatio already uses
% the AISC-ASD compression allowable based on member slenderness, so that
% compressive stability is retained within the stress-family constraints.
%
% If static/modal analysis is unstable, a large failure violation is appended
% to the stress family so the solution is strongly infeasible.

    if nargin < 3 || isempty(opts), opts = struct(); end
    failureViolation = getOption(opts, 'failureViolation', 1e6);

    g = struct();
    g.stress = info.stressRatio(:) - 1;

    U = info.displacement;
    if contains(lower(info.benchmarkId), '72-bar')
        controlNodes = info.controlNodes;
        controlDOFs = reshape([3*controlNodes-2; 3*controlNodes-1; 3*controlNodes], 1, []);
        displacementRatio = abs(U(controlDOFs,:)) / problem.deltaMax;
    else
        nDOF = size(U,1);
        fixedNodes = info.fixedNodes;
        fixedDOFs = reshape([3*fixedNodes-2; 3*fixedNodes-1; 3*fixedNodes], 1, []);
        freeDOFs = setdiff(1:nDOF, fixedDOFs);
        displacementRatio = abs(U(freeDOFs,:)) / problem.deltaMax;
    end
    g.disp = displacementRatio(:) - 1;

    % Compression/slenderness effects in the 120-bar model are already
    % embedded in info.stressRatio through the allowable compressive stress.
    g.buckling = [];

    g.freq = info.frequencyRatios(:) - 1;

    if ~info.isStable
        g.stress(end+1,1) = failureViolation;
    end

    cv = constraintViolation(g, opts);
end

function value = getOption(s, name, defaultValue)
    if isfield(s, name) && ~isempty(s.(name))
        value = s.(name);
    else
        value = defaultValue;
    end
end
