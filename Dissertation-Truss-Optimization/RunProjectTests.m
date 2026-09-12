function RunProjectTests()
%RUNPROJECTTESTS Execute the complete standalone regression suite.

startup();
TestTenBarTrussTopology();
TestDissertationBenchmarkFramework();
fprintf('Standalone project regression suite PASSED.\n');
end
