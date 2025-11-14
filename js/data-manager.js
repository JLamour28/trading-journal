/**
 * Trade Data Manager
 * Handles all CRUD operations for trading journal data
 */

class TradeDataManager {
  constructor() {
    this.storageKey = "tradingJournal_trades";
    this.settingsKey = "tradingJournal_settings";
    this.initializeStorage();
  }

  /**
   * Initialize LocalStorage with default data if empty
   */
  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      this.saveTrades([]);
    }

    if (!localStorage.getItem(this.settingsKey)) {
      this.saveSettings(this.getDefaultSettings());
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      defaultCurrency: "USD",
      riskPerTrade: 2.0,
      accountSize: 10000,
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      defaultTags: ["momentum", "swing", "day-trade"],
      strategies: ["Momentum", "Mean Reversion", "Breakout", "Scalping"],
      emotionalStates: ["Calm", "Anxious", "Greedy", "Fearful", "Neutral"],
      marketConditions: ["Trending", "Ranging", "Volatile", "Quiet"],
    };
  }

  /**
   * Generate unique ID for trades
   */
  generateId() {
    return (
      "trade_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Save trades to LocalStorage
   */
  saveTrades(trades) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(trades));
      return true;
    } catch (error) {
      console.error("Error saving trades:", error);
      return false;
    }
  }

  /**
   * Load trades from LocalStorage
   */
  loadTrades() {
    try {
      const trades = localStorage.getItem(this.storageKey);
      return trades ? JSON.parse(trades) : [];
    } catch (error) {
      console.error("Error loading trades:", error);
      return [];
    }
  }

  /**
   * Save settings to LocalStorage
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  }

  /**
   * Load settings from LocalStorage
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error("Error loading settings:", error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Add a new trade
   */
  addTrade(tradeData) {
    const trades = this.loadTrades();

    // Validate trade data
    const validationErrors = this.validateTrade(tradeData);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(", "));
    }

    // Create new trade object
    const newTrade = {
      id: this.generateId(),
      ...tradeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Calculate derived fields
    newTrade.profitLoss = this.calculateProfitLoss(newTrade);
    newTrade.profitLossPercent = this.calculateProfitLossPercent(newTrade);
    newTrade.riskAmount = this.calculateRiskAmount(newTrade);
    newTrade.rewardAmount = this.calculateRewardAmount(newTrade);
    newTrade.riskRewardRatio = this.calculateRiskRewardRatio(newTrade);
    newTrade.riskPercent = this.calculateRiskPercent(newTrade);

    trades.push(newTrade);
    this.saveTrades(trades);

    return newTrade;
  }

  /**
   * Update an existing trade
   */
  updateTrade(tradeId, updates) {
    const trades = this.loadTrades();
    const index = trades.findIndex((trade) => trade.id === tradeId);

    if (index === -1) {
      throw new Error("Trade not found");
    }

    // Validate updated data
    const validationErrors = this.validateTrade({
      ...trades[index],
      ...updates,
    });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(", "));
    }

    // Update trade
    trades[index] = {
      ...trades[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate derived fields
    trades[index].profitLoss = this.calculateProfitLoss(trades[index]);
    trades[index].profitLossPercent = this.calculateProfitLossPercent(
      trades[index]
    );
    trades[index].riskAmount = this.calculateRiskAmount(trades[index]);
    trades[index].rewardAmount = this.calculateRewardAmount(trades[index]);
    trades[index].riskRewardRatio = this.calculateRiskRewardRatio(
      trades[index]
    );
    trades[index].riskPercent = this.calculateRiskPercent(trades[index]);

    this.saveTrades(trades);
    return trades[index];
  }

  /**
   * Delete a trade
   */
  deleteTrade(tradeId) {
    const trades = this.loadTrades();
    const filteredTrades = trades.filter((trade) => trade.id !== tradeId);

    if (filteredTrades.length === trades.length) {
      throw new Error("Trade not found");
    }

    this.saveTrades(filteredTrades);
    return true;
  }

  /**
   * Get a single trade by ID
   */
  getTrade(tradeId) {
    const trades = this.loadTrades();
    const trade = trades.find((trade) => trade.id === tradeId);

    if (!trade) {
      throw new Error("Trade not found");
    }

    return trade;
  }

  /**
   * Get all trades
   */
  getAllTrades() {
    return this.loadTrades();
  }

  /**
   * Get filtered trades
   */
  getFilteredTrades(filters = {}) {
    let trades = this.loadTrades();

    // Filter by asset type
    if (filters.assetType && filters.assetType !== "all") {
      trades = trades.filter((trade) => trade.assetType === filters.assetType);
    }

    // Filter by status
    if (filters.status && filters.status !== "all") {
      trades = trades.filter((trade) => trade.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      trades = trades.filter((trade) => new Date(trade.entryDate) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      trades = trades.filter((trade) => new Date(trade.entryDate) <= endDate);
    }

    // Filter by profitability
    if (filters.profitability) {
      if (filters.profitability === "profitable") {
        trades = trades.filter((trade) => trade.profitLoss > 0);
      } else if (filters.profitability === "losing") {
        trades = trades.filter((trade) => trade.profitLoss < 0);
      }
    }

    // Filter by strategy
    if (filters.strategy && filters.strategy !== "all") {
      trades = trades.filter((trade) => trade.strategy === filters.strategy);
    }

    // Search by symbol or notes
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      trades = trades.filter(
        (trade) =>
          trade.symbol.toLowerCase().includes(searchTerm) ||
          trade.rationale.toLowerCase().includes(searchTerm) ||
          trade.lessonsLearned.toLowerCase().includes(searchTerm)
      );
    }

    // Sort trades
    if (filters.sortBy) {
      trades.sort((a, b) => {
        switch (filters.sortBy) {
          case "date":
            return new Date(b.entryDate) - new Date(a.entryDate);
          case "symbol":
            return a.symbol.localeCompare(b.symbol);
          case "pnl":
            return b.profitLoss - a.profitLoss;
          case "rr":
            return b.riskRewardRatio - a.riskRewardRatio;
          default:
            return new Date(b.entryDate) - new Date(a.entryDate);
        }
      });
    }

    return trades;
  }

  /**
   * Validate trade data
   */
  validateTrade(trade) {
    const errors = [];

    // Required fields
    if (!trade.assetType) errors.push("Asset type is required");
    if (!trade.symbol || trade.symbol.trim() === "")
      errors.push("Symbol is required");
    if (!trade.direction) errors.push("Direction is required");
    if (!trade.positionSize || trade.positionSize <= 0)
      errors.push("Position size must be greater than 0");
    if (!trade.entryPrice || trade.entryPrice <= 0)
      errors.push("Entry price must be greater than 0");
    if (!trade.entryDate) errors.push("Entry date is required");

    // Optional fields validation
    if (trade.exitPrice && trade.exitPrice <= 0) {
      errors.push("Exit price must be greater than 0");
    }

    if (trade.stopLoss && trade.stopLoss <= 0) {
      errors.push("Stop loss must be greater than 0");
    }

    if (trade.takeProfit && trade.takeProfit <= 0) {
      errors.push("Take profit must be greater than 0");
    }

    // Business logic validation
    if (trade.exitDate && trade.entryDate) {
      const entryDate = new Date(trade.entryDate);
      const exitDate = new Date(trade.exitDate);
      if (exitDate < entryDate) {
        errors.push("Exit date cannot be before entry date");
      }
    }

    // Risk validation
    if (
      trade.accountSize &&
      trade.riskAmount &&
      trade.riskAmount > trade.accountSize
    ) {
      errors.push("Risk amount cannot exceed account size");
    }

    return errors;
  }

  /**
   * Calculate profit/loss
   */
  calculateProfitLoss(trade) {
    if (!trade.exitPrice || trade.status === "open") return 0;

    const priceDiff =
      trade.direction === "long"
        ? trade.exitPrice - trade.entryPrice
        : trade.entryPrice - trade.exitPrice;

    const grossPL = priceDiff * trade.positionSize;
    const netPL = grossPL - (trade.commission || 0);

    return netPL;
  }

  /**
   * Calculate profit/loss percentage
   */
  calculateProfitLossPercent(trade) {
    if (!trade.exitPrice || trade.status === "open") return 0;

    const entryValue = trade.entryPrice * trade.positionSize;
    const netPL = this.calculateProfitLoss(trade);

    return (netPL / entryValue) * 100;
  }

  /**
   * Calculate risk amount
   */
  calculateRiskAmount(trade) {
    if (!trade.stopLoss) return 0;

    const priceRisk =
      trade.direction === "long"
        ? trade.entryPrice - trade.stopLoss
        : trade.stopLoss - trade.entryPrice;

    return priceRisk * trade.positionSize;
  }

  /**
   * Calculate reward amount
   */
  calculateRewardAmount(trade) {
    if (!trade.takeProfit) return 0;

    const priceReward =
      trade.direction === "long"
        ? trade.takeProfit - trade.entryPrice
        : trade.entryPrice - trade.takeProfit;

    return priceReward * trade.positionSize;
  }

  /**
   * Calculate risk/reward ratio
   */
  calculateRiskRewardRatio(trade) {
    const riskAmount = this.calculateRiskAmount(trade);
    const rewardAmount = this.calculateRewardAmount(trade);

    if (riskAmount === 0) return 0;
    return rewardAmount / riskAmount;
  }

  /**
   * Calculate risk percentage
   */
  calculateRiskPercent(trade) {
    const riskAmount = this.calculateRiskAmount(trade);
    const accountSize = trade.accountSize || 10000;

    if (accountSize === 0) return 0;
    return (riskAmount / accountSize) * 100;
  }

  /**
   * Export trades to CSV
   */
  exportToCSV(trades = null) {
    const tradesToExport = trades || this.loadTrades();

    if (tradesToExport.length === 0) {
      throw new Error("No trades to export");
    }

    const headers = [
      "ID",
      "Asset Type",
      "Symbol",
      "Direction",
      "Status",
      "Position Size",
      "Entry Price",
      "Entry Date",
      "Exit Price",
      "Exit Date",
      "Commission",
      "Stop Loss",
      "Take Profit",
      "Profit/Loss",
      "P&L %",
      "Risk Amount",
      "Reward Amount",
      "R:R Ratio",
      "Risk %",
      "Strategy",
      "Emotional State",
      "Market Conditions",
      "Rating",
      "Created At",
      "Updated At",
    ];

    const csvContent = [
      headers.join(","),
      ...tradesToExport.map((trade) =>
        [
          trade.id,
          trade.assetType,
          trade.symbol,
          trade.direction,
          trade.status,
          trade.positionSize,
          trade.entryPrice,
          trade.entryDate,
          trade.exitPrice || "",
          trade.exitDate || "",
          trade.commission || "",
          trade.stopLoss || "",
          trade.takeProfit || "",
          trade.profitLoss || 0,
          trade.profitLossPercent || 0,
          trade.riskAmount || 0,
          trade.rewardAmount || 0,
          trade.riskRewardRatio || 0,
          trade.riskPercent || 0,
          trade.strategy || "",
          trade.emotionalState || "",
          trade.marketConditions || "",
          trade.rating || "",
          trade.createdAt,
          trade.updatedAt,
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Import trades from CSV
   */
  importFromCSV(csvContent) {
    const lines = csvContent.split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file is empty or invalid");
    }

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, ""));
    const trades = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "") continue;

      const values = lines[i].split(",").map((v) => v.replace(/"/g, ""));
      const trade = {};

      headers.forEach((header, index) => {
        const value = values[index];

        // Convert numeric fields
        if (
          [
            "positionSize",
            "entryPrice",
            "exitPrice",
            "commission",
            "stopLoss",
            "takeProfit",
            "profitLoss",
            "profitLossPercent",
            "riskAmount",
            "rewardAmount",
            "riskRewardRatio",
            "riskPercent",
            "rating",
          ].includes(header)
        ) {
          trade[header] = parseFloat(value) || 0;
        } else {
          trade[header] = value;
        }
      });

      // Generate new ID and timestamps
      trade.id = this.generateId();
      trade.createdAt = new Date().toISOString();
      trade.updatedAt = new Date().toISOString();

      trades.push(trade);
    }

    // Validate all trades before importing
    const validationErrors = [];
    trades.forEach((trade, index) => {
      const errors = this.validateTrade(trade);
      if (errors.length > 0) {
        validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
      }
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join("; ")}`);
    }

    // Add trades to existing data
    const existingTrades = this.loadTrades();
    const updatedTrades = [...existingTrades, ...trades];
    this.saveTrades(updatedTrades);

    return trades.length;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(trades = null) {
    const tradesToAnalyze = trades || this.loadTrades();

    if (tradesToAnalyze.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        averageRiskReward: 0,
        maxDrawdown: 0,
        currentStreak: 0,
        bestStreak: 0,
        worstStreak: 0,
      };
    }

    const closedTrades = tradesToAnalyze.filter(
      (trade) => trade.status === "closed"
    );
    const winningTrades = closedTrades.filter((trade) => trade.profitLoss > 0);
    const losingTrades = closedTrades.filter((trade) => trade.profitLoss < 0);

    const totalProfit = winningTrades.reduce(
      (sum, trade) => sum + trade.profitLoss,
      0
    );
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    );
    const netProfit = totalProfit - totalLoss;

    const averageWin =
      winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const averageLoss =
      losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

    const largestWin =
      winningTrades.length > 0
        ? Math.max(...winningTrades.map((t) => t.profitLoss))
        : 0;
    const largestLoss =
      losingTrades.length > 0
        ? Math.min(...losingTrades.map((t) => t.profitLoss))
        : 0;

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    const averageRiskReward =
      closedTrades.length > 0
        ? closedTrades.reduce(
            (sum, trade) => sum + (trade.riskRewardRatio || 0),
            0
          ) / closedTrades.length
        : 0;

    // Calculate streaks
    const streaks = this.calculateStreaks(closedTrades);

    return {
      totalTrades: tradesToAnalyze.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        closedTrades.length > 0
          ? (winningTrades.length / closedTrades.length) * 100
          : 0,
      totalProfit,
      totalLoss,
      netProfit,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      averageRiskReward,
      maxDrawdown: this.calculateMaxDrawdown(closedTrades),
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      worstStreak: streaks.worst,
    };
  }

  /**
   * Calculate win/loss streaks
   */
  calculateStreaks(trades) {
    if (trades.length === 0) {
      return { current: 0, best: 0, worst: 0 };
    }

    // Sort trades by date
    const sortedTrades = trades.sort(
      (a, b) => new Date(b.exitDate) - new Date(a.exitDate)
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let tempStreak = 0;

    for (const trade of sortedTrades) {
      if (trade.profitLoss > 0) {
        if (tempStreak >= 0) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else if (trade.profitLoss < 0) {
        if (tempStreak <= 0) {
          tempStreak--;
        } else {
          tempStreak = -1;
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);
      worstStreak = Math.min(worstStreak, tempStreak);
    }

    currentStreak = tempStreak;

    return { current: currentStreak, best: bestStreak, worst: worstStreak };
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(trades) {
    if (trades.length === 0) return 0;

    // Sort trades by exit date
    const sortedTrades = trades.sort(
      (a, b) => new Date(a.exitDate) - new Date(b.exitDate)
    );

    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;

    for (const trade of sortedTrades) {
      runningTotal += trade.profitLoss;
      peak = Math.max(peak, runningTotal);
      const drawdown = peak - runningTotal;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }
}

// Initialize the data manager
const tradeManager = new TradeDataManager();
