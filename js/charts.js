/**
 * Chart Renderer
 * Handles all chart creation and management using Chart.js
 */

class ChartRenderer {
  constructor() {
    this.charts = {};
    this.defaultOptions = this.getDefaultChartOptions();
  }

  /**
   * Get default chart options
   */
  getDefaultChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif",
            },
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    };
  }

  /**
   * Create equity curve chart
   */
  createEquityCurve(canvasId, trades, initialCapital = 10000) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const equityData = tradeCalculator.getEquityCurveData(
      trades,
      initialCapital
    );

    const chartData = {
      labels: equityData.map((point) => {
        const date = new Date(point.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }),
      datasets: [
        {
          label: "Equity Curve",
          data: equityData.map((point) => point.equity),
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: "rgb(79, 70, 229)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        ...this.defaultOptions.scales,
        y: {
          ...this.defaultOptions.scales.y,
          beginAtZero: false,
          ticks: {
            ...this.defaultOptions.scales.y.ticks,
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const change = value - initialCapital;
              const changePercent = ((change / initialCapital) * 100).toFixed(
                2
              );
              return [
                `Equity: $${value.toLocaleString()}`,
                `Change: $${change.toLocaleString()} (${changePercent}%)`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create monthly P&L chart
   */
  createMonthlyPnLChart(canvasId, trades, chartType = "bar") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const monthlyData = tradeCalculator.getMonthlyPerformance(trades);
    const sortedMonths = Object.keys(monthlyData).sort();

    const chartData = {
      labels: sortedMonths.map((month) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }),
      datasets: [
        {
          label: "Monthly P&L",
          data: sortedMonths.map((month) => monthlyData[month].totalPL),
          backgroundColor: sortedMonths.map((month) =>
            monthlyData[month].totalPL >= 0
              ? "rgba(16, 185, 129, 0.8)"
              : "rgba(239, 68, 68, 0.8)"
          ),
          borderColor: sortedMonths.map((month) =>
            monthlyData[month].totalPL >= 0
              ? "rgb(16, 185, 129)"
              : "rgb(239, 68, 68)"
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        ...this.defaultOptions.scales,
        y: {
          ...this.defaultOptions.scales.y,
          ticks: {
            ...this.defaultOptions.scales.y.ticks,
            callback: function (value) {
              return "$" + Math.abs(value).toLocaleString();
            },
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const winRate =
                monthlyData[sortedMonths[context.dataIndex]].winRate;
              return [
                `P&L: ${value >= 0 ? "+" : ""}$${value.toLocaleString()}`,
                `Win Rate: ${winRate.toFixed(1)}%`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create win rate by asset type chart
   */
  createAssetWinRateChart(canvasId, trades) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const assetPerformance = tradeCalculator.getPerformanceByAssetType(trades);
    const assetTypes = Object.keys(assetPerformance).filter(
      (asset) => assetPerformance[asset].totalTrades > 0
    );

    const chartData = {
      labels: assetTypes.map(
        (asset) => asset.charAt(0).toUpperCase() + asset.slice(1)
      ),
      datasets: [
        {
          label: "Win Rate (%)",
          data: assetTypes.map((asset) => assetPerformance[asset].winRate),
          backgroundColor: [
            "rgba(79, 70, 229, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgb(79, 70, 229)",
            "rgb(16, 185, 129)",
            "rgb(245, 158, 11)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        ...this.defaultOptions.scales,
        y: {
          ...this.defaultOptions.scales.y,
          beginAtZero: true,
          max: 100,
          ticks: {
            ...this.defaultOptions.scales.y.ticks,
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const assetType = assetTypes[context.dataIndex];
              const performance = assetPerformance[assetType];
              return [
                `Win Rate: ${performance.winRate.toFixed(1)}%`,
                `Total Trades: ${performance.totalTrades}`,
                `Total P&L: $${performance.totalPL.toLocaleString()}`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create strategy performance chart
   */
  createStrategyPerformanceChart(canvasId, trades) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const strategyPerformance =
      tradeCalculator.getPerformanceByStrategy(trades);
    const strategies = Object.keys(strategyPerformance).filter(
      (strategy) => strategyPerformance[strategy].totalTrades > 0
    );

    const chartData = {
      labels: strategies,
      datasets: [
        {
          label: "Win Rate (%)",
          data: strategies.map(
            (strategy) => strategyPerformance[strategy].winRate
          ),
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderColor: "rgb(79, 70, 229)",
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          label: "Total P&L ($)",
          data: strategies.map(
            (strategy) => strategyPerformance[strategy].totalPL
          ),
          type: "line",
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "rgb(16, 185, 129)",
          yAxisID: "y1",
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        x: {
          ...this.defaultOptions.scales.x,
          ticks: {
            ...this.defaultOptions.scales.x.ticks,
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const strategy = strategies[context.dataIndex];
              const performance = strategyPerformance[strategy];
              if (context.datasetIndex === 0) {
                return `Win Rate: ${performance.winRate.toFixed(1)}%`;
              } else {
                return `Total P&L: $${performance.totalPL.toLocaleString()}`;
              }
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create risk/reward distribution chart
   */
  createRiskRewardChart(canvasId, trades) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const closedTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.riskRewardRatio > 0
    );

    const chartData = {
      datasets: [
        {
          label: "Winning Trades",
          data: closedTrades
            .filter((trade) => trade.profitLoss > 0)
            .map((trade) => ({
              x: trade.riskRewardRatio,
              y: trade.profitLossPercent,
            })),
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          borderColor: "rgb(16, 185, 129)",
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: "Losing Trades",
          data: closedTrades
            .filter((trade) => trade.profitLoss < 0)
            .map((trade) => ({
              x: trade.riskRewardRatio,
              y: trade.profitLossPercent,
            })),
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Risk/Reward Ratio",
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        y: {
          title: {
            display: true,
            text: "Profit/Loss (%)",
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const trade = closedTrades[context.dataIndex];
              return [
                `R:R Ratio: ${trade.riskRewardRatio.toFixed(2)}:1`,
                `P&L: ${trade.profitLossPercent.toFixed(2)}%`,
                `Symbol: ${trade.symbol}`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "scatter",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create trade frequency chart
   */
  createTradeFrequencyChart(canvasId, trades) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const frequencyAnalysis = tradeCalculator.getTradeFrequencyAnalysis(trades);
    const dayData = frequencyAnalysis.dayOfWeekDistribution;

    const chartData = {
      labels: dayData.map((day) => day.day),
      datasets: [
        {
          label: "Trades per Day",
          data: dayData.map((day) => day.count),
          backgroundColor: "rgba(79, 70, 229, 0.8)",
          borderColor: "rgb(79, 70, 229)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        ...this.defaultOptions.scales,
        y: {
          ...this.defaultOptions.scales.y,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const day = dayData[context.dataIndex];
              return [
                `Trades: ${day.count}`,
                `Percentage: ${day.percentage.toFixed(1)}%`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Create emotional state performance chart
   */
  createEmotionalStateChart(canvasId, trades) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const emotionalPerformance =
      tradeCalculator.getPerformanceByEmotionalState(trades);
    const emotionalStates = Object.keys(emotionalPerformance).filter(
      (state) => emotionalPerformance[state].totalTrades > 0
    );

    const chartData = {
      labels: emotionalStates.map(
        (state) => state.charAt(0).toUpperCase() + state.slice(1)
      ),
      datasets: [
        {
          label: "Win Rate (%)",
          data: emotionalStates.map(
            (state) => emotionalPerformance[state].winRate
          ),
          backgroundColor: emotionalStates.map((state) => {
            const winRate = emotionalPerformance[state].winRate;
            if (winRate >= 70) return "rgba(16, 185, 129, 0.8)";
            if (winRate >= 50) return "rgba(245, 158, 11, 0.8)";
            return "rgba(239, 68, 68, 0.8)";
          }),
          borderColor: emotionalStates.map((state) => {
            const winRate = emotionalPerformance[state].winRate;
            if (winRate >= 70) return "rgb(16, 185, 129)";
            if (winRate >= 50) return "rgb(245, 158, 11)";
            return "rgb(239, 68, 68)";
          }),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };

    const options = {
      ...this.defaultOptions,
      scales: {
        ...this.defaultOptions.scales,
        y: {
          ...this.defaultOptions.scales.y,
          beginAtZero: true,
          max: 100,
          ticks: {
            ...this.defaultOptions.scales.y.ticks,
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
      plugins: {
        ...this.defaultOptions.plugins,
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          callbacks: {
            label: function (context) {
              const state = emotionalStates[context.dataIndex];
              const performance = emotionalPerformance[state];
              return [
                `Win Rate: ${performance.winRate.toFixed(1)}%`,
                `Total Trades: ${performance.totalTrades}`,
                `Total P&L: $${performance.totalPL.toLocaleString()}`,
              ];
            },
          },
        },
      },
    };

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: options,
    });

    return this.charts[canvasId];
  }

  /**
   * Update chart with new data
   */
  updateChart(canvasId, newData) {
    if (!this.charts[canvasId]) return false;

    this.charts[canvasId].data = newData;
    this.charts[canvasId].update();
    return true;
  }

  /**
   * Destroy chart
   */
  destroyChart(canvasId) {
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
      delete this.charts[canvasId];
      return true;
    }
    return false;
  }

  /**
   * Destroy all charts
   */
  destroyAllCharts() {
    Object.keys(this.charts).forEach((canvasId) => {
      this.destroyChart(canvasId);
    });
  }

  /**
   * Resize all charts
   */
  resizeAllCharts() {
    Object.values(this.charts).forEach((chart) => {
      chart.resize();
    });
  }

  /**
   * Get chart instance
   */
  getChart(canvasId) {
    return this.charts[canvasId] || null;
  }

  /**
   * Export chart as image
   */
  exportChartAsImage(canvasId, filename = "chart.png") {
    const chart = this.getChart(canvasId);
    if (!chart) return null;

    const url = chart.toBase64Image();
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();

    return url;
  }
}

// Initialize chart renderer
const chartRenderer = new ChartRenderer();
