# A Reproducible Computational Framework for Seismic Optimization of Inerter-Friction-Damper-Controlled Structures

Yousef Bahram Beigi  
PhD Candidate, Civil Engineering (Structures), Islamic Azad University, Iran  
Preprint / software-paper release candidate — v1.0.0-rc1 — 25 September 2026

## Abstract

This paper presents a source-constrained and reproducible computational framework for coupling an inerter-friction-damper (IFD) model to nonlinear seismic response analysis and equal-evaluator-budget metaheuristic optimization. The contribution is intentionally separated from experimental device identification: the framework provides harmonic loading, hysteresis and energy bookkeeping, SDOF and n-story MDOF response analysis, exact effective-mass assembly for inertance, real-record ingestion and transparent scalar scaling, robust multi-record aggregation, and an adapter to a budgeted memetic Pelican Optimization Algorithm (BMPOA). An independent Python reference implementation was executed to verify the structural formulation and software invariants. For the bundled six-story verification model, the first three natural frequencies were 1.1510, 3.3862, and 5.4246 Hz; matrix symmetry, positive effective mass, finite responses, and nonnegative dissipated energy checks all passed. Synthetic motions and a provisional IFD law are used only for software verification and are not interpreted as experimental validation or earthquake-performance evidence. Exact reproduction of the IFD reported by Hu et al. (2026) remains a separate validation stage requiring the source constitutive equations, specimen parameters, experimental curves, and exact energy metric definition.

**Keywords:** inerter friction damper; seismic optimization; structural control; BMPOA; reproducibility; nonlinear dynamics; software verification

## 1. Introduction

Inerters offer an attractive route for amplifying apparent inertia without adding the same magnitude of physical mass, while friction-based devices provide direct energy dissipation. Combining these mechanisms can produce highly nonlinear, frequency-sensitive force–displacement behavior. Hu et al. (2026) reported a full-scale inerter friction damper incorporating a ball-screw inerter and friction energy-dissipation unit, with nonlinear and higher-harmonic hysteretic behavior.

The present work addresses a different scientific need: a computational framework in which source-model identification, numerical verification, structural simulation, and optimization are separated into auditable layers. This prevents a reproducibility failure in which an optimization result appears convincing even though the underlying device law, data provenance, or evaluation budget is uncertain.

## 2. Source-constrained modeling boundary

The target experimental source is Hu et al. (2026), “Study on the mechanical properties of an inerter friction damper,” *Soil Dynamics and Earthquake Engineering* 211, 110650, DOI 10.1016/j.soildyn.2026.110650. Publicly verifiable information supports the device topology, full-scale dynamic testing, nonlinear higher-harmonic response, representative frequency-dependent hysteresis regimes, and the existence of a machine-learning predictor and an energy absorption–dissipation ratio.

However, the complete source constitutive equations, all specimen parameters, reference time histories, and exact mathematical definition of Rp are not included in this release because they have not yet been obtained at sufficient fidelity. Accordingly, the bundled provisional force law is treated only as a development benchmark. No parameter from related inerter papers is silently transferred to the target IFD specimen.

## 3. Computational formulation

### 3.1 Provisional device model and energy bookkeeping

For software verification only, the device force is decomposed into inertial, viscous, regularized Coulomb-friction, and optional stiffness terms:

[
F = bddot{x} + cdot{x} + F_c	anh(dot{x}/v_0) + k_0x.
]

Cycle work is evaluated through (int Fdot{x},dt). Over complete steady cycles, the ideal inerter contribution should approach zero net work, whereas dissipative components should yield nonnegative energy under the adopted sign convention. The exact Rp metric reported by Hu et al. is intentionally not implemented until its source definition is available.

### 3.2 MDOF structural model and exact inertance assembly

An n-story shear building is modeled in coordinates relative to the ground. If an IFD is installed across story (s), a device incidence vector (q) maps floor coordinates to device relative deformation. Moving the inertial contribution to the left-hand side gives

[
(M+bqq^T)ddot{u}+Cdot{u}+Ku+qf_{nl}(x_r,v_r)=-Mr a_g.
]

This formulation avoids treating inertance as an approximate external force. Interstory drift ratios, absolute floor accelerations, peak device force, and dissipated energy are returned for each record.

### 3.3 Multi-record objective and constraints

The current mixed design vector is

[
x=[s,b,F_c,c],
]

