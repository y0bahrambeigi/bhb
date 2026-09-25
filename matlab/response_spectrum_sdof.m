function [Sa,Sd]=response_spectrum_sdof(t,ag,periods,zeta)
dt=median(diff(t));beta=1/4;gamma=1/2;m=1;Sa=zeros(size(periods));Sd=zeros(size(periods));
for j=1:numel(periods)
 T=periods(j);w=2*pi/T;k=w^2;c=2*zeta*w;a0=1/(beta*dt^2);a1=gamma/(beta*dt);
 a2=1/(beta*dt);a3=1/(2*beta)-1;a4=gamma/beta-1;a5=dt*(gamma/(2*beta)-1);khat=k+a0*m+a1*c;
 u=0;v=0;ar=-ag(1);umax=0;
 for i=1:numel(t)-1
  phat=-ag(i+1)+m*(a0*u+a2*v+a3*ar)+c*(a1*u+a4*v+a5*ar);
  un=phat/khat;arn=a0*(un-u)-a2*v-a3*ar;vn=v+dt*((1-gamma)*ar+gamma*arn);
  u=un;v=vn;ar=arn;umax=max(umax,abs(u));
 end
 Sd(j)=umax;Sa(j)=w^2*umax;
end
end
