function moves = RankDynamicSGDLSMoves(problem,current,sens,opts)
%RANKDYNAMICSGDLSMOVES Rank one-step catalog moves from analytical sensitivities.
% Sensitivity predicts/ranks only; final acceptance requires exact evaluate().

if nargin < 4 || isempty(opts), opts = struct(); end
if ~isfield(opts,'safetyMargin'), opts.safetyMargin = 1e-4; end
if ~isfield(opts,'constraintOptions'), opts.constraintOptions = struct(); end
if ~isfield(opts,'allowRepairFallback'), opts.allowRepairFallback = true; end

nGroup = problem.nVar;
template = struct('group',NaN,'direction',NaN,'predVp',NaN,'predVinf',NaN, ...
    'predMaxG',NaN,'predFeasible',false,'deltaW',NaN,'score',-Inf, ...
    'valid',false,'reason','');
moves = repmat(template,nGroup,1);

if current.cv.feasible
    direction = -1; deltaA = sens.deltaADown; deltaW = sens.deltaWDown;
else
    direction = +1; deltaA = sens.deltaAUp; deltaW = sens.deltaWUp;
end

for q = 1:nGroup
    moves(q).group = q; moves(q).direction = direction;
    if ~isfinite(deltaA(q)) || ~isfinite(deltaW(q)) || deltaW(q) <= 0
        moves(q).reason = 'catalog-bound'; continue;
    end
    gPred = localPredict(current.g,sens.dgdA,q,deltaA(q));
    cvPred = constraintViolation(gPred,opts.constraintOptions);
    moves(q).predVp = cvPred.Vp; moves(q).predVinf = cvPred.Vinf;
    moves(q).predMaxG = cvPred.maxG; moves(q).predFeasible = cvPred.feasible;
    moves(q).deltaW = deltaW(q);

    if direction > 0
        improvement = current.cv.Vp-cvPred.Vp;
        moves(q).score = improvement/max(deltaW(q),eps);
        moves(q).valid = improvement > 0;
        if moves(q).valid, moves(q).reason='predicted-repair'; else, moves(q).reason='no-predicted-repair'; end
    else
        moves(q).valid = cvPred.maxG <= -opts.safetyMargin;
        moves(q).score = deltaW(q);
        if moves(q).valid, moves(q).reason='predicted-safe-reduction'; else, moves(q).reason='predicted-unsafe-reduction'; end
    end
end

valid = moves([moves.valid]);
if isempty(valid) && direction > 0 && opts.allowRepairFallback
    candidates = moves(isfinite([moves.predVp]));
    if ~isempty(candidates)
        [~,k] = min([candidates.predVp]);
        candidates(k).valid = true; candidates(k).reason='repair-fallback-min-predVp';
        valid = candidates(k);
    end
end
if isempty(valid), moves = valid; return; end

if direction > 0
    T = [[valid.score].',-[valid.predVp].',-[valid.predVinf].'];
    [~,ord] = sortrows(T,[-1 -2 -3]);
else
    T = [[valid.deltaW].',[valid.predMaxG].'];
    [~,ord] = sortrows(T,[-1 2]);
end
moves = valid(ord);
end

function gPred = localPredict(g,dgdA,q,dA)
names = {'stress','disp','buckling','freq'}; gPred = struct();
for i = 1:numel(names)
    name = names{i};
    if ~isfield(g,name) || isempty(g.(name)), gPred.(name)=[]; continue; end
    vals = g.(name)(:); D = dgdA.(name);
    if size(D,1) ~= numel(vals) || size(D,2) < q
        error('RankDynamicSGDLSMoves:DimensionMismatch','Sensitivity mismatch for %s.',name);
    end
    gPred.(name) = vals + D(:,q)*dA;
end
end
