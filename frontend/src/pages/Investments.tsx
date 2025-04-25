
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Plus, RefreshCw, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Initial holdings data
const initialHoldingsData = [
  { id: 1, name: 'Apple Inc.', ticker: 'AAPL', quantity: 10, purchasePrice: 150.00, currentPrice: 175.50, purchaseDate: '2024-01-15' },
  { id: 2, name: 'Vanguard S&P 500 ETF', ticker: 'VOO', quantity: 25, purchasePrice: 400.00, currentPrice: 450.25, purchaseDate: '2023-11-01' },
  { id: 3, name: 'Tesla Inc.', ticker: 'TSLA', quantity: 5, purchasePrice: 250.00, currentPrice: 220.75, purchaseDate: '2024-03-10' },
  { id: 4, name: 'Microsoft Corp.', ticker: 'MSFT', quantity: 8, purchasePrice: 285.00, currentPrice: 325.25, purchaseDate: '2023-12-05' },
  { id: 5, name: 'Amazon.com Inc.', ticker: 'AMZN', quantity: 12, purchasePrice: 130.00, currentPrice: 148.50, purchaseDate: '2024-02-20' },
];

// Example historical data for chart
const initialPortfolioHistory = [
  { date: '2025-03-12', value: 24800 },
  { date: '2025-03-19', value: 25100 },
  { date: '2025-03-26', value: 25000 },
  { date: '2025-04-02', value: 25350 },
  { date: '2025-04-09', value: 25500 },
  { date: '2025-04-11', value: 25750 },
];

