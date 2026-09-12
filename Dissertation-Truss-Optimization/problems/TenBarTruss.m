classdef TenBarTruss
    % TenBarTruss - Classic 10-bar truss optimization problem
    % This is a well-known benchmark problem in structural optimization

    properties
        nVar = 10;          % Number of design variables (bar areas)
        lb = 0.1;           % Lower bound (in^2)
        ub = 35.0;          % Upper bound (in^2)
        E = 10000;          % Young's modulus (ksi)
        rho = 0.1;          % Material density (lb/in^3)
        P = 100;            % Applied load (kips)
        L = 360;            % Length (inches)
        sigmaMax = 25;      % Maximum allowable stress (ksi)
        deltaMax = 2;       % Maximum displacement (inches)
    end

    methods
        function obj = TenBarTruss()
            % Constructor
        end

        function [f, g] = evaluate(obj, A)
            % Evaluate objective function (weight) and constraints
            % Input: A - vector of cross-sectional areas
            % Output: f - weight, g - constraint violations

            % Ensure A is a row vector
            if size(A, 1) > 1
                A = A';
            end

            % Element connectivity and geometry
            nodes = [obj.L*2, 0;
                     obj.L, 0;
                     0, 0;
                     obj.L*2, obj.L;
                     obj.L, obj.L;
                     0, obj.L];

            elements = [3, 5;   % Element 1
                        1, 3;   % Element 2
                        4, 6;   % Element 3
                        2, 4;   % Element 4
                        3, 4;   % Element 5
                        1, 2;   % Element 6
                        4, 5;   % Element 7
                        3, 6;   % Element 8
                        2, 3;   % Element 9
                        1, 4];  % Element 10

            % Calculate element lengths and direction cosines
            nElem = size(elements, 1);
            elemLength = zeros(nElem, 1);
            c = zeros(nElem, 1);  % cos(theta)
            s = zeros(nElem, 1);  % sin(theta)

            for i = 1:nElem
                n1 = elements(i, 1);
                n2 = elements(i, 2);
                dx = nodes(n2, 1) - nodes(n1, 1);
                dy = nodes(n2, 2) - nodes(n1, 2);
                elemLength(i) = sqrt(dx^2 + dy^2);
                c(i) = dx / elemLength(i);
                s(i) = dy / elemLength(i);
            end

            % Objective function: Total weight
            f = sum(obj.rho * A' .* elemLength);

            % Structural analysis using direct stiffness method
            nNodes = size(nodes, 1);
            nDOF = 2 * nNodes;
            K = zeros(nDOF, nDOF);

            % Assemble global stiffness matrix
            for i = 1:nElem
                n1 = elements(i, 1);
                n2 = elements(i, 2);

                k = (obj.E * A(i)) / elemLength(i);

                c2 = c(i)^2;
                s2 = s(i)^2;
                cs = c(i) * s(i);

                ke = k * [c2,  cs, -c2, -cs;
                          cs,  s2, -cs, -s2;
                         -c2, -cs,  c2,  cs;
                         -cs, -s2,  cs,  s2];

                dof = [2*n1-1, 2*n1, 2*n2-1, 2*n2];
                K(dof, dof) = K(dof, dof) + ke;
            end

            % Apply loads (downward loads at nodes 2 and 4)
            F = zeros(nDOF, 1);
            F(4) = -obj.P;   % Node 2, y-direction
            F(8) = -obj.P;   % Node 4, y-direction

            % Apply boundary conditions (nodes 5, 6 are fixed)
            fixedDOFs = [9, 10, 11, 12];
            freeDOFs = setdiff(1:nDOF, fixedDOFs);

            % Solve for displacements
            U = zeros(nDOF, 1);
            U(freeDOFs) = K(freeDOFs, freeDOFs) \ F(freeDOFs);

            % Calculate element stresses
            sigma = zeros(nElem, 1);
            for i = 1:nElem
                n1 = elements(i, 1);
                n2 = elements(i, 2);
                dof = [2*n1-1, 2*n1, 2*n2-1, 2*n2];

                B = (obj.E / elemLength(i)) * [-c(i), -s(i), c(i), s(i)];
                sigma(i) = B * U(dof);
            end

            % Constraint violations
            g = zeros(2*nElem + 1, 1);

            % Stress constraints (tensile and compressive)
            for i = 1:nElem
                g(i) = abs(sigma(i)) / obj.sigmaMax - 1;
            end

            % Displacement constraint (maximum nodal displacement)
            maxDisp = max(abs(U));
            g(2*nElem + 1) = maxDisp / obj.deltaMax - 1;

            % Convert to single constraint value (sum of violations)
            g = sum(max(0, g));
        end

        function bounds = getBounds(obj)
            % Return lower and upper bounds
            bounds.lb = obj.lb * ones(1, obj.nVar);
            bounds.ub = obj.ub * ones(1, obj.nVar);
        end
    end
end
