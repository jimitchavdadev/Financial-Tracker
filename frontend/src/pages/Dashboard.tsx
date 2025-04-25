
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart, LineChart, ResponsiveContainer, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Cell } from "recharts";
import { Eye, TrendingUp, TrendingDown, ArrowUpRight, Receipt } from "lucide-react";

// Hardcoded dashboard data
const dashboardData = {
  userName: "Alex",
  budgetSummary: {
    totalBudget: 5000,
    totalSpent: 3500,
    categories: [
      { name: 'Groceries', spent: 800, budget: 1000, color: '#0d9488' },
      { name: 'Transport', spent: 450, budget: 500, color: '#2563eb' },
      { name: 'Utilities', spent: 300, budget: 400, color: '#8b5cf6' },
      { name: 'Entertainment', spent: 600, budget: 800, color: '#ec4899' },
      { name: 'Other', spent: 1350, budget: 2300, color: '#94a3b8' },
    ]
  },
  recentExpenses: [
    { id: 1, date: '2025-04-11', description: 'Coffee Shop', category: 'Entertainment', amount: 5.75 },
    { id: 2, date: '2025-04-10', description: 'Grocery Store', category: 'Groceries', amount: 120.50 },
    { id: 3, date: '2025-04-10', description: 'Gas Station', category: 'Transport', amount: 55.00 },
    { id: 4, date: '2025-04-09', description: 'Electricity Bill', category: 'Utilities', amount: 85.00 },
    { id: 5, date: '2025-04-08', description: 'Restaurant', category: 'Entertainment', amount: 75.20 },
  ],
  investmentSummary: {
    totalValue: 25500,
    totalGainLossAmount: 1500,
    totalGainLossPercent: 6.25,
    portfolioHistory: [
      { date: '2025-03-12', value: 24800 },
      { date: '2025-03-19', value: 25100 },
      { date: '2025-03-26', value: 25000 },
      { date: '2025-04-02', value: 25350 },
      { date: '2025-04-09', value: 25500 },
    ]
  },
  goalSummary: [
    { id: 1, name: 'Vacation Fund', targetAmount: 3000, currentAmount: 1800 },
    { id: 2, name: 'New Laptop', targetAmount: 1500, currentAmount: 500 },
  ]
};

// Create data for pie chart
const budgetPieData = dashboardData.budgetSummary.categories.map(category => ({
  name: category.name,
  value: category.spent,
  color: category.color
}));

// Create data for budget comparison chart
const budgetComparisonData = dashboardData.budgetSummary.categories.map(category => ({
  name: category.name,
  Spent: category.spent,
  Budget: category.budget
}));

const Dashboard = () => {
  const { userName, budgetSummary, recentExpenses, investmentSummary, goalSummary } = dashboardData;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Calculate progress percentages for goals
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {userName}!
        </h1>
        <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Budget Overview Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Budget Overview</CardTitle>
                <CardDescription>This Month</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
                <a href="/budgets">View All Budgets</a>
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
                      <p className="text-lg sm:text-2xl font-bold">{formatCurrency(budgetSummary.totalBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-lg sm:text-2xl font-bold">{formatCurrency(budgetSummary.totalSpent)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Remaining</p>
                    <p className="text-lg sm:text-2xl font-bold text-finance-teal">
                      {formatCurrency(budgetSummary.totalBudget - budgetSummary.totalSpent)}
                    </p>
                  </div>
                  <Progress 
                    value={(budgetSummary.totalSpent / budgetSummary.totalBudget) * 100} 
                    className="h-2 mt-4" 
                  />
                </div>
                <div className="h-48 sm:h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name.substring(0, 3)}.. ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {budgetPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Snapshot */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Investment Portfolio</CardTitle>
              <CardDescription>Current Value</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
              <a href="/investments">View Details</a>
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(investmentSummary.totalValue)}</p>
                </div>
                <div className={`flex items-center ${investmentSummary.totalGainLossAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {investmentSummary.totalGainLossAmount >= 0 ? <TrendingUp className="mr-1" size={16} /> : <TrendingDown className="mr-1" size={16} />}
                  <span className="text-xs sm:text-sm font-medium">
                    {investmentSummary.totalGainLossAmount >= 0 ? '+' : '-'}
                    {formatCurrency(Math.abs(investmentSummary.totalGainLossAmount))} ({investmentSummary.totalGainLossPercent}%)
                  </span>
                </div>
              </div>
              <div className="h-28 sm:h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={investmentSummary.portfolioHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 10}}
                      tickFormatter={(tickItem) => formatDate(tickItem)}
                    />
                    <YAxis 
                      tick={{fontSize: 10}}
                      tickFormatter={(tickItem) => `$${tickItem/1000}k`}
                      width={40}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0d9488" 
                      strokeWidth={2} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses & Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
              <CardDescription>Your latest expenses</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
              <a href="/expenses">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="rounded-full bg-muted p-1 sm:p-2 hidden xs:block">
                      <Receipt size={14} className="sm:size-16" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Goal Progress</CardTitle>
              <CardDescription>Your financial goals</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild className="mt-2 sm:mt-0">
              <a href="/goals">View All</a>
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {goalSummary.map((goal) => {
                const progressPercentage = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                
                return (
                  <div key={goal.id} className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{progressPercentage}%</p>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="w-full mt-2">
                <ArrowUpRight className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Add New Goal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
