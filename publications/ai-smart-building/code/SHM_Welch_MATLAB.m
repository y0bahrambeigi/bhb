% Reproducible educational vibration example; NOT a structural-safety check.
% Requires the Signal Processing Toolbox (pwelch, hann).
fs = 100; t = (0:1/fs:180-1/fs)';
rng(20261009); f0 = 1.25;
x = 0.014*sin(2*pi*f0*t) + 0.005*randn(size(t));
x = detrend(x);
[pxx,f] = pwelch(x,hann(2048),1024,4096,fs);
idx = (f >= 0.5) & (f <= 5);
figure; plot(f(idx),10*log10(pxx(idx)),'LineWidth',1.4);
xlabel('Frequency (Hz)'); ylabel('PSD (dB/Hz)');
title('Synthetic vibration: Welch PSD'); grid on;
