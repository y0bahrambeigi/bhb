function ReevaluateArchivedDesigns(outPath)
startup; fixtures=ArchivedDesignFixtures(); results={};
for j=1:size(fixtures,1)
 p=DiscreteDynamicSteelTruss(fixtures{j,1}); [W,~,info]=p.evaluate(fixtures{j,4});
 [cv,~]=BuildDynamicDiscreteConstraintCV(p,info,struct('p',4,'feasibilityTol',1e-6));
 assert(abs(W-fixtures{j,5})<=1e-8*max(1,abs(W)));
 assert(cv.feasible && cv.Vp==0 && cv.Vinf==0 && cv.maxG<0);
 assert(abs(cv.maxG-fixtures{j,6})<1e-7);
 results(j,:)={fixtures{j,1},fixtures{j,2},fixtures{j,3},W,cv.Vp,cv.Vinf,cv.maxG,cv.feasible};
end
WriteResultCsv(outPath,MakeResultSet(results,{'benchmark','algorithm','seed','weight','Vp','Vinf','maxG','feasible'}));
fprintf('Archived design structural re-evaluation PASS: %d designs\n',size(results,1));
end
