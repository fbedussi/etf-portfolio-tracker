# Portfolio File Examples

This directory contains example YAML portfolio files to help you create your own portfolio file.

## Files

### 📄 portfolio-simple.yaml
A minimal valid portfolio with 2 ETFs (stocks and bonds).

**Use this when:**
- You're just getting started
- You want to understand the basic structure
- You have a simple portfolio setup

**Contains:**
- 2 ETFs (VTI, BND)
- Basic target allocation (70/30 stocks/bonds)
- Simple transaction history

---

### 📄 portfolio-full.yaml
A comprehensive portfolio demonstrating all features with 6 ETFs across multiple asset classes.

**Use this when:**
- You want to see a complete example
- You have a diversified portfolio
- You need to understand advanced features

**Contains:**
- 6 ETFs (VTI, VXUS, BND, BNDX, VNQ, DBC)
- 4 asset categories (Stocks, Bonds, Real Estate, Commodities)
- Multiple asset classes per ETF
- Complex transaction history

---

### ⚠️ portfolio-invalid.yaml
An intentionally invalid portfolio file for testing error handling.

**Contains common errors:**
- Target allocation not summing to 100%
- Asset class percentages not summing to 100%
- Categories in ETFs not in target allocation
- Invalid date formats
- Zero or negative values
- Missing required fields

**Use this to:**
- Test error handling
- Understand validation rules
- See what NOT to do

---

## Portfolio File Structure

### Required Fields

```yaml
name: "Portfolio Name"  # Optional but recommended

targetAllocation:       # Required - must sum to 100%
  Stocks: 60
  Bonds: 30
  "Real Estate": 10

etfs:                   # Required - at least 1 ETF
  TICKER:
    name: "ETF Name"                    # Required
    assetClasses:                       # Required - at least 1
      - name: "Asset Class Name"        # Required
        category: "Category Name"       # Required - must match targetAllocation
        percentage: 100                 # Required - must sum to 100 per ETF
    transactions:                       # Required - at least 1
      - date: "YYYY-MM-DD"              # Required - ISO 8601 format
        quantity: 10                    # Required - positive=buy, negative=sell
        price: 100.50                   # Required - must be positive
```

### Validation Rules

1. **Target Allocation**
   - Must sum to exactly 100%
   - Categories can be any string (e.g., "Stocks", "Bonds", "Real Estate")

2. **Asset Classes**
   - Percentages must sum to 100% for each ETF
   - Category must exist in target allocation
   - Each ETF must have at least one asset class

3. **Transactions**
   - Date must be in YYYY-MM-DD format
   - Quantity must be non-zero (positive = buy, negative = sell)
   - Price must be positive
   - Each ETF must have at least one transaction

4. **Portfolio**
   - Must contain at least one ETF
   - All categories used in ETFs must be in target allocation

---

## How to Use

1. **Copy an example file**
   ```bash
   cp examples/portfolio-simple.yaml my-portfolio.yaml
   ```

2. **Edit with your data**
   - Replace ticker symbols with your ETFs
   - Update transaction dates and amounts
   - Adjust target allocation to your preferences

3. **Validate the file**
   - Load it in the Portfolio Tracker app
   - The app will show specific validation errors if any

4. **Common Pitfalls**
   - ❌ Forgetting to make percentages sum to 100
   - ❌ Using category names inconsistently
   - ❌ Wrong date format (use YYYY-MM-DD)
   - ❌ Negative prices or zero quantities
   - ❌ Missing required fields

---

## Asset Category Examples

Common category names you might use:

- **Stocks**: US Large Cap, US Small Cap, International, Emerging Markets
- **Bonds**: Government Bonds, Corporate Bonds, TIPS, International Bonds
- **Real Estate**: REITs, Real Estate
- **Commodities**: Gold, Broad Commodities, Energy
- **Cash**: Money Market, Cash Equivalents

You can use any category names that make sense for your portfolio. Just be consistent!

---

## Need Help?

If you're having trouble creating a portfolio file:

1. Start with `portfolio-simple.yaml`
2. Make small changes incrementally
3. Test in the app after each change
4. Read error messages carefully - they tell you exactly what's wrong

For more information, see the main project documentation.
