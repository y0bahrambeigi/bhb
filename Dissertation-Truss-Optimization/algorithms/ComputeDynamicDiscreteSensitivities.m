function [sens, stats] = ComputeDynamicDiscreteSensitivities(problem,x,info,opts)
%COMPUTEDYNAMICDISCRETESENSITIVITIES
% Analytical first-order sensitivities for DiscreteDynamicSteelTruss.
% No trial design is evaluated here. Current-state K and M are rebuilt once.
% Static sensitivities use dU/dAq=-K^{-1}(dK/dAq)U. Modal sensitivities use
% the generalized-eigenvalue derivative; near-repeated modes are treated as
% clusters through a projected perturbation matrix.

if nargin < 4 || isempty(opts), opts = struct(); end
clusterTol = getOption(opts,'modalClusterTol',1e-5);
freqConsistencyTol = getOption(opts,'frequencyConsistencyTol',1e-5);

x = problem.projectDecision(x);
nGroup = problem.nVar;
catalog = problem.sectionCatalog;
groupAreas = catalog(x);

nodes = info.nodes;
elements = info.elements;
groupMap = info.groupMap(:);
lengths = info.lengths(:);
fixedNodes = info.fixedNodes;
U = info.displacement;
stress = info.stress;

nNode = size(nodes,1);
nDOF = 3*nNode;
I3 = eye(3);
fixedDOFs = reshape([3*fixedNodes-2;3*fixedNodes-1;3*fixedNodes],1,[]);
freeDOFs = setdiff(1:nDOF,fixedDOFs);

K = zeros(nDOF); M = zeros(nDOF);
dK = cell(nGroup,1); dM = cell(nGroup,1);
for q = 1:nGroup
    dK{q} = zeros(nDOF); dM{q} = zeros(nDOF);
end

