function cv = constraintViolation(g, opts)
%CONSTRAINTVIOLATION Aggregate normalized inequality-constraint violations.
%
%   cv = constraintViolation(g)
%   cv = constraintViolation(g, opts)
%
% INPUT
%   g    Struct containing already-normalized inequality constraints in the
%        standard form g(x) <= 0. Supported fields:
%          g.stress    : stress constraints
%          g.disp      : displacement constraints
%          g.buckling  : buckling constraints
%          g.freq      : frequency constraints
%
%   opts (optional struct)
%          .p                 : p-norm exponent (default = 4)
%          .feasibilityTol    : feasibility tolerance (default = 1e-6)
%          .failureViolation  : violation assigned to NaN/Inf values
%                               (default = 1e6)
%          .weights           : struct with positive family weights:
%                               .stress, .disp, .buckling, .freq
%                               Active-family weights are normalized to sum 1.
%
% OUTPUT
%   cv.feasible        : true if every active constraint satisfies g <= tol
%   cv.Vp              : family-balanced p-norm aggregate violation
%   cv.Vinf            : maximum individual violation
%   cv.maxG            : maximum raw normalized constraint value
%   cv.nViolated       : number of constraints with g > feasibilityTol
%   cv.analysisFailure : true if NaN/Inf was detected
%   cv.family          : per-family violation information
%   cv.weights         : normalized active-family weights
%   cv.p               : p used in aggregation
%
% NOTES
%   1) This function does NOT add a penalty term to structural weight.
%   2) Feasibility is checked on every constraint, independently of weights.
%   3) Family balancing prevents a family with many constraints from
%      dominating merely because it contains more entries.

    if nargin < 2 || isempty(opts)
        opts = struct();
    end

    p = getOption(opts, 'p', 4);
    tol = getOption(opts, 'feasibilityTol', 1e-6);
    failureViolation = getOption(opts, 'failureViolation', 1e6);

    if ~(isscalar(p) && isfinite(p) && p >= 1)
        error('constraintViolation:InvalidP', 'opts.p must be a finite scalar >= 1.');
    end
    if ~(isscalar(tol) && isfinite(tol) && tol >= 0)
        error('constraintViolation:InvalidTolerance', ...
              'opts.feasibilityTol must be a finite nonnegative scalar.');
    end

    familyNames = {'stress','disp','buckling','freq'};
    defaultWeights = struct('stress',1,'disp',1,'buckling',1,'freq',1);

    if isfield(opts, 'weights') && ~isempty(opts.weights)
        wIn = opts.weights;
    else
        wIn = defaultWeights;
    end

    active = false(size(familyNames));
    family = struct();
    rawAll = [];
    violAll = [];
    analysisFailure = false;

    for k = 1:numel(familyNames)
        name = familyNames{k};

        if ~isfield(g, name) || isempty(g.(name))
            family.(name) = struct('active',false,'N',0,'Nviolated',0, ...
                                   'Vp',0,'Vinf',0,'maxG',-Inf);
            continue;
        end

        vals = g.(name)(:);
        active(k) = true;

        bad = ~isfinite(vals);
        if any(bad)
            analysisFailure = true;
            vals(bad) = failureViolation;
        end

        v = max(0, vals);
        Vk = (mean(v.^p))^(1/p);

        family.(name) = struct( ...
            'active', true, ...
            'N', numel(vals), ...
            'Nviolated', nnz(vals > tol), ...
            'Vp', Vk, ...
            'Vinf', max(v), ...
            'maxG', max(vals));

        rawAll = [rawAll; vals]; %#ok<AGROW>
        violAll = [violAll; v]; %#ok<AGROW>
    end

    if ~any(active)
        error('constraintViolation:NoConstraints', ...
              'At least one nonempty constraint family is required.');
    end

    w = zeros(size(familyNames));
    for k = 1:numel(familyNames)
        if ~active(k), continue; end
        name = familyNames{k};
        if isfield(wIn, name), wk = wIn.(name); else, wk = 1; end
        if ~(isscalar(wk) && isfinite(wk) && wk > 0)
            error('constraintViolation:InvalidWeight', ...
                  'Weight for active family "%s" must be positive and finite.', name);
        end
        w(k) = wk;
    end
    w = w / sum(w);

    sumTerm = 0;
    wStruct = struct('stress',0,'disp',0,'buckling',0,'freq',0);
    for k = 1:numel(familyNames)
        if ~active(k), continue; end
        name = familyNames{k};
        sumTerm = sumTerm + w(k) * family.(name).Vp^p;
        wStruct.(name) = w(k);
    end

    Vp = sumTerm^(1/p);
    Vinf = max(violAll);
    maxG = max(rawAll);

    cv = struct();
    cv.feasible = (~analysisFailure) && (maxG <= tol);
    cv.Vp = Vp;
    cv.Vinf = Vinf;
    cv.maxG = maxG;
    cv.nViolated = nnz(rawAll > tol);
    cv.analysisFailure = analysisFailure;
    cv.family = family;
    cv.weights = wStruct;
    cv.p = p;
    cv.feasibilityTol = tol;
end

function value = getOption(s, name, defaultValue)
    if isfield(s, name) && ~isempty(s.(name))
        value = s.(name);
    else
        value = defaultValue;
    end
end
