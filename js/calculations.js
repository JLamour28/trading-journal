/**
 * Trade Calculator
 * Handles all financial calculations and performance analytics
 */

class TradeCalculator {
  constructor() {
    this.settings = tradeManager.loadSettings();
  }

  /**
   * Calculate basic profit/loss for a trade
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

    return entryValue > 0 ? (netPL / entryValue) * 100 : 0;
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
   * Calculate risk percentage of account
   */
  calculateRiskPercent(trade) {
    const riskAmount = this.calculateRiskAmount(trade);
    const accountSize = trade.accountSize || this.settings.accountSize;

    if (accountSize === 0) return 0;
    return (riskAmount / accountSize) * 100;
  }

  /**
   * Calculate win rate for a set of trades
   */
  calculateWinRate(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    const winningTrades = closedTrades.filter((trade) => trade.profitLoss > 0);
    return (winningTrades.length / closedTrades.length) * 100;
  }

  /**
   * Calculate profit factor
   */
  calculateProfitFactor(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    const winningTrades = closedTrades.filter((trade) => trade.profitLoss > 0);
    const losingTrades = closedTrades.filter((trade) => trade.profitLoss < 0);

    const totalProfit = winningTrades.reduce(
      (sum, trade) => sum + trade.profitLoss,
      0
    );
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
    );

