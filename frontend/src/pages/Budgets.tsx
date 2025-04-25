
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

// Initial budget data
const initialBudgetData = {
  totalIncome: 6000,
  categories: [
    { id: 1, name: 'Groceries', budgeted: 1000, spent: 800 },
    { id: 2, name: 'Transport', budgeted: 500, spent: 450 },
    { id: 3, name: 'Utilities', budgeted: 400, spent: 300 },
    { id: 4, name: 'Entertainment', budgeted: 800, spent: 600 },
    { id: 5, name: 'Rent/Mortgage', budgeted: 1500, spent: 1500 },
    { id: 6, name: 'Shopping', budgeted: 300, spent: 350 },
  ]
};

// Available categories for dropdown
const availableCategories = [
  "Groceries", "Transport", "Utilities", "Entertainment", 
  "Rent/Mortgage", "Shopping", "Healthcare", "Education", 
  "Travel", "Dining Out", "Subscriptions", "Personal Care", "Other"
];

const Budgets = () => {
  const [budgetData, setBudgetData] = useState(initialBudgetData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", budgeted: 0 });
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  const [income, setIncome] = useState(budgetData.totalIncome);
  const { toast } = useToast();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total budgeted amount
  const totalBudgeted = budgetData.categories.reduce((sum, category) => sum + category.budgeted, 0);
  
  // Calculate remaining to budget
  const remainingToBudget = budgetData.totalIncome - totalBudgeted;

  // Prepare chart data
  const chartData = budgetData.categories.map(category => ({
    name: category.name,
    Budgeted: category.budgeted,
    Spent: category.spent
  }));

  // Handle add new category
  const handleAddCategory = () => {
    if (!formData.name || formData.budgeted <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: formData.name,
      budgeted: formData.budgeted,
      spent: 0 // New categories start with zero spent
    };

    setBudgetData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));

    toast({
      title: "Category Added",
      description: `${formData.name} has been added to your budget`,
    });

    setIsAddDialogOpen(false);
    setFormData({ id: 0, name: "", budgeted: 0 });
  };

  // Handle edit category
  const handleEditCategory = () => {
    if (!formData.name || formData.budgeted <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setBudgetData(prev => ({
      ...prev,
      categories: prev.categories.map(category => 
        category.id === formData.id 
          ? { ...category, name: formData.name, budgeted: formData.budgeted }
          : category
      )
    }));

    toast({
      title: "Category Updated",
      description: `${formData.name} has been updated`,
    });

    setIsEditDialogOpen(false);
    setFormData({ id: 0, name: "", budgeted: 0 });
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (currentCategory === null) return;

    const categoryToDelete = budgetData.categories.find(c => c.id === currentCategory);
    
    setBudgetData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category.id !== currentCategory)
    }));

    toast({
      title: "Category Deleted",
      description: `${categoryToDelete?.name} has been removed from your budget`,
    });

    setIsDeleteDialogOpen(false);
    setCurrentCategory(null);
  };

  // Handle income update
  const handleIncomeUpdate = () => {
    setBudgetData(prev => ({
      ...prev,
      totalIncome: income
    }));

    toast({
      title: "Income Updated",
      description: `Your income has been updated to ${formatCurrency(income)}`,
    });
  };

  // Open edit dialog with category data
  const openEditDialog = (id: number) => {
    const category = budgetData.categories.find(c => c.id === id);
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        budgeted: category.budgeted
      });
      setIsEditDialogOpen(true);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setCurrentCategory(id);
    setIsDeleteDialogOpen(true);
  };

  // Get status color based on spent vs budgeted
  const getStatusColor = (spent: number, budgeted: number) => {
    const ratio = spent / budgeted;
    if (ratio < 0.75) return "bg-green-500";
    if (ratio < 1) return "bg-yellow-500";
    return "bg-finance-red";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Budget Planning</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Summary</CardTitle>
          <CardDescription>Track your spending against your income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="income">Monthly Income</Label>
                <Button size="sm" variant="ghost" onClick={handleIncomeUpdate}>
                  Update
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="income"
                  type="number"
                  min="0"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="max-w-[180px]"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Budgeted</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
              <Progress 
                value={(totalBudgeted / budgetData.totalIncome) * 100} 
                className="h-2 mt-2"
              />
            </div>

            <div className={`${remainingToBudget < 0 ? 'text-finance-red' : 'text-finance-teal'}`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">Remaining to Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(remainingToBudget)}</p>
            </div>
          </div>

          {/* Budget Chart */}
          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Budgeted" fill="#1a365d" />
                <Bar dataKey="Spent" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Budget Categories</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-finance-teal hover:bg-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
              <DialogDescription>
                Create a new budget category to track your spending.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  onValueChange={(value) => setFormData({ ...formData, name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  placeholder="Enter amount"
                  value={formData.budgeted || ''}
                  onChange={(e) => setFormData({ ...formData, budgeted: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleAddCategory}>
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {budgetData.categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center p-6 gap-4">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(category.id)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openDeleteDialog(category.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budgeted</p>
                    <p className="font-medium">{formatCurrency(category.budgeted)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium">{formatCurrency(category.spent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`font-medium ${category.spent > category.budgeted ? 'text-finance-red' : ''}`}>
                      {formatCurrency(category.budgeted - category.spent)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round((category.spent / category.budgeted) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(category.spent / category.budgeted) * 100}
                    className={`h-2 ${getStatusColor(category.spent, category.budgeted)}`}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Category</DialogTitle>
            <DialogDescription>
              Update your budget category details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                defaultValue={formData.name}
                onValueChange={(value) => setFormData({ ...formData, name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.name} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Budget Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                value={formData.budgeted || ''}
                onChange={(e) => setFormData({ ...formData, budgeted: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleEditCategory}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
