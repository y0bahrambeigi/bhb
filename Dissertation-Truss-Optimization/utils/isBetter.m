function tf = isBetter(A, B, opts)
%ISBETTER Feasibility-first comparison for constrained structural optimization.
%
%   tf = isBetter(A, B)
%   tf = isBetter(A, B, opts)
%
% REQUIRED FIELDS
%   A.W, B.W              : structural weights/objective values
%   A.cv, B.cv            : outputs of constraintViolation()
%      OR
%   A.CV, B.CV            : same, uppercase alias supported
%
% DECISION RULE
%   1) Feasible solution dominates infeasible solution.
%   2) If both are feasible, lower structural weight is better.
%   3) If both are infeasible:
%        lower Vp   is better;
%        tie -> lower Vinf;
%        tie -> lower weight.
%   4) Exact/numerical ties keep the incumbent B (tf = false).
%
% OPTIONAL
%   opts.compareTol : relative comparison tolerance (default = 1e-12)

    if nargin < 3 || isempty(opts)
        opts = struct();
    end

    tol = getOption(opts, 'compareTol', 1e-12);

    if ~(isscalar(tol) && isfinite(tol) && tol >= 0)
        error('isBetter:InvalidTolerance', ...
              'opts.compareTol must be a finite nonnegative scalar.');
    end

    validateSolution(A, 'A');
    validateSolution(B, 'B');

    cvA = getCV(A);
    cvB = getCV(B);

    if cvA.feasible && ~cvB.feasible
        tf = true; return;
    elseif ~cvA.feasible && cvB.feasible
        tf = false; return;
    end

    if cvA.feasible && cvB.feasible
        tf = strictlyLess(A.W, B.W, tol);
        return;
    end

    if strictlyLess(cvA.Vp, cvB.Vp, tol)
        tf = true; return;
    elseif strictlyLess(cvB.Vp, cvA.Vp, tol)
        tf = false; return;
    end

    if strictlyLess(cvA.Vinf, cvB.Vinf, tol)
        tf = true; return;
    elseif strictlyLess(cvB.Vinf, cvA.Vinf, tol)
        tf = false; return;
    end

    tf = strictlyLess(A.W, B.W, tol);
end

function cv = getCV(S)
    if isfield(S, 'cv'), cv = S.cv; else, cv = S.CV; end
end

function validateSolution(S, label)
    if ~isstruct(S) || ~isfield(S, 'W') || ~isscalar(S.W) || ~isfinite(S.W)
        error('isBetter:InvalidSolution', '%s.W must be a finite scalar.', label);
    end

    if ~(isfield(S, 'cv') || isfield(S, 'CV'))
        error('isBetter:MissingCV', ...
              '%s must contain .cv or .CV from constraintViolation().', label);
    end

    cv = getCV(S);
    required = {'feasible','Vp','Vinf'};
    for i = 1:numel(required)
        if ~isfield(cv, required{i})
            error('isBetter:InvalidCV', ...
                  '%s constraint record is missing field "%s".', label, required{i});
        end
    end
end

function tf = strictlyLess(a, b, tol)
    scale = max([1, abs(a), abs(b)]);
    tf = a < (b - tol*scale);
end

function value = getOption(s, name, defaultValue)
    if isfield(s, name) && ~isempty(s.(name))
        value = s.(name);
    else
        value = defaultValue;
    end
end
