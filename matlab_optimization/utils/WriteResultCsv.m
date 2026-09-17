function WriteResultCsv(filename, result)
%WRITERESULTCSV Write a MakeResultSet struct as RFC-4180-style CSV.
% Supports the scalar char, numeric, and logical values used by the
% dissertation experiment runners in both MATLAB and GNU Octave.

if ~ischar(filename) || isempty(filename)
    error('WriteResultCsv:InvalidFilename', 'filename must be a nonempty char vector.');
end
if ~isstruct(result) || ~isfield(result, 'columns') || ~isfield(result, 'rows')
    error('WriteResultCsv:InvalidResult', ...
        'result must contain columns and rows fields.');
end
if ~iscell(result.columns) || ~iscell(result.rows)
    error('WriteResultCsv:InvalidResult', ...
        'result.columns and result.rows must be cell arrays.');
end
if size(result.rows, 2) ~= numel(result.columns)
    error('WriteResultCsv:ColumnCountMismatch', ...
        'Result row width does not match the number of columns.');
end

fid = fopen(filename, 'w');
if fid < 0
    error('WriteResultCsv:OpenFailed', 'Could not open %s for writing.', filename);
end
cleanupObj = onCleanup(@() fclose(fid)); %#ok<NASGU>

localWriteRow(fid, result.columns);
for i = 1:size(result.rows, 1)
    localWriteRow(fid, result.rows(i, :));
end
end

function localWriteRow(fid, row)
for j = 1:numel(row)
    if j > 1
        fprintf(fid, ',');
    end
    fprintf(fid, '%s', localCsvValue(row{j}));
end
fprintf(fid, '\n');
end

function text = localCsvValue(value)
if ischar(value)
    text = value;
elseif islogical(value) && isscalar(value)
    if value
        text = '1';
    else
        text = '0';
    end
elseif isnumeric(value) && isscalar(value)
    if isnan(value)
        text = 'NaN';
    elseif isinf(value)
        if value > 0
            text = 'Inf';
        else
            text = '-Inf';
        end
    else
        text = sprintf('%.17g', value);
    end
else
    error('WriteResultCsv:UnsupportedValue', ...
        'CSV cells must be scalar char, numeric, or logical values.');
end

if any(text == ',') || any(text == '"') || ...
        any(text == sprintf('\n')) || any(text == sprintf('\r'))
    text = ['"' strrep(text, '"', '""') '"'];
end
end