    return totalLoss > 0 ? totalProfit / totalLoss : 0;
  }

  /**
   * Calculate average win amount
   */
  calculateAverageWin(trades) {
    const winningTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.profitLoss > 0
    );
    if (winningTrades.length === 0) return 0;

    const totalProfit = winningTrades.reduce(
      (sum, trade) => sum + trade.profitLoss,
      0
    );
    return totalProfit / winningTrades.length;
  }

  /**
   * Calculate average loss amount
   */
  calculateAverageLoss(trades) {
    const losingTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.profitLoss < 0
    );
    if (losingTrades.length === 0) return 0;

    const totalLoss = losingTrades.reduce(
      (sum, trade) => sum + trade.profitLoss,
      0
    );
    return totalLoss / losingTrades.length;
  }

  /**
   * Calculate largest winning trade
   */
  calculateLargestWin(trades) {
    const winningTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.profitLoss > 0
    );
    if (winningTrades.length === 0) return 0;

    return Math.max(...winningTrades.map((trade) => trade.profitLoss));
  }

  /**
   * Calculate largest losing trade
   */
  calculateLargestLoss(trades) {
    const losingTrades = trades.filter(
      (trade) => trade.status === "closed" && trade.profitLoss < 0
    );
    if (losingTrades.length === 0) return 0;

    return Math.min(...losingTrades.map((trade) => trade.profitLoss));
  }

  /**
   * Calculate average risk/reward ratio
   */
  calculateAverageRiskReward(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    const totalRR = closedTrades.reduce(
      (sum, trade) => sum + (trade.riskRewardRatio || 0),
      0
    );
    return totalRR / closedTrades.length;
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    // Sort trades by exit date
    const sortedTrades = closedTrades.sort(
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

  /**
   * Calculate maximum drawdown percentage
   */
  calculateMaxDrawdownPercent(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    const sortedTrades = closedTrades.sort(
      (a, b) => new Date(a.exitDate) - new Date(b.exitDate)
    );

    let peak = 0;
    let maxDrawdownPercent = 0;
    let runningTotal = 0;

    for (const trade of sortedTrades) {
      runningTotal += trade.profitLoss;
      peak = Math.max(peak, runningTotal);

      if (peak > 0) {
        const drawdownPercent = ((peak - runningTotal) / peak) * 100;
        maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdownPercent);
      }
    }

    return maxDrawdownPercent;
  }

  /**
   * Calculate Sharpe ratio (simplified version)
   */
  calculateSharpeRatio(trades, riskFreeRate = 0.02) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length < 2) return 0;

    const returns = closedTrades.map((trade) => trade.profitLossPercent / 100);
    const avgReturn =
      returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

    // Calculate standard deviation
    const variance =
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
      returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
  }

  /**
   * Calculate expectancy per trade
   */
  calculateExpectancy(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) return 0;

    const totalPL = closedTrades.reduce(
      (sum, trade) => sum + trade.profitLoss,
      0
    );
    return totalPL / closedTrades.length;
  }

  /**
   * Calculate expectancy ratio
   */
  calculateExpectancyRatio(trades) {
    const avgWin = this.calculateAverageWin(trades);
    const avgLoss = Math.abs(this.calculateAverageLoss(trades));
    const winRate = this.calculateWinRate(trades) / 100;

    if (avgLoss === 0) return 0;
    return (winRate * avgWin - (1 - winRate) * avgLoss) / avgLoss;
  }

  /**
   * Calculate performance by asset type
   */
  getPerformanceByAssetType(trades) {
    const assetTypes = ["stocks", "forex", "crypto", "options"];
    const performance = {};

    assetTypes.forEach((assetType) => {
      const assetTrades = trades.filter(
        (trade) => trade.assetType === assetType
      );

      performance[assetType] = {
        totalTrades: assetTrades.length,
        winningTrades: assetTrades.filter((t) => t.profitLoss > 0).length,
        losingTrades: assetTrades.filter((t) => t.profitLoss < 0).length,
        winRate: this.calculateWinRate(assetTrades),
        totalPL: assetTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
        profitFactor: this.calculateProfitFactor(assetTrades),
        averageRR: this.calculateAverageRiskReward(assetTrades),
      };
    });

    return performance;
  }

  /**
   * Calculate performance by strategy
   */
  getPerformanceByStrategy(trades) {
    const strategies = [
      ...new Set(trades.map((trade) => trade.strategy).filter(Boolean)),
    ];
    const performance = {};

    strategies.forEach((strategy) => {
      const strategyTrades = trades.filter(
        (trade) => trade.strategy === strategy
      );

      performance[strategy] = {
        totalTrades: strategyTrades.length,
        winningTrades: strategyTrades.filter((t) => t.profitLoss > 0).length,
        losingTrades: strategyTrades.filter((t) => t.profitLoss < 0).length,
        winRate: this.calculateWinRate(strategyTrades),
        totalPL: strategyTrades.reduce(
          (sum, t) => sum + (t.profitLoss || 0),
          0
        ),
        profitFactor: this.calculateProfitFactor(strategyTrades),
        averageRR: this.calculateAverageRiskReward(strategyTrades),
      };
    });

    return performance;
  }

  /**
   * Calculate performance by emotional state
   */
  getPerformanceByEmotionalState(trades) {
    const emotionalStates = [
      ...new Set(trades.map((trade) => trade.emotionalState).filter(Boolean)),
    ];
    const performance = {};

    emotionalStates.forEach((state) => {
      const stateTrades = trades.filter(
        (trade) => trade.emotionalState === state
      );

      performance[state] = {
        totalTrades: stateTrades.length,
        winningTrades: stateTrades.filter((t) => t.profitLoss > 0).length,
        losingTrades: stateTrades.filter((t) => t.profitLoss < 0).length,
        winRate: this.calculateWinRate(stateTrades),
        totalPL: stateTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
        profitFactor: this.calculateProfitFactor(stateTrades),
        averageRR: this.calculateAverageRiskReward(stateTrades),
      };
    });

    return performance;
  }

  /**
   * Calculate monthly performance
   */
  getMonthlyPerformance(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    const monthlyData = {};

    closedTrades.forEach((trade) => {
      const date = new Date(trade.exitDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          trades: [],
          totalPL: 0,
          winningTrades: 0,
          losingTrades: 0,
        };
      }

      monthlyData[monthKey].trades.push(trade);
      monthlyData[monthKey].totalPL += trade.profitLoss || 0;

      if (trade.profitLoss > 0) {
        monthlyData[monthKey].winningTrades++;
      } else if (trade.profitLoss < 0) {
        monthlyData[monthKey].losingTrades++;
      }
    });

    // Calculate additional metrics for each month
    Object.keys(monthlyData).forEach((month) => {
      const data = monthlyData[month];
      data.winRate =
        data.trades.length > 0
          ? (data.winningTrades / data.trades.length) * 100
          : 0;
      data.profitFactor = this.calculateProfitFactor(data.trades);
    });

    return monthlyData;
  }

  /**
   * Calculate equity curve data
   */
  getEquityCurveData(trades, initialCapital = 10000) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) {
      return [{ date: new Date().toISOString(), equity: initialCapital }];
    }

    // Sort trades by exit date
    const sortedTrades = closedTrades.sort(
      (a, b) => new Date(a.exitDate) - new Date(b.exitDate)
    );

    const equityData = [];
    let runningEquity = initialCapital;

    sortedTrades.forEach((trade) => {
      runningEquity += trade.profitLoss || 0;
      equityData.push({
        date: trade.exitDate,
        equity: runningEquity,
        tradeId: trade.id,
        symbol: trade.symbol,
        pl: trade.profitLoss || 0,
      });
    });

    return equityData;
  }

  /**
   * Calculate trade frequency analysis
   */
  getTradeFrequencyAnalysis(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) {
      return {
        averageTradesPerWeek: 0,
        averageTradesPerMonth: 0,
        mostActiveDay: null,
        leastActiveDay: null,
        tradingDaysPerWeek: 0,
      };
    }

    // Sort trades by entry date
    const sortedTrades = closedTrades.sort(
      (a, b) => new Date(a.entryDate) - new Date(b.entryDate)
    );

    const firstTrade = new Date(sortedTrades[0].entryDate);
    const lastTrade = new Date(sortedTrades[sortedTrades.length - 1].entryDate);
    const daysDiff = Math.ceil(
      (lastTrade - firstTrade) / (1000 * 60 * 60 * 24)
    );

    const weeksDiff = daysDiff / 7;
    const monthsDiff = daysDiff / 30.44; // Average month length

    // Calculate trades by day of week
    const dayOfWeekCounts = {
      0: 0, // Sunday
      1: 0, // Monday
      2: 0, // Tuesday
      3: 0, // Wednesday
      4: 0, // Thursday
      5: 0, // Friday
      6: 0, // Saturday
    };

    sortedTrades.forEach((trade) => {
      const dayOfWeek = new Date(trade.entryDate).getDay();
      dayOfWeekCounts[dayOfWeek]++;
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const mostActiveDayIndex = Object.keys(dayOfWeekCounts).reduce((a, b) =>
      dayOfWeekCounts[a] > dayOfWeekCounts[b] ? a : b
    );
    const leastActiveDayIndex = Object.keys(dayOfWeekCounts).reduce((a, b) =>
      dayOfWeekCounts[a] < dayOfWeekCounts[b] ? a : b
    );

    // Calculate unique trading days
    const uniqueTradingDays = new Set(
      sortedTrades.map((trade) => new Date(trade.entryDate).toDateString())
    ).size;

    return {
      averageTradesPerWeek: weeksDiff > 0 ? closedTrades.length / weeksDiff : 0,
      averageTradesPerMonth:
        monthsDiff > 0 ? closedTrades.length / monthsDiff : 0,
      mostActiveDay: dayNames[mostActiveDayIndex],
      leastActiveDay: dayNames[leastActiveDayIndex],
      tradingDaysPerWeek: weeksDiff > 0 ? uniqueTradingDays / weeksDiff : 0,
      dayOfWeekDistribution: dayNames.map((day, index) => ({
        day,
        count: dayOfWeekCounts[index],
        percentage:
          closedTrades.length > 0
            ? (dayOfWeekCounts[index] / closedTrades.length) * 100
            : 0,
      })),
    };
  }

  /**
   * Calculate position sizing consistency
   */
  getPositionSizingAnalysis(trades) {
    const closedTrades = trades.filter((trade) => trade.status === "closed");
    if (closedTrades.length === 0) {
      return {
        averagePositionSize: 0,
        positionSizeStdDev: 0,
        consistencyScore: 0,
        recommendedPositionSize: 0,
      };
    }

    const positionSizes = closedTrades.map((trade) => trade.positionSize || 0);
    const avgPositionSize =
      positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;

    // Calculate standard deviation
    const variance =
      positionSizes.reduce(
        (sum, size) => sum + Math.pow(size - avgPositionSize, 2),
        0
      ) / positionSizes.length;
    const stdDev = Math.sqrt(variance);

    // Consistency score (lower std dev relative to mean = higher consistency)
    const consistencyScore =
      avgPositionSize > 0
        ? Math.max(0, 100 - (stdDev / avgPositionSize) * 100)
        : 0;

    // Recommended position size based on risk per trade setting
    const accountSize = this.settings.accountSize;
    const riskPerTrade = this.settings.riskPerTrade;
    const recommendedPositionSize =
      (accountSize * riskPerTrade) / 100 / avgPositionSize || 0;

    return {
      averagePositionSize: avgPositionSize,
      positionSizeStdDev: stdDev,
      consistencyScore,
      recommendedPositionSize,
      positionSizes: positionSizes,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(trades) {
    const summary = tradeManager.getPerformanceSummary(trades);
    const assetPerformance = this.getPerformanceByAssetType(trades);
    const strategyPerformance = this.getPerformanceByStrategy(trades);
    const emotionalPerformance = this.getPerformanceByEmotionalState(trades);
    const monthlyPerformance = this.getMonthlyPerformance(trades);
    const equityCurve = this.getEquityCurveData(trades);
    const frequencyAnalysis = this.getTradeFrequencyAnalysis(trades);
    const positionAnalysis = this.getPositionSizingAnalysis(trades);

    return {
      summary,
      assetPerformance,
      strategyPerformance,
      emotionalPerformance,
      monthlyPerformance,
      equityCurve,
      frequencyAnalysis,
      positionAnalysis,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Initialize the calculator
const tradeCalculator = new TradeCalculator();
