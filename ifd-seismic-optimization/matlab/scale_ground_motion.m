function [agScaled,info]=scale_ground_motion(t,ag,mode,opts)
pga0=max(abs(ag));
switch lower(mode)
 case 'none',sf=1;
 case 'pga',sf=opts.targetPGA_mps2/pga0;
 case 'spectrum'
  if ~isfield(opts,'zeta'),opts.zeta=0.05;end
  [Sr,~]=response_spectrum_sdof(t,ag,opts.targetPeriods(:),opts.zeta);
  idx=opts.targetPeriods(:)>=opts.periodBand(1)&opts.targetPeriods(:)<=opts.periodBand(2);
  sf=exp(mean(log(opts.targetSa_mps2(idx)./Sr(idx))));
 otherwise,error('mode must be none, pga, or spectrum');
end
agScaled=sf*ag;info=struct('mode',lower(mode),'scaleFactor',sf,'pga_original_mps2',pga0,'pga_scaled_mps2',max(abs(agScaled)));
end
