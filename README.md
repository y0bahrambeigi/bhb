If you use this code in your research, please cite accordingly (see detailed README).

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1234567.svg)](https://doi.org/10.5281/zenodo.1234567)

## Overview

This repository contains a comprehensive MATLAB implementation comparing six state-of-the-art metaheuristic optimization algorithms for steel structure design optimization.

## Features

- **6 Metaheuristic Algorithms**: GA, PSO, DE, SA, HS, TLBO
- **Steel Structure Problem**: 10-bar truss optimization benchmark
- **Complete Analysis**: Convergence plots, performance metrics, statistical ranking
- **Easy to Use**: Simple API for running algorithms and comparing results

## Quick Start

```matlab
cd matlab_optimization
CompareMetaheuristics
```

This will run all 6 algorithms and generate:
- Comparison plots
- Performance metrics
- Best solution with constraint verification

## Algorithms Included

1. **Genetic Algorithm (GA)** - Evolution-inspired optimization
2. **Particle Swarm Optimization (PSO)** - Swarm intelligence
3. **Differential Evolution (DE)** - Population-based evolutionary algorithm
4. **Simulated Annealing (SA)** - Thermodynamic-inspired optimization
5. **Harmony Search (HS)** - Music-inspired algorithm
6. **Teaching-Learning-Based Optimization (TLBO)** - Education-inspired approach

## Documentation

See the [detailed documentation](matlab_optimization/README.md) for:
- Algorithm details and parameters
- Problem formulation
- Customization guide
- Results interpretation
- References

## Project Structure

```
matlab_optimization/
├── CompareMetaheuristics.m     # Main comparison script
├── ExampleUsage.m              # Usage examples
├── algorithms/                  # 6 optimization algorithms
├── problems/                    # 10-bar truss problem
├── utils/                       # Visualization utilities
└── README.md                    # Detailed documentation
```

## Requirements

- MATLAB R2016b or later
- No additional toolboxes required

## Results

The program compares algorithms based on:
- **Convergence speed**: How quickly they find good solutions
- **Solution quality**: Best fitness achieved
- **Computational efficiency**: Time required
- **Constraint satisfaction**: Feasibility of solutions

## License

MIT License

## Citation


## Citation

If you use this software in your research, please cite:

**Yousef Bahram Beigi. Python Learning Studio Ultra. Zenodo.**  
**DOI: 10.5281/zenodo.21960225**
