function result = MakeResultSet(records, columns)
%MAKERESULTSET Build a portable tabular result without MATLAB table objects.
% The returned struct is MATLAB/GNU Octave compatible and safe to store in
% MAT v7 artifacts. Use WriteResultCsv to export it.

if ~iscell(records)
    error('MakeResultSet:RecordsMustBeCell', 'records must be a cell matrix.');
end
if ~iscell(columns)
    error('MakeResultSet:ColumnsMustBeCell', 'columns must be a cell array.');
end

columns = reshape(columns, 1, []);
if size(records, 2) ~= numel(columns)
    error('MakeResultSet:ColumnCountMismatch', ...
        'records has %d columns but %d column names were supplied.', ...
        size(records, 2), numel(columns));
end

result = struct();
result.columns = columns;
result.rows = records;
end
