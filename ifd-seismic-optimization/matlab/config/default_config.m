function cfg=default_config()
cfg.model=struct('b',1500,'c',2e3,'Fc',2.5e4,'v0',1e-3,'k0',0);
cfg.mdof.n=6;cfg.mdof.masses=2e5*ones(6,1);cfg.mdof.story_stiffness=1.8e8*ones(6,1);cfg.mdof.story_heights=3.2*ones(6,1);cfg.mdof.zeta=0.05;
cfg.optimization.b_bounds=[0 6000];cfg.optimization.Fc_bounds=[0 1.5e5];cfg.optimization.c_bounds=[0 2e4];
cfg.optimization.drift_limit=0.02;cfg.optimization.device_force_limit=4e5;cfg.optimization.acc_ref=0.5*9.81;cfg.optimization.b_ref=6000;
cfg.optimization.w_drift=0.50;cfg.optimization.w_acc=0.25;cfg.optimization.w_force=0.15;cfg.optimization.w_inertance=0.10;cfg.optimization.penalty=100;
end
