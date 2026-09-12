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
    'sourceCitation', '', ...
    'sourceUrl', '', ...
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
benchmarks(3).designVariables = 16;
benchmarks(3).decisionType = 'continuous grouped sizing';
benchmarks(3).loadCases = 2;
benchmarks(3).problemClass = 'SeventyTwoBarSpaceTruss';
benchmarks(3).status = 'source-locked-implemented-local';
benchmarks(3).units = 'in-lb-psi';
benchmarks(3).sourceCitation = 'Camp and Farshchin (2014), Engineering Structures 62-63, 87-97';
benchmarks(3).sourceUrl = 'https://www.mathworks.com/matlabcentral/fileexchange/76228-optimization-benchmark-truss-problems';

benchmarks(4).id = '120-bar';
benchmarks(4).members = 120;
benchmarks(4).dimension = '3D';
benchmarks(4).designVariables = 7;
benchmarks(4).decisionType = 'continuous grouped sizing';
benchmarks(4).loadCases = 1;
benchmarks(4).problemClass = 'OneHundredTwentyBarDomeTruss';
benchmarks(4).status = 'source-locked-implemented-local';
benchmarks(4).units = 'in-lb-psi';
benchmarks(4).sourceCitation = 'Kao, Hung, and Setiawan (2020), Advances in Civil Engineering, 8741862';
benchmarks(4).sourceUrl = 'https://onlinelibrary.wiley.com/doi/10.1155/2020/8741862';
end
