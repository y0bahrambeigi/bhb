function tests = TestDynamicDiscreteSensitivities
% Smoke/consistency tests for analytical SG-DLS support.
tests = functiontests(localfunctions);
end

function test72SensitivityDimensions(testCase)
problem=DiscreteDynamicSteelTruss('72-bar'); bounds=problem.getBounds();
x=problem.projectDecision(0.5*(bounds.lb+bounds.ub)); [~,~,info]=problem.evaluate(x);
[cv,g]=BuildDynamicDiscreteConstraintCV(problem,info,struct('p',4,'feasibilityTol',1e-6));
[sens,stats]=ComputeDynamicDiscreteSensitivities(problem,x,info,struct());
verifySize(testCase,sens.dgdA.stress,[numel(g.stress),problem.nVar]);
verifySize(testCase,sens.dgdA.disp,[numel(g.disp),problem.nVar]);
verifySize(testCase,sens.dgdA.freq,[numel(g.freq),problem.nVar]);
verifyEqual(testCase,stats.nGroups,problem.nVar); verifyTrue(testCase,isfinite(cv.Vp));
end

function test120SensitivityDimensions(testCase)
problem=DiscreteDynamicSteelTruss('120-bar'); bounds=problem.getBounds();
x=problem.projectDecision(0.5*(bounds.lb+bounds.ub)); [~,~,info]=problem.evaluate(x);
[~,g]=BuildDynamicDiscreteConstraintCV(problem,info,struct('p',4,'feasibilityTol',1e-6));
[sens,~]=ComputeDynamicDiscreteSensitivities(problem,x,info,struct());
verifySize(testCase,sens.dgdA.stress,[numel(g.stress),problem.nVar]);
verifySize(testCase,sens.dgdA.disp,[numel(g.disp),problem.nVar]);
verifySize(testCase,sens.dgdA.freq,[numel(g.freq),problem.nVar]);
end

function testRankingProducesValidCatalogMoveOrEmpty(testCase)
problem=DiscreteDynamicSteelTruss('72-bar'); bounds=problem.getBounds();
x=problem.projectDecision(0.5*(bounds.lb+bounds.ub)); [f,~,info]=problem.evaluate(x);
[cv,g]=BuildDynamicDiscreteConstraintCV(problem,info,struct('p',4,'feasibilityTol',1e-6));
[sens,~]=ComputeDynamicDiscreteSensitivities(problem,x,info,struct());
current.x=x; current.W=f; current.cv=cv; current.g=g;
opts.safetyMargin=1e-4; opts.constraintOptions=struct('p',4,'feasibilityTol',1e-6);
moves=RankDynamicSGDLSMoves(problem,current,sens,opts);
if ~isempty(moves)
    verifyGreaterThanOrEqual(testCase,moves(1).group,1);
    verifyLessThanOrEqual(testCase,moves(1).group,problem.nVar);
    verifyTrue(testCase,ismember(moves(1).direction,[-1 1]));
end
end
