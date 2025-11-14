# Trading Journal

A comprehensive trading journal application for tracking, analyzing, and improving your trading performance across multiple asset classes.

## Features

### 📊 Dashboard Analytics

- **Real-time Performance Metrics**: Total P&L, Win Rate, Profit Factor, and more
- **Interactive Charts**: Equity curve, monthly P&L distribution, and performance by asset type
- **Quick Stats**: Average win/loss, largest trades, risk/reward ratios, and drawdown tracking
- **Recent Trades**: Fast access to your latest trading activity

### 📝 Trade Management

- **Comprehensive Trade Entry**: Capture all trade details including entry/exit, position size, and risk management
- **Multi-Asset Support**: Trade stocks, forex, cryptocurrency, and options
- **Trade Journaling**: Document rationale, emotional state, lessons learned, and market conditions
- **Risk Management**: Built-in stop loss, take profit, and position sizing calculations
- **Tagging System**: Organize trades with custom tags for better analysis

### 📈 Advanced Analytics

- **Performance by Strategy**: Compare effectiveness of different trading strategies
- **Asset Type Analysis**: See which markets perform best for you
- **Emotional State Tracking**: Understand how emotions impact your trading
- **Trade Frequency Analysis**: Identify optimal trading times and patterns
- **Risk Metrics**: Maximum drawdown, Sharpe ratio, and expectancy calculations

### 🔍 Search & Filtering

- **Advanced Search**: Find trades by symbol, notes, or any field
- **Multi-Criteria Filtering**: Filter by date range, asset type, profitability, and more
- **Sorting Options**: Organize trades by date, symbol, P&L, or risk/reward ratio
- **Export Functionality**: Download data as CSV for external analysis

### 📱 Responsive Design

- **Mobile-Friendly**: Full functionality on all device sizes
- **Touch-Optimized**: Intuitive interactions for mobile devices
- **Progressive Enhancement**: Works great even on slower connections

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Storage**: LocalStorage for data persistence
- **Icons**: Font Awesome for consistent iconography
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required

### Installation

1. **Clone or Download** the project files
2. **Open `index.html`** in your web browser
3. **Start adding trades** using the "Add Trade" button

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/trading-journal.git
   cd trading-journal
   ```

2. **Start a local server** (optional but recommended):

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using VS Code Live Server extension
   # Right-click index.html and select "Open with Live Server"
   ```

3. **Open your browser** to `http://localhost:8000`

## Usage Guide

### Adding Your First Trade

1. **Navigate to Add Trade** page
2. **Fill in Basic Information**:

   - Asset type (Stocks, Forex, Crypto, Options)
   - Symbol/Ticker (e.g., AAPL, BTC/USD)
   - Direction (Long/Short)
   - Position size and entry price

3. **Set Risk Management**:

   - Stop loss and take profit levels
   - Account size for risk percentage calculation
   - View calculated risk metrics in real-time

4. **Document Your Trade**:

   - Trading strategy used
   - Rationale for entry
   - Emotional state during trade
   - Lessons learned

5. **Save and Analyze**: View results on dashboard

### Analyzing Performance

1. **Dashboard Overview**: Check key metrics and charts
2. **Trade History**: Review all trades with filtering options
3. **Export Data**: Download CSV for deeper analysis
4. **Identify Patterns**: Use analytics to improve your trading

## Data Structure

### Trade Object

```javascript
{
  id: "unique_trade_id",
  assetType: "stocks|forex|crypto|options",
  symbol: "AAPL",
  direction: "long|short",
  status: "open|closed|cancelled",
  positionSize: 100,
  entryPrice: 150.25,
  entryDate: "2024-01-15T09:30:00Z",
  exitPrice: 155.50,
  exitDate: "2024-01-16T14:25:00Z",
  commission: 5.00,
  stopLoss: 148.00,
  takeProfit: 155.00,
  accountSize: 10000,
  strategy: "Momentum Breakout",
  rationale: "Strong volume breakout...",
  emotionalState: "calm",
  marketConditions: "trending",
  lessonsLearned: "Patience paid off...",
  tags: ["breakout", "momentum"],
  rating: 4,
  // Auto-calculated fields
  profitLoss: 525.00,
  profitLossPercent: 3.5,
  riskAmount: 225.00,
  rewardAmount: 475.00,
  riskRewardRatio: 2.11,
  riskPercent: 2.25
}
```

