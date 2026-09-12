function SaveMatV7(filename, variables)
%SaveMatV7 Save a struct as a MATLAB-readable v7 MAT file.
% Octave's default save format can be text.  Requiring v7 here keeps CI
% artifacts portable to MATLAB and makes the artifact format explicit.

validateattributes(filename, {'char'}, {'row', 'nonempty'});
assert(isstruct(variables) && isscalar(variables), ...
    'SaveMatV7:VariablesMustBeScalarStruct');

save(filename, '-struct', 'variables', '-v7');

reloaded = load(filename);
expected = sort(fieldnames(variables));
actual = sort(fieldnames(reloaded));
assert(isequal(actual, expected), ...
    'SaveMatV7:RoundTripFailed', ...
    'MAT artifact did not round-trip with the expected variables.');
end
