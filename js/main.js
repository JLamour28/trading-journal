/**
 * Main Application Controller
 * Handles dashboard functionality and user interactions
 */

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Initialize mobile menu
  initializeMobileMenu();

  // Load and display dashboard data
  loadDashboardData();

  // Initialize event listeners
  initializeEventListeners();

  // Set up auto-refresh
  setupAutoRefresh();

  console.log("Trading Journal Dashboard initialized");
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !mobileMenuToggle.contains(event.target) &&
        !navMenu.contains(event.target)
      ) {
        navMenu.classList.remove("active");
      }
    });
  }
}

/**
 * Load and display dashboard data
 */
function loadDashboardData() {
  try {
    const trades = tradeManager.getAllTrades();
    const performance = tradeManager.getPerformanceSummary(trades);

    // Update key metrics
    updateKeyMetrics(performance);

    // Update quick stats
    updateQuickStats(performance);

    // Update recent trades
    updateRecentTrades(trades);

    // Initialize charts
    initializeCharts(trades);

    // Show/hide empty states
    toggleEmptyStates(trades.length);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showErrorMessage("Failed to load dashboard data. Please refresh the page.");
  }
}

/**
 * Update key metrics display
 */
function updateKeyMetrics(performance) {
  // Total P&L
  const totalPLElement = document.getElementById("totalPL");
  if (totalPLElement) {
    totalPLElement.textContent = formatCurrency(performance.netProfit);
    totalPLElement.className = `metric-value ${
      performance.netProfit >= 0 ? "positive" : "negative"
    }`;
  }

  // P&L Change
  const plChangeElement = document.getElementById("plChange");
  if (plChangeElement) {
    const changePercent =
      performance.netProfit !== 0
        ? ((performance.netProfit / 10000) * 100).toFixed(2)
        : 0;
    plChangeElement.textContent = `${
      changePercent >= 0 ? "+" : ""
    }${changePercent}%`;
    plChangeElement.className = `metric-change ${
      changePercent >= 0 ? "positive" : "negative"
    }`;
  }

  // Win Rate
  const winRateElement = document.getElementById("winRate");
  if (winRateElement) {
    winRateElement.textContent = `${performance.winRate.toFixed(1)}%`;
  }

  // Win Rate Change
  const winRateChangeElement = document.getElementById("winRateChange");
  if (winRateChangeElement) {
    winRateChangeElement.textContent = `${performance.totalTrades} trades`;
  }

  // Profit Factor
  const profitFactorElement = document.getElementById("profitFactor");
  if (profitFactorElement) {
    profitFactorElement.textContent = performance.profitFactor.toFixed(2);
  }

  // Profit Factor Change
  const profitFactorChangeElement =
    document.getElementById("profitFactorChange");
  if (profitFactorChangeElement) {
    let status = "Neutral";
    if (performance.profitFactor > 2) status = "Excellent";
    else if (performance.profitFactor > 1.5) status = "Good";
    else if (performance.profitFactor < 1) status = "Poor";
    profitFactorChangeElement.textContent = status;
  }

  // Total Trades
  const totalTradesElement = document.getElementById("totalTrades");
  if (totalTradesElement) {
    totalTradesElement.textContent = performance.totalTrades;
  }

  // Current Streak
  const currentStreakElement = document.getElementById("currentStreak");
  if (currentStreakElement) {
    const streak = performance.currentStreak;
    if (streak > 0) {
      currentStreakElement.textContent = `${streak}W streak`;
      currentStreakElement.className = "metric-change positive";
    } else if (streak < 0) {
      currentStreakElement.textContent = `${Math.abs(streak)}L streak`;
      currentStreakElement.className = "metric-change negative";
    } else {
      currentStreakElement.textContent = "No streak";
      currentStreakElement.className = "metric-change";
    }
  }
}

/**
 * Update quick stats display
 */
