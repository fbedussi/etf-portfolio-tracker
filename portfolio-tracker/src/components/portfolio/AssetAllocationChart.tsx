import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

// Color palette for asset categories
const CATEGORY_COLORS: Record<string, string> = {
  Stocks: 'hsl(var(--chart-1))',
  Bonds: 'hsl(var(--chart-2))',
  'Real Estate': 'hsl(var(--chart-3))',
  Commodities: 'hsl(var(--chart-4))',
  Cash: 'hsl(var(--chart-5))',
};

// Fallback colors for additional categories
const FALLBACK_COLORS = [
  'hsl(210, 100%, 56%)',
  'hsl(340, 82%, 52%)',
  'hsl(291, 64%, 42%)',
  'hsl(168, 76%, 42%)',
  'hsl(48, 96%, 53%)',
];

/**
 * AssetAllocationChart Component
 * 
 * Displays current portfolio allocation across asset categories
 * using a pie chart visualization.
 */
export function AssetAllocationChart() {
  const { metrics, isCalculating } = usePortfolio();

  const chartData = useMemo(() => {
    if (!metrics || !metrics.currentAllocation) {
      return [];
    }

    return Object.entries(metrics.currentAllocation)
      .filter(([_, percentage]) => percentage > 0)
      .map(([category, percentage]) => ({
        category,
        percentage,
        fill: CATEGORY_COLORS[category] || FALLBACK_COLORS[0],
      }))
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }, [metrics]);

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    chartData.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  if (isCalculating || !metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Current portfolio distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-48 w-48 animate-pulse rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Current portfolio distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No allocation data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>
          Current portfolio distribution across asset categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}:</span>
                          <span className="font-bold">{value}%</span>
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="percentage"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category, percentage }) =>
                  percentage > 5 ? `${percentage.toFixed(1)}%` : ''
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {value} ({entry.payload.percentage.toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