where story location (s) is discrete and (b), (F_c), and (c) are continuous. For a record suite, normalized drift, acceleration, and device-force metrics are aggregated using mean and worst-case terms. Constraint violation is kept separate from the raw objective because the dissertation BMPOA applies its own penalty, preventing double penalization.

Real earthquake records are never reconstructed from plotted images and missing selected records are never silently replaced by synthetic motions.

### 3.4 Equal-evaluator-budget BMPOA integration

The framework implements the `getBounds`, `projectDecision`, and `evaluate` interface expected by the dissertation `BudgetedMemeticPelicanOptimization` routine. The locked comparison protocol uses population size 70, an evaluator budget of 35,070, and paired seeds 2026–2030. Core, local-search, restart, and combined local-search/restart variants can therefore be compared under identical evaluator budgets. The current quadratic-interpolation operator is intentionally disabled because the pinned implementation is restricted to pure-discrete sizing, whereas the present IFD problem is mixed discrete–continuous.

## 4. Independent software verification

A separate Python reference implementation was written from the governing equations rather than translated through MATLAB execution. The QA suite uses deterministic synthetic motions solely to test code paths and invariants; these motions are not seismic evidence.

For the six-story verification model:
- first three natural frequencies: 1.1510, 3.3862, 5.4246 Hz;
- M, K, and C symmetry: PASS;
- effective mass positive definite for all six single-story placements: PASS;
- finite response metrics: PASS;
- nonnegative dissipated energy under the provisional dissipative law: PASS.

The synthetic candidate screen is retained as a regression artifact rather than as an optimization result.

## 5. Reproducibility and release engineering

The release contains MATLAB source code, independent Python QA code, machine-readable citation metadata, source-traceability and gate matrices, legal-data placeholders, and a continuous-integration workflow. Third-party earthquake waveforms are not redistributed. The repository is designed so that experimental/source data can be inserted later without changing the optimization API or invalidating the provenance boundary.

## 6. Discussion

The key contribution of the release is methodological separation. A source-model layer can be replaced or recalibrated without changing the structural and optimizer interfaces; a record-suite layer can be changed without altering the device equations; and optimization variants consume the same evaluator budget. This architecture supports reproducibility, ablation, and subsequent surrogate-assisted extensions while making unsupported data transfer visible.

## 7. Limitations and claim boundary

RC1 is not an experimentally validated IFD model and does not provide a final earthquake-performance ranking. The numerical parameters in the default configuration are transparent demonstration values. Synthetic verification records are regression inputs only. Exact reproduction of Hu et al. requires legal access to the complete constitutive model, specimen parameters, experimental curves/time histories, and Rp definition.

## 8. Conclusions

A versioned and independently checked computational framework has been prepared for seismic optimization of IFD-controlled structures. The release provides exact inertance assembly in the effective mass matrix, nonlinear MDOF time-history analysis, robust multi-record metrics, source-safe record handling, and direct integration with an equal-evaluator-budget BMPOA workflow. Independent Python QA passed all declared software invariants and reproduced the expected modal properties of the six-story verification model. These results support immediate release of the framework as methods/software research. Experimental reproduction and structural-performance conclusions remain deliberately separated as subsequent validation stages.

## References

1. Hu, R., Xu, W., Wang, J., Du, X., Huang, X., Guo, Q., Pan, K., Feng, D., & Wang, C. (2026). Study on the mechanical properties of an inerter friction damper. *Soil Dynamics and Earthquake Engineering*, 211, 110650. https://doi.org/10.1016/j.soildyn.2026.110650
2. Hu, R., Wang, J., Xu, W., Du, X., Huang, X., Tian, G., Guo, Q., Pan, K., Zhou, C., Feng, D., & Wang, C. (2026). Study on the Mechanical Properties of a High-Force Inerter Damper: Experimental Investigation. *Structural Control and Health Monitoring*, Article 2991090.
3. Smith, M. C. (2002). Synthesis of mechanical networks: the inerter. *IEEE Transactions on Automatic Control*, 47(10), 1648–1662.

## Release claim checklist

**PASS** — independent software verification completed and archived.  
**PASS** — source provenance separation maintained.  
**PASS** — BMPOA mixed-variable adapter and equal-evaluator accounting implemented.  
**PASS** — synthetic motions explicitly restricted to software verification.  
**PENDING** — exact Hu et al. constitutive equations and specimen parameters.  
**PENDING** — reference experimental curves/time histories and exact Rp definition.  
**PENDING** — locked real-record MATLAB BMPOA study for structural-performance claims.
