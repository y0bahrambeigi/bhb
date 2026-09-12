function data = GenerateSurrogateDataset(problem, benchmarkId, nSamples, seed, outputFile)
%GenerateSurrogateDataset Create a reproducible FE-labelled design dataset.
%
% The first two designs are the upper- and lower-bound anchors. Remaining
% designs are sampled uniformly inside the declared decision bounds. Problems
% with projectDecision() map samples onto their discrete section catalog.

validateattributes(nSamples, {'numeric'}, {'scalar', 'integer', '>=', 2}, ...
    mfilename, 'nSamples');
validateattributes(seed, {'numeric'}, {'scalar', 'integer', 'nonnegative'}, ...
    mfilename, 'seed');
if nargin < 5
    outputFile = '';
end

rng(seed, 'twister');
bounds = problem.getBounds();
nVar = problem.nVar;
X = repmat(bounds.lb, nSamples, 1) + ...
    rand(nSamples, nVar) .* repmat(bounds.ub - bounds.lb, nSamples, 1);
X(1, :) = bounds.ub;
X(2, :) = bounds.lb;

if ismethod(problem, 'projectDecision')
    for i = 1:nSamples
        X(i, :) = problem.projectDecision(X(i, :));
    end
end

weight = zeros(nSamples, 1);
violation = zeros(nSamples, 1);
stable = false(nSamples, 1);
feasible = false(nSamples, 1);
maxStressRatio = zeros(nSamples, 1);
maxDisplacementRatio = zeros(nSamples, 1);

for i = 1:nSamples
    [weight(i), violation(i), info] = problem.evaluate(X(i, :));
    stable(i) = info.isStable;
    feasible(i) = info.isFeasible;
    if isfield(info, 'maxStressRatio')
        maxStressRatio(i) = info.maxStressRatio;
    else
        maxStressRatio(i) = max(info.stressRatio(:));
    end
    if isfield(info, 'maxDisplacementRatio')
        maxDisplacementRatio(i) = info.maxDisplacementRatio;
    elseif isprop(problem, 'deltaMax')
        maxDisplacementRatio(i) = info.maxDisp / problem.deltaMax;
    else
        maxDisplacementRatio(i) = NaN;
    end
end

data.benchmarkId = benchmarkId;
data.seed = seed;
data.design = X;
data.weight = weight;
data.totalViolation = violation;
data.stable = stable;
data.feasible = feasible;
data.maxStressRatio = maxStressRatio;
data.maxDisplacementRatio = maxDisplacementRatio;

if ~isempty(outputFile)
    outputDir = fileparts(outputFile);
    if ~isempty(outputDir) && ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end
    fid = fopen(outputFile, 'w');
    if fid < 0
        error('GenerateSurrogateDataset:FileOpen', 'Cannot open output file: %s', outputFile);
    end
    cleaner = onCleanup(@() fclose(fid)); %#ok<NASGU>
    fprintf(fid, 'benchmark_id,sample_id,seed,source,stable,feasible,weight_lb,total_violation,max_stress_ratio,max_displacement_ratio');
    for j = 1:nVar
        fprintf(fid, ',x%d', j);
    end
    fprintf(fid, '\n');

    for i = 1:nSamples
        source = 'uniform';
        if i == 1, source = 'upper-bound-anchor'; end
        if i == 2, source = 'lower-bound-anchor'; end
        fprintf(fid, '%s,%d,%d,%s,%d,%d,%.12g,%.12g,%.12g,%.12g', ...
            benchmarkId, i, seed, source, stable(i), feasible(i), weight(i), ...
            violation(i), maxStressRatio(i), maxDisplacementRatio(i));
        fprintf(fid, ',%.12g', X(i, :));
        fprintf(fid, '\n');
    end
end
end
