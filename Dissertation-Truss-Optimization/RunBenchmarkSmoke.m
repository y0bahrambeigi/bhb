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
        info.nLoadCases, weight, violation, info.isStable, info.isFeasible};
end

summary = cell2table(records, 'VariableNames', {'benchmark_id', 'n_members', ...
    'n_variables', 'n_load_cases', 'weight', 'total_violation', 'stable', 'feasible'});
disp(summary);
end
