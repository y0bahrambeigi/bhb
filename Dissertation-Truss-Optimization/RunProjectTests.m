function RunProjectTests()
%RUNPROJECTTESTS Execute the complete standalone regression suite.

startup();
smokeSummary = RunBenchmarkSmoke();
assert(isstruct(smokeSummary) && isfield(smokeSummary, 'columns') && ...
    isfield(smokeSummary, 'rows') && size(smokeSummary.rows, 1) == 4, ...
    'RunBenchmarkSmoke must return four portable benchmark rows.');
TestTenBarTrussTopology();
TestDissertationBenchmarkFramework();
fprintf('Standalone project regression suite PASSED.\n');
end
