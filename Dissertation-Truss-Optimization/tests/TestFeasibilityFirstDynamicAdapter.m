function tests = TestFeasibilityFirstDynamicAdapter
%TESTFEASIBILITYFIRSTDYNAMICADAPTER Repository-level tests for the FF adapter.
tests = functiontests(localfunctions);
end

function testFeasibleDominatesLighterInfeasible(testCase)
A.W = 5000;
A.cv = fakeCV(true,0,0,-0.01);

B.W = 4500;
B.cv = fakeCV(false,0.01,0.02,0.02);

verifyTrue(testCase,isBetter(A,B));
verifyFalse(testCase,isBetter(B,A));
end

function testLowerWeightWinsAmongFeasible(testCase)
A.W = 4800; A.cv = fakeCV(true,0,0,-0.01);
B.W = 5000; B.cv = fakeCV(true,0,0,-0.02);
verifyTrue(testCase,isBetter(A,B));
end

function testLowerVpWinsAmongInfeasible(testCase)
A.W = 5100; A.cv = fakeCV(false,0.01,0.03,0.03);
B.W = 4500; B.cv = fakeCV(false,0.02,0.02,0.02);
verifyTrue(testCase,isBetter(A,B));
end

function testProblemAdapterProducesThreeActiveFamilies(testCase)
problem = DiscreteDynamicSteelTruss('72-bar');
x = round(0.5*(problem.getBounds().lb + problem.getBounds().ub));
[~,~,info] = problem.evaluate(x);
[cv,g] = BuildDynamicDiscreteConstraintCV(problem,info, ...
    struct('p',4,'feasibilityTol',1e-6));

verifyNotEmpty(testCase,g.stress);
verifyNotEmpty(testCase,g.disp);
verifyNotEmpty(testCase,g.freq);
verifyTrue(testCase,isfield(cv,'Vp'));
verifyTrue(testCase,isfield(cv,'Vinf'));
end

function cv = fakeCV(feasible,Vp,Vinf,maxG)
cv.feasible = feasible;
cv.Vp = Vp;
cv.Vinf = Vinf;
cv.maxG = maxG;
end
