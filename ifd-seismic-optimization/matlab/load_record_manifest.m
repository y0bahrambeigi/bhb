function suite=load_record_manifest(manifestFile,recordsRoot,scaling)
if nargin<2||isempty(recordsRoot),recordsRoot=fileparts(manifestFile);end
if nargin<3,scaling=struct('mode','none','opts',struct());end
T=readtable(manifestFile,'TextType','string');suite=struct('id',{},'t',{},'ag',{},'meta',{},'scaleInfo',{});
for i=1:height(T)
 if ismember('IncludePilot',T.Properties.VariableNames)&&~logical(T.IncludePilot(i)),continue;end
 f=fullfile(recordsRoot,char(T.File(i)));if ~isfile(f),warning('Missing %s',f);continue;end
 [t,ag,meta]=load_ground_motion_csv(f,char(T.Units(i)));[ags,si]=scale_ground_motion(t,ag,char(scaling.mode),scaling.opts);
 suite(end+1)=struct('id',char(T.RecordID(i)),'t',t,'ag',ags,'meta',meta,'scaleInfo',si); %#ok<AGROW>
end
end
