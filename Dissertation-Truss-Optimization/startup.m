function startup()
%STARTUP Add every standalone project component to the MATLAB/Octave path.

rootDir = fileparts(mfilename('fullpath'));
folders = {'algorithms', 'benchmarks', 'problems', 'surrogate', 'tests', 'utils'};
for k = 1:numel(folders)
    addpath(fullfile(rootDir, folders{k}));
end

fprintf('Dissertation Truss Optimization paths loaded from:\n%s\n', rootDir);
end
