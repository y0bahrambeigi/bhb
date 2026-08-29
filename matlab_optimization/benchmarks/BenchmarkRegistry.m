function benchmarks = BenchmarkRegistry()
%BenchmarkRegistry Canonical dissertation benchmark inventory.
% Every entry uses the same fields so experiment scripts can reject an
% undefined benchmark instead of silently mixing incompatible assumptions.

template = struct( ...
    'id', '', ...
    'members', 0, ...
    'dimension', '', ...
    'designVariables', 0, ...
    'decisionType', '', ...
    'loadCases', 0, ...
    'problemClass', '', ...
    'status', '', ...
    'units', '', ...
    'requiredSeeds', [2026, 2027, 2028, 2029, 2030]);

benchmarks = repmat(template, 1, 4);

benchmarks(1).id = '10-bar';
benchmarks(1).members = 10;
benchmarks(1).dimension = '2D';
benchmarks(1).designVariables = 20;
benchmarks(1).decisionType = 'continuous sizing + binary topology';
benchmarks(1).loadCases = 1;
benchmarks(1).problemClass = 'TenBarTrussTopology';
benchmarks(1).status = 'validated-ci';
benchmarks(1).units = 'in-kip-ksi-lb';

benchmarks(2).id = '25-bar';
benchmarks(2).members = 25;
benchmarks(2).dimension = '3D';
benchmarks(2).designVariables = 8;
benchmarks(2).decisionType = 'discrete grouped sizing';
benchmarks(2).loadCases = 2;
benchmarks(2).problemClass = 'TwentyFiveBarSpaceTruss';
benchmarks(2).status = 'implemented-ci';
benchmarks(2).units = 'in-kip-ksi-lb';

benchmarks(3).id = '72-bar';
benchmarks(3).members = 72;
benchmarks(3).dimension = '3D';
benchmarks(3).designVariables = 0;
benchmarks(3).decisionType = 'definition pending source lock';
benchmarks(3).loadCases = 0;
benchmarks(3).problemClass = '';
benchmarks(3).status = 'specification-pending';
benchmarks(3).units = 'not locked';

benchmarks(4).id = '100-bar';
benchmarks(4).members = 100;
benchmarks(4).dimension = 'not locked';
benchmarks(4).designVariables = 0;
benchmarks(4).decisionType = 'definition pending source lock';
benchmarks(4).loadCases = 0;
benchmarks(4).problemClass = '';
benchmarks(4).status = 'specification-pending';
benchmarks(4).units = 'not locked';
end
