function TestDynamicDiscreteShard()
%TestDynamicDiscreteShard Cheap CI smoke check for the sharded study runner.

rootDir = fileparts(fileparts(mfilename('fullpath')));
outDir = fullfile(rootDir,'results','dynamic-discrete-shards');

result = RunDynamicDiscreteShard('72-bar','qio',24,2026);
assert(size(result.rows,1) == 1,'Shard smoke run must return one row.');
assert(result.rows{1,7} == 24,'Shard must preserve exact evaluator budget.');
assert(result.rows{1,9} == 24,'Every dynamic evaluator call must include one modal solve.');
assert(result.rows{1,10} > 0,'QIO shard must execute QIO attempts.');

csvPath = fullfile(outDir,'72_bar__qio__FE24__seeds2026_2026.csv');
matPath = fullfile(outDir,'72_bar__qio__FE24__seeds2026_2026.mat');
assert(exist(csvPath,'file') == 2 && exist(matPath,'file') == 2, ...
    'Shard smoke run did not persist CSV/MAT artifacts.');

fprintf('Dynamic discrete shard test PASSED.\n');
end
