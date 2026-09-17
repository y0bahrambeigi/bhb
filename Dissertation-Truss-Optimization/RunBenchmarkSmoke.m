function summary = RunBenchmarkSmoke()
%RUNBENCHMARKSMOKE Evaluate one deterministic upper-bound design per model.

startup();
registry = BenchmarkRegistry();
records = cell(numel(registry), 8);

for k = 1:numel(registry)
    problem = feval(registry(k).problemClass);
    bounds = problem.getBounds();
    [weight, violation, info] = problem.evaluate(bounds.ub);
    records(k,:) = {registry(k).id, problem.nBar, problem.nVar, ...
        localLoadCaseCount(info), weight, violation, info.isStable, info.isFeasible};
end

columns = {'benchmark_id', 'n_members', 'n_variables', 'n_load_cases', ...
    'weight', 'total_violation', 'stable', 'feasible'};
summary = MakeResultSet(records, columns);
fprintf('%s\n', strjoin(columns, ' | '));
disp(records);
end

function n = localLoadCaseCount(info)
% One benchmark evaluation may solve one or more independent load cases.
if isfield(info, 'nLoadCases')
    n = info.nLoadCases;
elseif isfield(info, 'loads') && ~isempty(info.loads)
    n = size(info.loads, 2);
else
    n = 1;
end
end
