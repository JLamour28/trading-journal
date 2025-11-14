/**
 * Trade List Page JavaScript
 * Handles trade display, filtering, and management
 */

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeTradeList();
});

/**
 * Initialize trade list
 */
function initializeTradeList() {
  // Initialize mobile menu
  initializeMobileMenu();

  // Load and display trades
  loadTrades();

  // Initialize event listeners
  initializeEventListeners();

  // Load strategies for filter
  loadStrategies();

  console.log("Trade List initialized");
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(applyFilters, 300));
  }

  // Filter selects
  const filterSelects = [
    "assetTypeFilter",
    "statusFilter",
    "profitabilityFilter",
    "strategyFilter",
    "sortBy",
  ];
  filterSelects.forEach((selectId) => {
    const select = document.getElementById(selectId);
    if (select) {
      select.addEventListener("change", applyFilters);
    }
  });

  // Date inputs
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  if (startDate) startDate.addEventListener("change", applyFilters);
  if (endDate) endDate.addEventListener("change", applyFilters);
}

/**
 * Load and display trades
 */
function loadTrades() {
  try {
    const trades = tradeManager.getAllTrades();
    const filteredTrades = applyCurrentFilters(trades);

    displayTrades(filteredTrades);
    updateTradeStats(filteredTrades);
    updatePagination(filteredTrades);
  } catch (error) {
    console.error("Error loading trades:", error);
    showErrorMessage("Failed to load trades");
  }
}

/**
 * Apply current filters
 */
function applyCurrentFilters(trades) {
  const filters = getCurrentFilters();
  return tradeManager.getFilteredTrades({ ...filters, trades });
}

/**
 * Get current filter values
 */
function getCurrentFilters() {
  return {
    search: document.getElementById("searchInput")?.value || "",
    assetType: document.getElementById("assetTypeFilter")?.value || "all",
    status: document.getElementById("statusFilter")?.value || "all",
    profitability:
      document.getElementById("profitabilityFilter")?.value || "all",
    strategy: document.getElementById("strategyFilter")?.value || "all",
    sortBy: document.getElementById("sortBy")?.value || "date",
    startDate: document.getElementById("startDate")?.value || "",
    endDate: document.getElementById("endDate")?.value || "",
  };
}

/**
 * Display trades in table
 */