function updateQuickStats(performance) {
  // Average Win
  const avgWinElement = document.getElementById("avgWin");
  if (avgWinElement) {
    avgWinElement.textContent = formatCurrency(performance.averageWin);
  }

  // Average Loss
  const avgLossElement = document.getElementById("avgLoss");
  if (avgLossElement) {
    avgLossElement.textContent = formatCurrency(
      Math.abs(performance.averageLoss)
    );
  }

  // Largest Win
  const largestWinElement = document.getElementById("largestWin");
  if (largestWinElement) {
    largestWinElement.textContent = formatCurrency(performance.largestWin);
  }

  // Largest Loss
  const largestLossElement = document.getElementById("largestLoss");
  if (largestLossElement) {
    largestLossElement.textContent = formatCurrency(
      Math.abs(performance.largestLoss)
    );
  }

  // Average R:R
  const avgRRElement = document.getElementById("avgRR");
  if (avgRRElement) {
    avgRRElement.textContent = `${performance.averageRiskReward.toFixed(2)}:1`;
  }

  // Max Drawdown
  const maxDrawdownElement = document.getElementById("maxDrawdown");
  if (maxDrawdownElement) {
    const drawdownPercent = tradeCalculator.calculateMaxDrawdownPercent(
      tradeManager.getAllTrades()
    );
    maxDrawdownElement.textContent = `${drawdownPercent.toFixed(2)}%`;
  }
}

/**
 * Update recent trades display
 */
function updateRecentTrades(trades) {
  const recentTradesElement = document.getElementById("recentTrades");
  if (!recentTradesElement) return;

  // Get 5 most recent trades
  const recentTrades = trades
    .filter((trade) => trade.status === "closed")
    .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate))
    .slice(0, 5);

  if (recentTrades.length === 0) {
    recentTradesElement.innerHTML = `
            <div class="no-trades">
                <i class="fas fa-inbox"></i>
                <p>No trades yet. Start by adding your first trade!</p>
                <a href="pages/add-trade.html" class="btn btn-primary">Add Trade</a>
            </div>
        `;
    return;
  }

  const tradesHTML = recentTrades
    .map(
      (trade) => `
        <div class="trade-item">
            <div class="trade-info">
                <div class="trade-symbol">${trade.symbol}</div>
                <div class="trade-details">
                    ${
                      trade.direction.charAt(0).toUpperCase() +
                      trade.direction.slice(1)
                    } • 
                    ${
                      trade.assetType.charAt(0).toUpperCase() +
                      trade.assetType.slice(1)
                    } • 
                    ${formatDate(trade.exitDate)}
                </div>
            </div>
            <div class="trade-pnl ${
              trade.profitLoss >= 0 ? "positive" : "negative"
            }">
                ${trade.profitLoss >= 0 ? "+" : ""}${formatCurrency(
        trade.profitLoss
      )}
            </div>
        </div>
    `
    )
    .join("");

  recentTradesElement.innerHTML = tradesHTML;
}

/**
 * Initialize charts
 */
function initializeCharts(trades) {
  // Equity Curve
  chartRenderer.createEquityCurve("equityCurve", trades);

  // Monthly P&L
  chartRenderer.createMonthlyPnLChart("pnlChart", trades);

  // Win Rate by Asset Type
  chartRenderer.createAssetWinRateChart("assetWinRate", trades);
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Equity time range selector
  const equityTimeRange = document.getElementById("equityTimeRange");
  if (equityTimeRange) {
    equityTimeRange.addEventListener("change", function () {
      const trades = tradeManager.getAllTrades();
      const filteredTrades = filterTradesByTimeRange(trades, this.value);
      chartRenderer.createEquityCurve("equityCurve", filteredTrades);
    });
  }

  // Window resize for charts
  window.addEventListener("resize", function () {
    chartRenderer.resizeAllCharts();
  });

  // Navigation active state
  updateNavigationActiveState();
}

/**
 * Filter trades by time range
 */
function filterTradesByTimeRange(trades, timeRange) {
  if (timeRange === "ALL") return trades;

  const now = new Date();
  let startDate;

  switch (timeRange) {
    case "1M":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      break;
    case "3M":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      );
      break;
    case "6M":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
      break;
    case "1Y":
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      break;
    default:
      return trades;
  }

  return trades.filter((trade) => new Date(trade.entryDate) >= startDate);
}

/**
 * Toggle chart type
 */
