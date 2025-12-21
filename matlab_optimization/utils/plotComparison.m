function plotComparison(results, algorithmNames)
    % Plot comparison of optimization algorithms
    % Input:
    %   results - cell array of result structures
    %   algorithmNames - cell array of algorithm names

    nAlgorithms = length(results);

    % Create figure with subplots
    figure('Position', [100, 100, 1400, 900]);

    % Plot 1: Convergence curves
    subplot(2, 2, 1);
    hold on;
    colors = lines(nAlgorithms);
    legendEntries = cell(nAlgorithms, 1);

    for i = 1:nAlgorithms
        plot(results{i}.convergence, 'LineWidth', 2, 'Color', colors(i, :));
        legendEntries{i} = sprintf('%s (%.2f)', algorithmNames{i}, results{i}.bestFit);
    end

    xlabel('Iteration', 'FontSize', 12);
    ylabel('Best Fitness', 'FontSize', 12);
    title('Convergence Comparison', 'FontSize', 14, 'FontWeight', 'bold');
    legend(legendEntries, 'Location', 'best', 'FontSize', 10);
    grid on;
    hold off;

    % Plot 2: Final fitness comparison (bar chart)
    subplot(2, 2, 2);
    finalFitness = zeros(nAlgorithms, 1);
    for i = 1:nAlgorithms
        finalFitness(i) = results{i}.bestFit;
    end

    bar(finalFitness, 'FaceColor', [0.2, 0.6, 0.8]);
    set(gca, 'XTickLabel', algorithmNames, 'FontSize', 10);
    xtickangle(45);
    ylabel('Best Fitness', 'FontSize', 12);
    title('Final Fitness Comparison', 'FontSize', 14, 'FontWeight', 'bold');
    grid on;

    % Add value labels on bars
    for i = 1:nAlgorithms
        text(i, finalFitness(i), sprintf('%.2f', finalFitness(i)), ...
             'HorizontalAlignment', 'center', 'VerticalAlignment', 'bottom', ...
             'FontSize', 9, 'FontWeight', 'bold');
    end

    % Plot 3: Computation time comparison
    subplot(2, 2, 3);
    compTime = zeros(nAlgorithms, 1);
    for i = 1:nAlgorithms
        compTime(i) = results{i}.time;
    end

    bar(compTime, 'FaceColor', [0.8, 0.4, 0.2]);
    set(gca, 'XTickLabel', algorithmNames, 'FontSize', 10);
    xtickangle(45);
    ylabel('Time (seconds)', 'FontSize', 12);
    title('Computation Time Comparison', 'FontSize', 14, 'FontWeight', 'bold');
    grid on;

    % Add value labels on bars
    for i = 1:nAlgorithms
        text(i, compTime(i), sprintf('%.2f s', compTime(i)), ...
             'HorizontalAlignment', 'center', 'VerticalAlignment', 'bottom', ...
             'FontSize', 9, 'FontWeight', 'bold');
    end

    % Plot 4: Performance metrics table
    subplot(2, 2, 4);
    axis off;

    % Create statistics table
    stats = cell(nAlgorithms + 1, 5);
    stats{1, 1} = 'Algorithm';
    stats{1, 2} = 'Best Fitness';
    stats{1, 3} = 'Time (s)';
    stats{1, 4} = 'Iterations';
    stats{1, 5} = 'Rank';

    % Calculate ranks based on fitness
    [~, rankIdx] = sort(finalFitness);
    ranks = zeros(nAlgorithms, 1);
    ranks(rankIdx) = 1:nAlgorithms;

    for i = 1:nAlgorithms
        stats{i+1, 1} = algorithmNames{i};
        stats{i+1, 2} = sprintf('%.4f', results{i}.bestFit);
        stats{i+1, 3} = sprintf('%.2f', results{i}.time);
        stats{i+1, 4} = sprintf('%d', length(results{i}.convergence));
        stats{i+1, 5} = sprintf('%d', ranks(i));
    end

    % Display table
    tablePos = [0.1, 0.1, 0.8, 0.8];
    uitable('Data', stats(2:end, :), 'ColumnName', stats(1, :), ...
            'Units', 'normalized', 'Position', tablePos, ...
            'FontSize', 10, 'RowName', []);

    % Overall title
    sgtitle('Metaheuristic Algorithms Comparison for Steel Structure Optimization', ...
            'FontSize', 16, 'FontWeight', 'bold');

    % Save figure
    saveas(gcf, 'optimization_comparison.png');
    fprintf('\nComparison plot saved as: optimization_comparison.png\n');
end