function displayTrades(trades) {
  const tbody = document.getElementById("tradesTableBody");
  const emptyState = document.getElementById("emptyState");
  const tableContainer = document.querySelector(".table-container");

  if (!tbody) return;

  if (trades.length === 0) {
    tbody.innerHTML = "";
    if (tableContainer) tableContainer.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (tableContainer) tableContainer.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  const tradesHTML = trades
    .map(
      (trade) => `
        <tr class="trade-row" data-trade-id="${trade.id}">
            <td>${formatDate(trade.entryDate)}</td>
            <td>
                <span class="symbol-badge ${trade.assetType}">
                    ${trade.symbol}
                </span>
            </td>
            <td>${
              trade.assetType.charAt(0).toUpperCase() + trade.assetType.slice(1)
            }</td>
            <td>
                <span class="direction-badge ${trade.direction}">
                    <i class="fas fa-arrow-${
                      trade.direction === "long" ? "up" : "down"
                    }"></i>
                    ${
                      trade.direction.charAt(0).toUpperCase() +
                      trade.direction.slice(1)
                    }
                </span>
            </td>
            <td>$${trade.entryPrice.toFixed(2)}</td>
            <td>${trade.exitPrice ? "$" + trade.exitPrice.toFixed(2) : "-"}</td>
            <td>${trade.positionSize}</td>
            <td class="${trade.profitLoss >= 0 ? "positive" : "negative"}">
                ${trade.profitLoss >= 0 ? "+" : ""}$${Math.abs(
        trade.profitLoss
      ).toFixed(2)}
            </td>
            <td>${
              trade.riskRewardRatio
                ? trade.riskRewardRatio.toFixed(2) + ":1"
                : "-"
            }</td>
            <td>
                <span class="status-badge ${trade.status}">
                    ${
                      trade.status.charAt(0).toUpperCase() +
                      trade.status.slice(1)
                    }
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewTrade('${
                      trade.id
                    }')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editTrade('${
                      trade.id
                    }')" title="Edit Trade">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTrade('${
                      trade.id
                    }')" title="Delete Trade">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");

  tbody.innerHTML = tradesHTML;
}

/**
 * Update trade statistics
 */
function updateTradeStats(trades) {
  const performance = tradeManager.getPerformanceSummary(trades);

  // Update filtered trades count
  const countElement = document.getElementById("filteredTradesCount");
  if (countElement) {
    countElement.textContent = trades.length;
  }

  // Update total P&L
  const plElement = document.getElementById("filteredTotalPL");
  if (plElement) {
    plElement.textContent = formatCurrency(performance.netProfit);
    plElement.className = `stat-value ${
      performance.netProfit >= 0 ? "positive" : "negative"
    }`;
  }

  // Update win rate
  const winRateElement = document.getElementById("filteredWinRate");
  if (winRateElement) {
    winRateElement.textContent = performance.winRate.toFixed(1) + "%";
  }

  // Update average R:R
  const avgRRElement = document.getElementById("filteredAvgRR");
  if (avgRRElement) {
    avgRRElement.textContent = performance.averageRiskReward.toFixed(2) + ":1";
  }
}

/**
 * Update pagination
 */
function updatePagination(trades) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  // For now, show all trades without pagination
  // TODO: Implement pagination if needed for large datasets
  pagination.innerHTML = "";
}

/**
 * Apply filters
 */
function applyFilters() {
  loadTrades();
}

/**
 * Clear filters
 */
function clearFilters() {
  // Reset all filter inputs
  document.getElementById("searchInput").value = "";
  document.getElementById("assetTypeFilter").value = "all";
  document.getElementById("statusFilter").value = "all";
  document.getElementById("profitabilityFilter").value = "all";
  document.getElementById("strategyFilter").value = "all";
  document.getElementById("sortBy").value = "date";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";

  // Reload trades
  loadTrades();
}

/**
 * Toggle filters visibility
 */
function toggleFilters() {
  const filtersContent = document.getElementById("filtersContent");
  const filterToggle = document.getElementById("filterToggle");

  if (filtersContent && filterToggle) {
    const isVisible = filtersContent.style.display !== "none";
    filtersContent.style.display = isVisible ? "none" : "block";
    filterToggle.className = isVisible
      ? "fas fa-chevron-down"
      : "fas fa-chevron-up";
  }
}

/**
 * View trade details
 */
function viewTrade(tradeId) {
  try {
    const trade = tradeManager.getTrade(tradeId);
    showTradeModal(trade);
  } catch (error) {
    console.error("Error viewing trade:", error);
    showErrorMessage("Failed to load trade details");
  }
}

/**
 * Edit trade
 */
function editTrade(tradeId) {
  // Redirect to add trade page with trade ID for editing
  window.location.href = `add-trade.html?edit=${tradeId}`;
}

/**
 * Delete trade
 */
function deleteTrade(tradeId) {
  if (
    !confirm(
      "Are you sure you want to delete this trade? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    tradeManager.deleteTrade(tradeId);
    loadTrades();
    showSuccessMessage("Trade deleted successfully");
  } catch (error) {
    console.error("Error deleting trade:", error);
    showErrorMessage("Failed to delete trade");
  }
}

/**
 * Show trade modal
 */
function showTradeModal(trade) {
  const modal = document.getElementById("tradeModal");
  const modalBody = document.getElementById("tradeModalBody");
  const editBtn = document.getElementById("editTradeBtn");

  if (!modal || !modalBody) return;

  const modalHTML = `
        <div class="trade-detail-grid">
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-row">
                    <span class="label">Symbol:</span>
                    <span class="value">${trade.symbol}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Asset Type:</span>
                    <span class="value">${
                      trade.assetType.charAt(0).toUpperCase() +
                      trade.assetType.slice(1)
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Direction:</span>
                    <span class="value">${
                      trade.direction.charAt(0).toUpperCase() +
                      trade.direction.slice(1)
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">${
                      trade.status.charAt(0).toUpperCase() +
                      trade.status.slice(1)
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Rating:</span>
                    <span class="value">${generateStarRating(
                      trade.rating || 0
                    )}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Position Details</h4>
                <div class="detail-row">
                    <span class="label">Position Size:</span>
                    <span class="value">${trade.positionSize}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Entry Price:</span>
                    <span class="value">$${trade.entryPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Entry Date:</span>
                    <span class="value">${formatDateTime(
                      trade.entryDate
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Exit Price:</span>
                    <span class="value">${
                      trade.exitPrice ? "$" + trade.exitPrice.toFixed(2) : "-"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Exit Date:</span>
                    <span class="value">${
                      trade.exitDate ? formatDateTime(trade.exitDate) : "-"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Commission:</span>
                    <span class="value">$${(trade.commission || 0).toFixed(
                      2
                    )}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Risk Management</h4>
                <div class="detail-row">
                    <span class="label">Stop Loss:</span>
                    <span class="value">${
                      trade.stopLoss ? "$" + trade.stopLoss.toFixed(2) : "-"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Take Profit:</span>
                    <span class="value">${
                      trade.takeProfit ? "$" + trade.takeProfit.toFixed(2) : "-"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Risk Amount:</span>
                    <span class="value">$${(trade.riskAmount || 0).toFixed(
                      2
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Reward Amount:</span>
                    <span class="value">$${(trade.rewardAmount || 0).toFixed(
                      2
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">R:R Ratio:</span>
                    <span class="value">${
                      trade.riskRewardRatio
                        ? trade.riskRewardRatio.toFixed(2) + ":1"
                        : "-"
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Risk %:</span>
                    <span class="value">${(trade.riskPercent || 0).toFixed(
                      2
                    )}%</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Financial Results</h4>
                <div class="detail-row">
                    <span class="label">Profit/Loss:</span>
                    <span class="value ${
                      trade.profitLoss >= 0 ? "positive" : "negative"
                    }">
                        ${trade.profitLoss >= 0 ? "+" : ""}$${Math.abs(
    trade.profitLoss
  ).toFixed(2)}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">P&L %:</span>
                    <span class="value ${
                      trade.profitLossPercent >= 0 ? "positive" : "negative"
                    }">
                        ${
                          trade.profitLossPercent >= 0 ? "+" : ""
                        }${trade.profitLossPercent.toFixed(2)}%
                    </span>
                </div>
            </div>
            
            ${
              trade.strategy || trade.emotionalState || trade.marketConditions
                ? `
            <div class="detail-section">
                <h4>Trading Context</h4>
                ${
                  trade.strategy
                    ? `
                <div class="detail-row">
                    <span class="label">Strategy:</span>
                    <span class="value">${trade.strategy}</span>
                </div>
                `
                    : ""
                }
                ${
                  trade.emotionalState
                    ? `
                <div class="detail-row">
                    <span class="label">Emotional State:</span>
                    <span class="value">${
                      trade.emotionalState.charAt(0).toUpperCase() +
                      trade.emotionalState.slice(1)
                    }</span>
                </div>
                `
                    : ""
                }
                ${
                  trade.marketConditions
                    ? `
                <div class="detail-row">
                    <span class="label">Market Conditions:</span>
                    <span class="value">${
                      trade.marketConditions.charAt(0).toUpperCase() +
                      trade.marketConditions.slice(1)
                    }</span>
                </div>
                `
                    : ""
                }
            </div>
            `
                : ""
            }
            
            ${
              trade.rationale || trade.exitReason || trade.lessonsLearned
                ? `
            <div class="detail-section full-width">
                <h4>Trade Journal</h4>
                ${
                  trade.rationale
                    ? `
                <div class="detail-row">
                    <span class="label">Rationale:</span>
                    <span class="value">${trade.rationale}</span>
                </div>
                `
                    : ""
                }
                ${
                  trade.exitReason
                    ? `
                <div class="detail-row">
                    <span class="label">Exit Reason:</span>
                    <span class="value">${trade.exitReason}</span>
                </div>
                `
                    : ""
                }
                ${
                  trade.lessonsLearned
                    ? `
                <div class="detail-row">
                    <span class="label">Lessons Learned:</span>
                    <span class="value">${trade.lessonsLearned}</span>
                </div>
                `
                    : ""
                }
            </div>
            `
                : ""
            }
            
            ${
              trade.tags && trade.tags.length > 0
                ? `
            <div class="detail-section full-width">
                <h4>Tags</h4>
                <div class="tags-container">
                    ${trade.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
            </div>
            `
                : ""
            }
        </div>
    `;

  modalBody.innerHTML = modalHTML;

  if (editBtn) {
    editBtn.onclick = () => editTrade(trade.id);
  }

  modal.style.display = "block";
}

/**
 * Close trade modal
 */
function closeTradeModal() {
  const modal = document.getElementById("tradeModal");
  if (modal) {
    modal.style.display = "none";
  }
}

/**
 * Load strategies for filter
 */
function loadStrategies() {
  const strategyFilter = document.getElementById("strategyFilter");
  if (!strategyFilter) return;

  try {
    const trades = tradeManager.getAllTrades();
    const strategies = [
      ...new Set(trades.map((trade) => trade.strategy).filter(Boolean)),
    ];

    // Clear existing options (except "All Strategies")
    while (strategyFilter.children.length > 1) {
      strategyFilter.removeChild(strategyFilter.lastChild);
    }

    // Add strategy options
    strategies.forEach((strategy) => {
      const option = document.createElement("option");
      option.value = strategy;
      option.textContent = strategy;
      strategyFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading strategies:", error);
  }
}

/**
 * Export trades to CSV
 */
function exportTrades() {
  try {
    const filters = getCurrentFilters();
    const filteredTrades = tradeManager.getFilteredTrades(filters);

    if (filteredTrades.length === 0) {
      showErrorMessage("No trades to export");
      return;
    }

    const csvContent = tradeManager.exportToCSV(filteredTrades);

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
    showSuccessMessage("Trades exported successfully");
  } catch (error) {
    console.error("Error exporting trades:", error);
    showErrorMessage("Failed to export trades");
  }
}

/**
 * Generate star rating HTML
 */
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  let starsHTML = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  // Half star
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
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
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initialize mobile menu
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

// Global functions
window.toggleFilters = toggleFilters;
window.clearFilters = clearFilters;
window.applyFilters = applyFilters;
window.viewTrade = viewTrade;
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.closeTradeModal = closeTradeModal;
window.exportTrades = exportTrades;

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("tradeModal");
  if (modal && event.target === modal) {
    closeTradeModal();
  }
});

// Close modal with Escape key
window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeTradeModal();
  }
});
