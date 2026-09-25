classdef IFDSeismicBMPOAProblem
    properties
        suite
        S
        storyHeights
        cfg
        nVar = 4
        decisionType = 'mixed-discrete-continuous'
        name = 'MDOF building + provisional IFD + real earthquake suite'
        sourceCommit = '4285e71ee8a4d7e0bef7db142b5296a310ba17c2'
    end
    methods
        function obj = IFDSeismicBMPOAProblem(suite,S,storyHeights,cfg)
            if isempty(suite)
                error('IFDSeismicBMPOAProblem:EmptySuite','Real-record suite is empty.');
            end
            if numel(storyHeights) ~= S.n
                error('IFDSeismicBMPOAProblem:StoryHeights','storyHeights must contain one value per floor.');
            end
            obj.suite=suite; obj.S=S; obj.storyHeights=storyHeights(:); obj.cfg=cfg;
        end
        function bounds = getBounds(obj)
            opt=obj.cfg.optimization;
            bounds.lb=[1,opt.b_bounds(1),opt.Fc_bounds(1),opt.c_bounds(1)];
            bounds.ub=[obj.S.n,opt.b_bounds(2),opt.Fc_bounds(2),opt.c_bounds(2)];
        end
        function x = projectDecision(obj,x)
            bounds=obj.getBounds(); x=reshape(x,1,[]);
            if numel(x)~=obj.nVar, error('Expected %d design variables.',obj.nVar); end
            x=max(bounds.lb,min(bounds.ub,x)); x(1)=min(obj.S.n,max(1,round(x(1))));
        end
        function [f,g,info]=evaluate(obj,x)
            x=obj.projectDecision(x);
            R=evaluate_ifd_candidate_suite(x,obj.suite,obj.S,obj.storyHeights,obj.cfg);
            f=R.Jraw; g=R.violation;
            info=struct();
            info.isFeasible=isfinite(f)&&isfinite(g)&&g<=1e-12;
            info.nLoadCases=R.nRecords;
            info.modalAnalysisPerformed=false;
            info.maxDriftRatio=max(R.drift_ratio);
            info.maxAccelerationRatio=max(R.acc_ratio);
            info.maxDeviceForceRatio=max(R.force_ratio);
            info.meanRatios=R.mean_ratios; info.worstRatios=R.worst_ratios;
            info.deviceStory=R.story; info.deviceParameters=R.params;
            info.dissipatedEnergy=R.dissipated_energy; info.recordIds=R.record_ids;
            info.robustWeight=R.robust_weight; info.objectiveRaw=R.Jraw;
            info.constraintViolation=R.violation; info.provisionalIFD=true;
            info.targetReference='Hu et al. 2026, DOI 10.1016/j.soildyn.2026.110650';
        end
    end
end
