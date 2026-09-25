function [t,ag,meta]=load_ground_motion_csv(file,units)
T=readtable(file);t=T{:,1};ag=T{:,2};t=t(:);ag=ag(:);
switch lower(strrep(units,' ',''))
 case 'g',ag=ag*9.81;
 case {'m/s2','m/s^2','ms-2'}
 otherwise,error('units must be g or m/s2');
end
meta=struct('source',file,'units_input',units,'dt_median',median(diff(t)),'pga_mps2',max(abs(ag)));
end
