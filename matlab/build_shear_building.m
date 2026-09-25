function S = build_shear_building(masses,story_stiffness,zeta)
masses=masses(:);story_stiffness=story_stiffness(:);n=numel(masses);
if numel(story_stiffness)~=n,error('masses and story_stiffness must match.');end
M=diag(masses);K=zeros(n);
for i=1:n
    ki=story_stiffness(i);K(i,i)=K(i,i)+ki;
    if i>1,K(i-1,i-1)=K(i-1,i-1)+ki;K(i,i-1)=K(i,i-1)-ki;K(i-1,i)=K(i-1,i)-ki;end
end
[V,D]=eig(K,M);w=sqrt(max(real(diag(D)),0));[w,idx]=sort(w);V=V(:,idx);fn=w/(2*pi);
if n==1
    C=2*zeta*w(1)*M;alpha=2*zeta*w(1);beta=0;
else
    A=[1/(2*w(1)),w(1)/2;1/(2*w(2)),w(2)/2];ab=A\[zeta;zeta];alpha=ab(1);beta=ab(2);C=alpha*M+beta*K;
end
S=struct('n',n,'M',M,'K',K,'C',C,'masses',masses,'story_stiffness',story_stiffness,...
    'modes',V,'omega',w,'fn',fn,'rayleigh_alpha',alpha,'rayleigh_beta',beta,'influence',ones(n,1));
end
