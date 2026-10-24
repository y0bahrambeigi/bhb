function report=ValidateSGDLSDerivatives(outPath)
% Numerical oracle uses only exact problem.evaluate at perturbed areas.
% It never reuses analytical dK/dM/dU or modal perturbation matrices.
startup; atol=2e-5; rtol=2e-3; steps=[1e-3 1e-4 1e-5];
rows={}; n=0; clusters=0; excluded=0; fixtures=ArchivedDesignFixtures();
for bs={'72-bar','120-bar'}
 p=DiscreteDynamicSteelTruss(bs{1}); b=p.getBounds(); mid=p.projectDecision((b.lb+b.ub)/2);
 designs={mid, max(b.lb+1,min(b.ub-1,mid+mod(1:p.nVar,5)-2))};
 for fi=1:size(fixtures,1)
  if strcmp(fixtures{fi,1},bs{1}), designs{end+1}=fixtures{fi,4}; end
 end
 designs=unique(vertcat(designs{:}),'rows'); designs=mat2cell(designs,ones(size(designs,1),1),p.nVar);
 for ds=1:numel(designs)
  x=designs{ds}; [~,~,i0]=p.evaluate(x); [~,g0]=BuildDynamicDiscreteConstraintCV(p,i0,struct());
  [s,stats]=ComputeDynamicDiscreteSensitivities(p,x,i0,struct()); clusters=max(clusters,stats.maxModalClusterSize);
  A=p.sectionCatalog(x);
  for q=1:p.nVar
   for direction=[-1 1]
    D=s.dgdA;
    if direction<0 && isfield(s,'dgdADown'), D=s.dgdADown; end
    for hi=1:numel(steps)
     h=steps(hi)*A(q); Ap=A; Ap(q)=Ap(q)+direction*h;
     pp=p; pp.sectionCatalog=Ap;
     [~,~,ip]=pp.evaluate(1:p.nVar); [~,gp]=BuildDynamicDiscreteConstraintCV(pp,ip,struct());
     for fn={'stress','disp','freq'}
      f=fn{1}; observed=(gp.(f)-g0.(f))/(direction*h); predicted=D.(f)(:,q);
      mask=true(size(observed));
      if ~strcmp(f,'freq')
       % Absolute-value constraints are nonsmooth at exactly zero response.
       % Exclude only that non-differentiable baseline; count exclusions.
       mask=abs(g0.(f)+1)>1e-8; excluded=excluded+sum(~mask);
      end
      residual=abs(observed(mask)-predicted(mask)); scaled=residual./(atol+rtol*abs(predicted(mask)));
      if isempty(scaled), worst=0; else, worst=max(scaled); end
      n=n+1; rows(n,:)={bs{1},ds,q,direction,steps(hi),f,worst,max([0;residual]),hi==3&&worst<=1};
     end
    end
   end
  end
 end
end
columns={'benchmark','design','group','direction','relative_step','family','tolerance_ratio','max_abs_error','final_step_pass'};
WriteResultCsv([outPath '.csv'],MakeResultSet(rows,columns));
last=cell2mat(rows(:,5))<=steps(end-1); ratios=cell2mat(rows(:,7));
report=struct('pass',all(ratios(last)<=1)&&clusters>=2,'atol',atol,'rtol',rtol,'steps',steps,'max_final_tolerance_ratio',max(ratios(last)), ...
 'max_modal_cluster',clusters,'excluded_nonsmooth_rows_across_checks',excluded,'checks',sum(last),'oracle','exact evaluator at continuous perturbed group areas');
fid=fopen([outPath '.json'],'w'); fprintf(fid,'%s\n',jsonencode(report)); fclose(fid);
fprintf('%s\n',jsonencode(report));
end