const Investments = () => {
  const [holdings, setHoldings] = useState(initialHoldingsData);
  const [portfolioHistory, setPortfolioHistory] = useState(initialPortfolioHistory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentHolding, setCurrentHolding] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    ticker: "",
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Calculate portfolio statistics
  const calculatePortfolioStats = () => {
    const totalCostBasis = holdings.reduce(
      (sum, holding) => sum + (holding.quantity * holding.purchasePrice), 
      0
    );
    
    const totalValue = holdings.reduce(
      (sum, holding) => sum + (holding.quantity * holding.currentPrice), 
      0
    );
    
    const totalGainLoss = totalValue - totalCostBasis;
    const totalGainLossPercent = totalCostBasis > 0 
      ? (totalGainLoss / totalCostBasis) * 100 
      : 0;
    
    return { totalCostBasis, totalValue, totalGainLoss, totalGainLossPercent };
  };

  const portfolioStats = calculatePortfolioStats();

  // Handle refresh prices
  const handleRefreshPrices = () => {
    setRefreshing(true);
    
    // Simulate fetching new prices
    setTimeout(() => {
      const updatedHoldings = holdings.map(holding => {
        // Randomly adjust prices by -2% to +2%
        const priceChange = (Math.random() * 4 - 2) / 100;
        const newPrice = holding.currentPrice * (1 + priceChange);
        
        return {
          ...holding,
          currentPrice: parseFloat(newPrice.toFixed(2))
        };
      });
      
      setHoldings(updatedHoldings);
      
      // Add a new data point to the portfolio history
      const newValue = updatedHoldings.reduce(
        (sum, holding) => sum + (holding.quantity * holding.currentPrice), 
        0
      );
      
      const today = new Date().toISOString().split('T')[0];
      const updatedHistory = [...portfolioHistory];
      
      // If there's already a data point for today, update it; otherwise, add a new one
      const todayIndex = updatedHistory.findIndex(point => point.date === today);
      if (todayIndex >= 0) {
        updatedHistory[todayIndex].value = newValue;
      } else {
        updatedHistory.push({ date: today, value: newValue });
      }
      
      setPortfolioHistory(updatedHistory);
      
      toast({
        title: "Prices Refreshed",
        description: "Investment prices have been updated with the latest market data",
      });
      
      setRefreshing(false);
    }, 1500);
  };

  // Handle add new holding
  const handleAddHolding = () => {
    if (!formData.name || !formData.ticker || formData.quantity <= 0 || formData.purchasePrice <= 0 || formData.currentPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const newHolding = {
      id: Date.now(),
      name: formData.name,
      ticker: formData.ticker,
      quantity: formData.quantity,
      purchasePrice: formData.purchasePrice,
      currentPrice: formData.currentPrice,
      purchaseDate: formData.purchaseDate
    };

    setHoldings([...holdings, newHolding]);

    toast({
      title: "Investment Added",
      description: `${formData.name} (${formData.ticker}) has been added to your portfolio`,
    });

    setIsAddDialogOpen(false);
    setFormData({
      id: 0,
      name: "",
      ticker: "",
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  // Handle edit holding
  const handleEditHolding = () => {
    if (!formData.name || !formData.ticker || formData.quantity <= 0 || formData.purchasePrice <= 0 || formData.currentPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setHoldings(holdings.map(holding => 
      holding.id === formData.id ? formData : holding
    ));

    toast({
      title: "Investment Updated",
      description: `${formData.name} (${formData.ticker}) has been updated`,
    });

    setIsEditDialogOpen(false);
    setFormData({
      id: 0,
      name: "",
      ticker: "",
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  // Handle delete holding
  const handleDeleteHolding = () => {
    if (currentHolding === null) return;

    const holdingToDelete = holdings.find(h => h.id === currentHolding);
    
    setHoldings(holdings.filter(holding => holding.id !== currentHolding));

    toast({
      title: "Investment Deleted",
      description: `${holdingToDelete?.name} (${holdingToDelete?.ticker}) has been removed from your portfolio`,
    });

    setIsDeleteDialogOpen(false);
    setCurrentHolding(null);
  };

  // Open edit dialog with holding data
  const openEditDialog = (id: number) => {
    const holding = holdings.find(h => h.id === id);
    if (holding) {
      setFormData({ ...holding });
      setIsEditDialogOpen(true);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setCurrentHolding(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Investment Portfolio</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={handleRefreshPrices}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-finance-teal hover:bg-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Investment Holding</DialogTitle>
                <DialogDescription>
                  Enter the details of your investment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Investment Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Apple Inc."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticker">Ticker Symbol</Label>
                    <Input
                      id="ticker"
                      placeholder="e.g. AAPL"
                      value={formData.ticker}
                      onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.0001"
                      placeholder="Number of shares"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price per share"
                      value={formData.purchasePrice || ''}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">Current Price</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Current price per share"
                      value={formData.currentPrice || ''}
                      onChange={(e) => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleAddHolding}>
                  Add Investment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>Track your investment performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioStats.totalValue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Cost Basis</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioStats.totalCostBasis)}</p>
            </div>
            <div className={portfolioStats.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Gain/Loss</p>
              <div className="flex items-center">
                {portfolioStats.totalGainLoss >= 0 ? (
                  <TrendingUp className="mr-2 h-5 w-5" />
                ) : (
                  <TrendingDown className="mr-2 h-5 w-5" />
                )}
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.abs(portfolioStats.totalGainLoss))} ({formatPercentage(portfolioStats.totalGainLossPercent)})
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Chart */}
          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 12}}
                  tickFormatter={(tickItem) => {
                    const date = new Date(tickItem);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  tick={{fontSize: 12}}
                  tickFormatter={(tickItem) => `$${tickItem}`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), "Portfolio Value"]}
                  labelFormatter={(label) => `Date: ${formatDate(String(label))}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0d9488" 
                  strokeWidth={2} 
                  name="Portfolio Value"
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Empty Portfolio Alert */}
      {holdings.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your investment portfolio is empty. Click "Add Investment" to add your first holding.
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Holdings */}
      {holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Holdings</CardTitle>
            <CardDescription>Your current investment portfolio</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Investment</th>
                    <th className="text-right p-4">Quantity</th>
                    <th className="text-right p-4">Purchase Price</th>
                    <th className="text-right p-4">Current Price</th>
                    <th className="text-right p-4">Cost Basis</th>
                    <th className="text-right p-4">Market Value</th>
                    <th className="text-right p-4">Gain/Loss</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => {
                    const costBasis = holding.quantity * holding.purchasePrice;
                    const marketValue = holding.quantity * holding.currentPrice;
                    const gainLoss = marketValue - costBasis;
                    const gainLossPercent = (gainLoss / costBasis) * 100;
                    
                    return (
                      <tr key={holding.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{holding.name}</div>
                            <div className="text-sm text-muted-foreground">{holding.ticker}</div>
                          </div>
                        </td>
                        <td className="p-4 text-right">{holding.quantity.toFixed(4)}</td>
                        <td className="p-4 text-right">{formatCurrency(holding.purchasePrice)}</td>
                        <td className="p-4 text-right">{formatCurrency(holding.currentPrice)}</td>
                        <td className="p-4 text-right">{formatCurrency(costBasis)}</td>
                        <td className="p-4 text-right">{formatCurrency(marketValue)}</td>
                        <td className={`p-4 text-right ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <div>
                            {formatCurrency(Math.abs(gainLoss))}
                            <div className="text-xs">
                              {gainLoss >= 0 ? '+' : '-'}{Math.abs(gainLossPercent).toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(holding.id)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(holding.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investment</DialogTitle>
            <DialogDescription>
              Update the details of your investment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Investment Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Apple Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ticker">Ticker Symbol</Label>
                <Input
                  id="edit-ticker"
                  placeholder="e.g. AAPL"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  step="0.0001"
                  placeholder="Number of shares"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                <Input
                  id="edit-purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-purchasePrice">Purchase Price</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price per share"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currentPrice">Current Price</Label>
                <Input
                  id="edit-currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Current price per share"
                  value={formData.currentPrice || ''}
                  onChange={(e) => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleEditHolding}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Investment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this investment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHolding}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investments;
