(function (root) {
  "use strict";
  const positive = (value, name) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${name} must be positive`);
    return number;
  };

  root.SmartCalc = Object.freeze({
    sdof(mass, period, dampingRatio, frequencyRatio) {
      const m = positive(mass, "mass");
      const T = positive(period, "period");
      const zeta = positive(dampingRatio, "dampingRatio");
      const r = positive(frequencyRatio, "frequencyRatio");
      const omega = 2 * Math.PI / T;
      return {
        omega,
        frequency: 1 / T,
        stiffness: m * omega ** 2,
        damping: 2 * zeta * m * omega,
        magnification: 1 / Math.sqrt((1 - r ** 2) ** 2 + (2 * zeta * r) ** 2),
      };
    },
    baseIsolation(mass, stiffness, dampingRatio) {
      const m = positive(mass, "mass");
      const k = positive(stiffness, "stiffness");
      const zeta = positive(dampingRatio, "dampingRatio");
      const omega = Math.sqrt(k / m);
      return {omega, period: 2 * Math.PI / omega, damping: 2 * zeta * m * omega};
    },
    viscousDamper(coefficient, alpha, velocity) {
      const c = positive(coefficient, "coefficient");
      const exponent = positive(alpha, "alpha");
      const v = Number(velocity);
      if (!Number.isFinite(v)) throw new RangeError("velocity must be finite");
      return c * Math.abs(v) ** exponent * Math.sign(v);
    },
    resonance(accelerationG, period, initialDamping, targetDamping) {
      const ag = positive(accelerationG, "accelerationG") * 9.80665;
      const T = positive(period, "period");
      const z1 = positive(initialDamping, "initialDamping");
      const z2 = positive(targetDamping, "targetDamping");
      const omega = 2 * Math.PI / T;
      const before = ag / (2 * z1 * omega ** 2);
      const after = ag / (2 * z2 * omega ** 2);
      return {omega, before, after, reduction: (1 - after / before) * 100};
    },
  });
})(typeof window === "undefined" ? globalThis : window);