## Customization

### Adding Custom Strategies

Edit the default strategies in `js/data-manager.js`:

```javascript
getDefaultSettings() {
  return {
    strategies: [
      'Momentum',
      'Mean Reversion',
      'Breakout',
      'Scalping',
      'Your Custom Strategy'
    ]
  };
}
```

### Modifying Color Scheme

Update CSS variables in `css/main.css`:

```css
:root {
  --primary-color: #4f46e5;
  --success-color: #10b981;
  --danger-color: #ef4444;
  /* Add more custom colors */
}
```

## Deployment

### GitHub Pages

1. **Push to GitHub repository**
2. **Enable GitHub Pages** in repository settings
3. **Select source branch** (usually `main` or `gh-pages`)
4. **Access at** `https://username.github.io/repository-name`

### Netlify

1. **Drag and drop** project folder to Netlify
2. **Get instant deployment** at provided URL
3. **Connect to Git** for automatic deployments

### Vercel

1. **Import project** from GitHub or upload
2. **Deploy automatically** to Vercel URL
3. **Custom domain** available in settings

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Security & Privacy

- **Local Storage Only**: All data stored locally in your browser
- **No Server Communication**: No data sent to external servers
- **Privacy First**: Your trading data never leaves your device
- **Export Control**: You control when and how data is exported

## Performance Tips

### For Large Datasets

- **Use Filtering**: Reduce displayed trades for faster loading
- **Regular Exports**: Keep backups of your data
- **Browser Cache**: Modern browsers handle large datasets well

### Mobile Optimization

- **Progressive Loading**: Charts load data progressively
- **Touch Interactions**: Optimized for mobile gestures
- **Responsive Charts**: Charts adapt to screen size

## Troubleshooting

### Common Issues

**Charts Not Displaying**

- Check browser console for errors
- Ensure Chart.js is loading correctly
- Verify data format in LocalStorage

**Data Not Saving**

- Check browser LocalStorage permissions
- Ensure browser is not in private mode
- Try refreshing the page

**Mobile Display Issues**

- Clear browser cache
- Update browser to latest version
- Check responsive design in dev tools

### Getting Help

1. **Check Browser Console** for error messages
2. **Verify File Structure** matches this repository
3. **Test with Sample Data** using browser console
4. **Report Issues** with browser and OS details

## Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature-name`
3. **Make changes** and test thoroughly
4. **Submit pull request** with detailed description

### Code Style

- **ES6+ JavaScript**: Modern syntax and features
- **CSS Variables**: Consistent theming approach
- **Semantic HTML5**: Proper structure and accessibility
- **Mobile First**: Responsive design priority

## Roadmap

### Version 1.1

- [ ] Trade screenshots and image attachments
- [ ] Advanced charting options
- [ ] Custom date range presets
- [ ] Performance comparison periods

### Version 1.2

- [ ] Multiple account support
- [ ] Trade duplication templates
- [ ] Advanced risk calculator
- [ ] Performance goal tracking

### Version 2.0

- [ ] Cloud sync option
- [ ] Mobile app version
- [ ] Real-time market data integration
- [ ] Community features

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Chart.js**: For powerful data visualization
- **Font Awesome**: For consistent iconography
- **Modern CSS**: Grid, Flexbox, and Custom Properties
- **Web Standards**: HTML5, ES6+, and Progressive Enhancement

---

**Happy Trading! 📈💰**

Track. Analyze. Improve.