function toggleChartType(canvasId) {
  const chart = chartRenderer.getChart(canvasId);
  if (!chart) return;

  const currentType = chart.config.type;
  const newType = currentType === "bar" ? "line" : "bar";

  const trades = tradeManager.getAllTrades();

  if (canvasId === "pnlChart") {
    chartRenderer.createMonthlyPnLChart(canvasId, trades, newType);
  }
}

/**
 * Update navigation active state
 */
function updateNavigationActiveState() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (
      link.getAttribute("href") === currentPath ||
      (currentPath.endsWith("/") && link.getAttribute("href") === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

/**
 * Toggle empty states
 */
function toggleEmptyStates(tradeCount) {
  const emptyStates = document.querySelectorAll(".empty-state");

  emptyStates.forEach((element) => {
    if (tradeCount === 0) {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });
}

/**
 * Setup auto-refresh
 */
function setupAutoRefresh() {
  // Refresh dashboard every 5 minutes
  setInterval(() => {
    loadDashboardData();
  }, 5 * 60 * 1000);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date time
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  showNotification(message, "success");
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  showNotification(message, "error");
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add to page
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle";
    case "error":
      return "fa-exclamation-circle";
    case "warning":
      return "fa-exclamation-triangle";
    default:
      return "fa-info-circle";
  }
}

/**
 * Export dashboard data
 */
function exportDashboardData() {
  try {
    const trades = tradeManager.getAllTrades();
    const csvContent = tradeManager.exportToCSV(trades);

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trading-journal-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();

    window.URL.revokeObjectURL(url);
    showSuccessMessage("Dashboard data exported successfully");
  } catch (error) {
    console.error("Error exporting data:", error);
    showErrorMessage("Failed to export data");
  }
}

/**
 * Add sample data for testing
 */
function addSampleData() {
  const sampleTrades = [
    {
      assetType: "stocks",
      symbol: "AAPL",
      direction: "long",
      status: "closed",
      positionSize: 100,
      entryPrice: 150.25,
      entryDate: "2024-01-15T09:30:00Z",
      exitPrice: 155.5,
      exitDate: "2024-01-16T14:25:00Z",
      commission: 5.0,
      stopLoss: 148.0,
      takeProfit: 155.0,
      accountSize: 10000,
      strategy: "Momentum Breakout",
      rationale: "Strong volume breakout above resistance level",
      emotionalState: "calm",
      marketConditions: "trending",
      rating: 4,
    },
    {
      assetType: "crypto",
      symbol: "BTC/USD",
      direction: "long",
      status: "closed",
      positionSize: 0.5,
      entryPrice: 42150,
      entryDate: "2024-01-14T10:15:00Z",
      exitPrice: 42800,
      exitDate: "2024-01-15T16:30:00Z",
      commission: 25.0,
      stopLoss: 41000,
      takeProfit: 43000,
      accountSize: 10000,
      strategy: "Trend Following",
      rationale: "Breakout above key resistance",
      emotionalState: "calm",
      marketConditions: "trending",
      rating: 5,
    },
    {
      assetType: "forex",
      symbol: "EUR/USD",
      direction: "short",
      status: "closed",
      positionSize: 10000,
      entryPrice: 1.085,
      entryDate: "2024-01-13T08:00:00Z",
      exitPrice: 1.089,
      exitDate: "2024-01-13T14:30:00Z",
      commission: 7.0,
      stopLoss: 1.087,
      takeProfit: 1.082,
      accountSize: 10000,
      strategy: "Mean Reversion",
      rationale: "Overbought conditions at resistance",
      emotionalState: "anxious",
      marketConditions: "ranging",
      rating: 2,
    },
  ];

  try {
    sampleTrades.forEach((trade) => {
      tradeManager.addTrade(trade);
    });

    loadDashboardData();
    showSuccessMessage("Sample data added successfully");
  } catch (error) {
    console.error("Error adding sample data:", error);
    showErrorMessage("Failed to add sample data");
  }
}

// Global functions for HTML onclick handlers
window.toggleChartType = toggleChartType;
window.exportDashboardData = exportDashboardData;
window.addSampleData = addSampleData;
