# Metaheuristic Optimization for Steel Structures

A comprehensive MATLAB implementation comparing six state-of-the-art metaheuristic optimization algorithms for steel structure design optimization.

## Overview

This project provides a complete framework for comparing different metaheuristic optimization algorithms on structural engineering problems. The implementation uses the classic **10-bar truss problem** as a benchmark, which is a well-known test case in structural optimization.

## Features

- **6 Metaheuristic Algorithms**:
  1. Genetic Algorithm (GA)
  2. Particle Swarm Optimization (PSO)
  3. Differential Evolution (DE)
  4. Simulated Annealing (SA)
  5. Harmony Search (HS)
  6. Teaching-Learning-Based Optimization (TLBO)

- **Complete Steel Structure Problem**:
  - 10-bar truss structural optimization
  - Stress and displacement constraints
  - Direct stiffness method for structural analysis
  - Realistic engineering constraints

- **Comprehensive Analysis**:
  - Convergence comparison plots
  - Performance metrics (fitness, time, iterations)
  - Statistical ranking
  - Constraint verification
  - Results visualization

## Project Structure

```
matlab_optimization/
├── CompareMetaheuristics.m     # Main comparison script
├── RunPelicanTrussTopology.m   # Pelican-based topology optimization
├── algorithms/                  # Optimization algorithms
│   ├── EnhancedPelicanOptimization.m
│   ├── GeneticAlgorithm.m
│   ├── ParticleSwarmOptimization.m
│   ├── DifferentialEvolution.m
│   ├── SimulatedAnnealing.m
│   ├── HarmonySearch.m
│   └── TLBO.m
├── problems/                    # Problem definitions
│   ├── TenBarTruss.m
│   └── TenBarTrussTopology.m
├── utils/                       # Utility functions
│   └── plotComparison.m
└── README.md
```

## Quick Start

### Prerequisites

- MATLAB R2016b or later
- No additional toolboxes required

### Running the Comparison

1. Navigate to the `matlab_optimization` directory in MATLAB:
   ```matlab
   cd matlab_optimization
   ```

2. Run the main comparison script:
   ```matlab
   CompareMetaheuristics
   ```


### Run the Enhanced Pelican Topology Optimizer

For simultaneous **size + topology** optimization of the 10-bar truss, run:

```matlab
RunPelicanTrussTopology
```

This script uses an enhanced Pelican metaheuristic and provides:
- Reproducible execution with random seed 2026
- Active/inactive members and optimized member areas
- Per-member stresses and stress ratios
- Weight, displacement, stability, feasibility, and stiffness conditioning
- Convergence, optimized-topology, and area/stress figures
- CSV summary/member tables and a complete MAT results file in
  `results/pelican_topology/`

3. The script will:
   - Run all 6 algorithms on the 10-bar truss problem
   - Display progress and results for each algorithm
   - Generate comparison plots
   - Save results to `optimization_results.mat`
   - Save comparison figure as `optimization_comparison.png`

## The 10-Bar Truss Problem

### Problem Description

The 10-bar plane truss is a classic benchmark problem in structural optimization:

- **Objective**: Minimize the total weight of the structure
- **Design Variables**: Cross-sectional areas of 10 bars (0.1 - 35.0 in²)
- **Constraints**:
  - Maximum stress in any member: ±25 ksi
  - Maximum displacement at any node: 2.0 inches
- **Material Properties**:
  - Young's modulus: 10,000 ksi
  - Material density: 0.1 lb/in³
- **Loading**: 100 kips downward at nodes 2 and 4

### Structural Configuration

```
     6 -------- 5 -------- 4
     |          |          |
     |          |          |
     |          |          |
     3 -------- 2 -------- 1
```

Fixed supports at nodes 5 and 6.

## Algorithm Details

### 1. Genetic Algorithm (GA)
- **Population Size**: 50
- **Crossover**: Simulated Binary Crossover (SBX)
- **Mutation**: Polynomial mutation
- **Selection**: Tournament selection
- **Elitism**: Preserves top 2 solutions

### 2. Particle Swarm Optimization (PSO)
- **Swarm Size**: 50
- **Inertia Weight**: 0.729
- **Cognitive/Social Parameters**: 1.49445
- **Velocity Limits**: ±20% of search space

### 3. Differential Evolution (DE)
- **Population Size**: 50
- **Strategy**: DE/rand/1
- **Scaling Factor (F)**: 0.5
- **Crossover Rate (CR)**: 0.9

