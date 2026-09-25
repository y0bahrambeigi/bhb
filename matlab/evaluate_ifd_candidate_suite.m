function R=evaluate_ifd_candidate_suite(x,suite,S,story_heights,cfg)
if isempty(suite),error('suite is empty');end
story=min(S.n,max(1,round(x(1))));p=cfg.model;p.b=max(0,x(2));p.Fc=max(0,x(3));p.c=max(0,x(4));
lim=cfg.optimization;if ~isfield(cfg,'suite'),cfg.suite=struct();end
if ~isfield(cfg.suite,'robust_weight'),cfg.suite.robust_weight=0.25;end
nR=numel(suite);drift=zeros(nR,1);acc=zeros(nR,1);force=zeros(nR,1);energy=zeros(nR,1);
for i=1:nR
 out=mdof_ifd_response(suite(i).t,suite(i).ag,S,p,story,story_heights);
 drift(i)=out.max_drift/lim.drift_limit;acc(i)=out.max_abs_acc/lim.acc_ref;
 force(i)=out.peak_device_force/lim.device_force_limit;energy(i)=out.device_dissipated_energy;
end
rw=cfg.suite.robust_weight;md=[mean(drift),mean(acc),mean(force)];wd=[max(drift),max(acc),max(force)];
Jraw=lim.w_drift*(md(1)+rw*wd(1))+lim.w_acc*(md(2)+rw*wd(2))+lim.w_force*(md(3)+rw*wd(3))+lim.w_inertance*(p.b/lim.b_ref);
viol=max(0,wd(1)-1)^2+max(0,wd(3)-1)^2;
R=struct('Jraw',Jraw,'violation',viol,'story',story,'params',p,'record_ids',{string({suite.id})},...
 'drift_ratio',drift,'acc_ratio',acc,'force_ratio',force,'mean_ratios',md,'worst_ratios',wd,...
 'dissipated_energy',energy,'nRecords',nR,'robust_weight',rw);
end
