function out=mdof_ifd_response(t,ag,S,p,story,story_heights)
if numel(t)~=numel(ag),error('t and ag must match.');end
q=device_incidence_vector(S.n,story);Me=S.M+p.b*(q*q.');
if rcond(Me)<1e-12,error('Effective mass ill-conditioned.');end
agfun=@(tt)interp1(t,ag,tt,'linear',0);ode=@(tt,y)rhs(tt,y,agfun,S,Me,q,p);
[ts,y]=ode45(ode,[t(1) t(end)],zeros(2*S.n,1),odeset('RelTol',1e-6,'AbsTol',1e-8));
u=y(:,1:S.n);v=y(:,S.n+1:end);nt=numel(ts);a_rel=zeros(nt,S.n);a_abs=zeros(nt,S.n);
Fd=zeros(nt,1);xr=zeros(nt,1);vr=zeros(nt,1);ar=zeros(nt,1);
for k=1:nt
    dy=ode(ts(k),y(k,:).');a_rel(k,:)=dy(S.n+1:end).';agk=agfun(ts(k));a_abs(k,:)=a_rel(k,:)+agk;
    xr(k)=q.'*u(k,:).';vr(k)=q.'*v(k,:).';ar(k)=q.'*a_rel(k,:).';
    Fd(k)=p.b*ar(k)+p.c*vr(k)+p.Fc*tanh(vr(k)/max(p.v0,eps))+p.k0*xr(k);
end
drift=interstory_drift(u,story_heights);force_diss=p.c*vr+p.Fc*tanh(vr/max(p.v0,eps));
out=struct('t',ts,'u',u,'v',v,'a_rel',a_rel,'a_abs',a_abs,'device_story',story,'q',q,...
    'x_device',xr,'v_device',vr,'a_device_rel',ar,'device_force',Fd,'interstory_drift',drift,...
    'max_drift',max(max(abs(drift))),'max_abs_acc',max(max(abs(a_abs))),...
    'peak_device_force',max(abs(Fd)),'device_dissipated_energy',trapz(ts,force_diss.*vr),'effective_mass',Me);
end
function dy=rhs(tt,y,agfun,S,Me,q,p)
n=S.n;u=y(1:n);v=y(n+1:end);xr=q.'*u;vr=q.'*v;
Fni=p.c*vr+p.Fc*tanh(vr/max(p.v0,eps))+p.k0*xr;
udd=Me\(-S.C*v-S.K*u-q*Fni-S.M*S.influence*agfun(tt));dy=[v;udd];
end