for i = 1:problem.nBar
    n1 = elements(i,1); n2 = elements(i,2);
    delta = nodes(n2,:) - nodes(n1,:);
    L = norm(delta); n = delta/L;
    q = groupMap(i); A = groupAreas(q);
    k3base = problem.E/L*(n'*n);
    KeBase = [k3base,-k3base;-k3base,k3base];
    massBase = problem.rhoWeight*L/problem.gAccel;
    MeBase = (massBase/6)*[2*I3,I3;I3,2*I3];
    dof = [3*n1-2:3*n1,3*n2-2:3*n2];
    K(dof,dof) = K(dof,dof) + A*KeBase;
    M(dof,dof) = M(dof,dof) + A*MeBase;
    dK{q}(dof,dof) = dK{q}(dof,dof) + KeBase;
    dM{q}(dof,dof) = dM{q}(dof,dof) + MeBase;
end

kgToLbm = 2.20462262184878;
for node = 1:numel(problem.addedMassKg)
    if problem.addedMassKg(node) <= 0, continue; end
    dynamicMass = problem.addedMassKg(node)*kgToLbm/problem.gAccel;
    dof = 3*node-2:3*node;
    M(dof,dof) = M(dof,dof) + dynamicMass*I3;
end

Kff = K(freeDOFs,freeDOFs);
Mff = M(freeDOFs,freeDOFs);
Ufree = U(freeDOFs,:);
nLoad = size(Ufree,2);

RHS = zeros(numel(freeDOFs),nLoad*nGroup);
for q = 1:nGroup
    cols = (q-1)*nLoad + (1:nLoad);
    RHS(:,cols) = dK{q}(freeDOFs,freeDOFs)*Ufree;
end
DUstack = -(Kff\RHS);

if ~isempty(strfind(lower(info.benchmarkId),'72-bar'))
    cNodes = info.controlNodes;
    dispDOFs = reshape([3*cNodes-2;3*cNodes-1;3*cNodes],1,[]);
else
    dispDOFs = freeDOFs;
end

dgdA.stress = zeros(numel(info.stressRatio),nGroup);
dgdA.disp = zeros(numel(U(dispDOFs,:)),nGroup);
is120 = ~isempty(strfind(lower(info.benchmarkId),'120-bar'));

if is120
    memberAreas = info.memberAreas(:);
    radius = 0.4993*memberAreas.^0.6777;
    slenderness = lengths./radius;
    Cc = sqrt(2*pi^2*problem.E/problem.yieldStress);
    compressionAllow = zeros(problem.nBar,1);
    dCompressionAllow_dA = zeros(problem.nBar,1);
    inelastic = slenderness < Cc;
    idx = find(inelastic);
    if ~isempty(idx)
        lam = slenderness(idx); A = memberAreas(idx);
        N = 1-lam.^2/(2*Cc^2);
        D = 5/3 + 3*lam/(8*Cc) - lam.^3/(8*Cc^3);
        compressionAllow(idx) = problem.yieldStress.*N./D;
        dN = -lam/(Cc^2);
        dD = 3/(8*Cc) - 3*lam.^2/(8*Cc^3);
        dF_dlam = problem.yieldStress.*(dN.*D-N.*dD)./(D.^2);
        dlam_dA = -0.6777*lam./A;
        dCompressionAllow_dA(idx) = dF_dlam.*dlam_dA;
    end
    idx = find(~inelastic);
    if ~isempty(idx)
        lam = slenderness(idx); A = memberAreas(idx);
        compressionAllow(idx) = 12*pi^2*problem.E./(23*lam.^2);
        dCompressionAllow_dA(idx) = 2*0.6777*compressionAllow(idx)./A;
    end
    tensionAllow = 0.6*problem.yieldStress;
end

for q = 1:nGroup
    cols = (q-1)*nLoad + (1:nLoad);
    dU = zeros(nDOF,nLoad);
    dU(freeDOFs,:) = DUstack(:,cols);
    dStress = zeros(problem.nBar,nLoad);
    for i = 1:problem.nBar
        n1 = elements(i,1); n2 = elements(i,2);
        n = (nodes(n2,:)-nodes(n1,:))/lengths(i);
        ddu = dU(3*n2-2:3*n2,:) - dU(3*n1-2:3*n1,:);
        dStress(i,:) = problem.E/lengths(i)*n*ddu;
    end

    if ~is120
        dRatio = sign(stress).*dStress/problem.stressAllow;
    else
        dRatio = zeros(size(stress));
        for i = 1:problem.nBar
            for l = 1:size(stress,2)
                sig = stress(i,l); dsig = dStress(i,l);
                if sig < 0
                    Fallow = compressionAllow(i); dF = 0;
                    if groupMap(i) == q, dF = dCompressionAllow_dA(i); end
                    dRatio(i,l) = (-dsig)/Fallow - abs(sig)*dF/(Fallow^2);
                else
                    dRatio(i,l) = sign(sig)*dsig/tensionAllow;
                end
            end
        end
    end
    dgdA.stress(:,q) = dRatio(:);
    dDispRatio = sign(U(dispDOFs,:)).*dU(dispDOFs,:)/problem.deltaMax;
    dgdA.disp(:,q) = dDispRatio(:);
end

[Phi,D] = eig((Kff+Kff')/2,(Mff+Mff')/2);
lambdaAll = real(diag(D));
valid = isfinite(lambdaAll) & lambdaAll > 1e-10;
lambda = lambdaAll(valid); Phi = real(Phi(:,valid));
[lambda,ord] = sort(lambda); Phi = Phi(:,ord);

nNeeded = max(problem.frequencyModeIndices);
if numel(lambda) < nNeeded
    error('ComputeDynamicDiscreteSensitivities:TooFewModes','Insufficient positive eigenvalues.');
end
freqAll = sqrt(lambda)/(2*pi);
refFreq = info.naturalFrequenciesHz(:);
checkN = min(numel(refFreq),nNeeded);
freqConsistencyError = max(abs(freqAll(1:checkN)-refFreq(1:checkN))./max(abs(refFreq(1:checkN)),eps));

clusters = localClusters(lambda,clusterTol);
clusterOf = zeros(numel(lambda),1);
for c = 1:numel(clusters), clusterOf(clusters{c}) = c; end

nFreqConstraint = numel(problem.frequencyModeIndices);
dgdA.freq = zeros(nFreqConstraint,nGroup);
modalClusterSize = zeros(nFreqConstraint,1);
modalRelativeGap = inf(nFreqConstraint,1);

for k = 1:nFreqConstraint
    r = problem.frequencyModeIndices(k);
    ids = clusters{clusterOf(r)};
    modalClusterSize(k) = numel(ids);
    if r > 1
        modalRelativeGap(k) = min(modalRelativeGap(k),abs(lambda(r)-lambda(r-1))/max(lambda(r),eps));
    end
    if r < numel(lambda)
        modalRelativeGap(k) = min(modalRelativeGap(k),abs(lambda(r+1)-lambda(r))/max(lambda(r),eps));
    end

    PhiC = Phi(:,ids);
    G = (PhiC'*Mff*PhiC); G = (G+G')/2;
    [R,pchol] = chol(G);
    if pchol == 0
        PhiN = PhiC/R;
    else
        [VG,DG] = eig(G); dG = real(diag(DG));
        if any(dG <= eps), error('Degenerate modal mass Gram matrix.'); end
        PhiN = PhiC*VG*diag(1./sqrt(dG));
    end
    lambda0 = mean(lambda(ids));
    pos = find(ids==r,1,'first');

    for q = 1:nGroup
        dKff = dK{q}(freeDOFs,freeDOFs);
        dMff = dM{q}(freeDOFs,freeDOFs);
        if numel(ids) == 1
            phi = PhiN(:,1);
            dlam = phi'*(dKff-lambda(r)*dMff)*phi;
        else
            H = PhiN'*(dKff-lambda0*dMff)*PhiN; H = (H+H')/2;
            directional = sort(real(eig(H)));
            dlam = directional(pos);
        end
        df = dlam/(4*pi*sqrt(lambda(r)));
        f = freqAll(r); fmin = problem.frequencyMinimumHz(k);
        dgdA.freq(k,q) = -fmin/(f^2)*df;
    end