### 4. Simulated Annealing (SA)
- **Initial Temperature**: 100
- **Cooling Rate**: 0.95
- **Iterations per Temperature**: 10
- **Acceptance**: Metropolis criterion

### 5. Harmony Search (HS)
- **Harmony Memory Size**: 30
- **HMCR**: 0.9 (Harmony Memory Consideration Rate)
- **PAR**: 0.3 (Pitch Adjustment Rate)
- **Bandwidth**: 0.01

### 6. Teaching-Learning-Based Optimization (TLBO)
- **Population Size**: 50
- **Teaching Factor**: Random (1 or 2)
- **Two Phases**: Teaching phase + Learning phase
- **Parameter-free**: No algorithm-specific parameters

## Results Interpretation

The comparison script provides:

1. **Convergence Curves**: Shows how each algorithm improves over iterations
2. **Best Fitness Comparison**: Bar chart comparing final solutions
3. **Computation Time**: Time taken by each algorithm
4. **Performance Table**: Detailed metrics and ranking
5. **Constraint Verification**: Checks if the best solution is feasible

### Expected Output

```
========================================
BEST ALGORITHM: [Algorithm Name]
========================================
Best Fitness: XXXX.XX lb
Computation Time: XX.XX seconds
Optimal Design (cross-sectional areas):
  Bar  1: XX.XXXX in^2
  Bar  2: XX.XXXX in^2
  ...
```

## Customization

### Modify Algorithm Parameters

Edit the `commonParams` structure in `CompareMetaheuristics.m`:

```matlab
commonParams.maxIter = 1000;      % Increase iterations
commonParams.popSize = 100;       % Larger population
commonParams.penaltyCoef = 1e7;   % Adjust penalty
```

### Add New Algorithms

1. Create a new algorithm file in `algorithms/` following the template:
   ```matlab
   function [bestSol, bestFit, convergence] = MyAlgorithm(problem, params)
       % Your implementation here
   end
   ```

2. Add the algorithm to the list in `CompareMetaheuristics.m`:
   ```matlab
   algorithms = {
       % ... existing algorithms
       'My Algorithm', @MyAlgorithm;
   };
   ```

### Add New Problems

1. Create a new problem class in `problems/` with:
   - `nVar` property (number of variables)
   - `getBounds()` method (returns lb and ub)
   - `evaluate(x)` method (returns [objective, constraint_violation])

2. Update the problem instantiation in `CompareMetaheuristics.m`:
   ```matlab
   problem = MyNewProblem();
   ```

## Performance Tips

- For quick testing, reduce `maxIter` to 100-200
- For better results, increase `popSize` to 100-200
- Run multiple independent runs and report statistics
- Consider parallel execution for independent algorithm runs

## Common Issues

### Issue: "Out of memory"
**Solution**: Reduce `popSize` or `maxIter`

### Issue: "All algorithms find infeasible solutions"
**Solution**: Increase `penaltyCoef` or check problem formulation

### Issue: "Convergence curves look flat"
**Solution**: Problem might be too easy/hard. Check bounds and constraints.

## References

### Algorithms
1. **GA**: Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization and Machine Learning.
2. **PSO**: Kennedy, J., & Eberhart, R. (1995). Particle swarm optimization.
3. **DE**: Storn, R., & Price, K. (1997). Differential evolution.
4. **SA**: Kirkpatrick, S., et al. (1983). Optimization by simulated annealing.
5. **HS**: Geem, Z. W., et al. (2001). A new heuristic optimization algorithm: Harmony search.
6. **TLBO**: Rao, R. V., et al. (2011). Teaching-learning-based optimization.

### Benchmark Problem
- **10-Bar Truss**: Rajeev, S., & Krishnamoorthy, C. S. (1992). Discrete optimization of structures using genetic algorithms.

## Citation

If you use this code in your research, please cite:

```bibtex
@software{steel_optimization_metaheuristics,
  title = {Metaheuristic Optimization for Steel Structures},
  author = {Claude AI},
  year = {2025},
  url = {https://github.com/yourusername/yourrepo}
}
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests for:
- New optimization algorithms
- Additional benchmark problems
- Performance improvements
- Bug fixes
- Documentation enhancements

## Contact

For questions or suggestions, please open an issue in the repository.

## Acknowledgments

This implementation is based on the original papers of the respective algorithms and uses the classic 10-bar truss problem as a benchmark from structural optimization literature.