end

dgdA.buckling = [];

deltaAUp = nan(nGroup,1); deltaADown = nan(nGroup,1);
deltaWUp = nan(nGroup,1); deltaWDown = nan(nGroup,1);
groupWeightCoeff = zeros(nGroup,1);
for q = 1:nGroup
    members = groupMap == q;
    groupWeightCoeff(q) = problem.rhoWeight*sum(lengths(members));
    idx = x(q);
    if idx < numel(catalog)
        deltaAUp(q) = catalog(idx+1)-catalog(idx);
        deltaWUp(q) = groupWeightCoeff(q)*deltaAUp(q);
    end
    if idx > 1
        deltaADown(q) = catalog(idx-1)-catalog(idx);
        deltaWDown(q) = -groupWeightCoeff(q)*deltaADown(q);
    end
end

sens.dgdA = dgdA;
sens.deltaAUp = deltaAUp; sens.deltaADown = deltaADown;
sens.deltaWUp = deltaWUp; sens.deltaWDown = deltaWDown;
sens.groupWeightCoeff = groupWeightCoeff;
sens.modalClusterSize = modalClusterSize;
sens.modalRelativeGap = modalRelativeGap;
sens.frequencyConsistencyError = freqConsistencyError;
sens.frequencyConsistencyOK = freqConsistencyError <= freqConsistencyTol;

stats.staticMultiRHSSolves = 1;
stats.staticSensitivityRHS = nLoad*nGroup;
stats.modalEigenSolves = 1;
stats.nGroups = nGroup; stats.nLoadCases = nLoad;
stats.maxModalClusterSize = max(modalClusterSize);
stats.minConstrainedModalRelativeGap = min(modalRelativeGap);
stats.frequencyConsistencyError = freqConsistencyError;
stats.frequencyConsistencyOK = sens.frequencyConsistencyOK;
end

function clusters = localClusters(lambda,tol)
n = numel(lambda); clusters = {}; startIdx = 1;
for i = 1:n-1
    gap = abs(lambda(i+1)-lambda(i))/max([abs(lambda(i)),abs(lambda(i+1)),eps]);
    if gap > tol
        clusters{end+1} = startIdx:i; %#ok<AGROW>
        startIdx = i+1;
    end
end
clusters{end+1} = startIdx:n;
end

function value = getOption(s,name,defaultValue)
if isfield(s,name) && ~isempty(s.(name)), value = s.(name); else, value = defaultValue; end
end
