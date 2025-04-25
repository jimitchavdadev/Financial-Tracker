
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Filter, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Initial expenses data
const initialExpensesData = [
  { id: 1, date: '2025-04-11', description: 'Coffee Shop', category: 'Entertainment', amount: 5.75 },
  { id: 2, date: '2025-04-10', description: 'Grocery Store', category: 'Groceries', amount: 120.50 },
  { id: 3, date: '2025-04-10', description: 'Gas Station', category: 'Transport', amount: 55.00 },
  { id: 4, date: '2025-04-09', description: 'Electricity Bill', category: 'Utilities', amount: 85.00 },
  { id: 5, date: '2025-04-08', description: 'Restaurant', category: 'Entertainment', amount: 75.20 },
  { id: 6, date: '2025-04-07', description: 'Amazon Purchase', category: 'Shopping', amount: 45.99 },
  { id: 7, date: '2025-04-06', description: 'Movie Tickets', category: 'Entertainment', amount: 30.00 },
  { id: 8, date: '2025-04-05', description: 'Pharmacy', category: 'Healthcare', amount: 22.50 },
  { id: 9, date: '2025-04-04', description: 'Internet Bill', category: 'Utilities', amount: 65.00 },
  { id: 10, date: '2025-04-03', description: 'Coffee Shop', category: 'Entertainment', amount: 4.25 },
  { id: 11, date: '2025-04-02', description: 'Grocery Store', category: 'Groceries', amount: 85.30 },
  { id: 12, date: '2025-04-01', description: 'Rent Payment', category: 'Rent/Mortgage', amount: 1500.00 },
];

// Available categories for dropdown
const categories = [
  "All Categories", "Groceries", "Transport", "Utilities", "Entertainment", 
  "Rent/Mortgage", "Shopping", "Healthcare", "Education", 
  "Travel", "Dining Out", "Subscriptions", "Personal Care", "Other"
];

const Expenses = () => {
  const [expenses, setExpenses] = useState(initialExpensesData);
  const [filteredExpenses, setFilteredExpenses] = useState(initialExpensesData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{ id?: number; date: string; description: string; category: string; amount: number }>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    category: "",
    amount: 0
  });
  const [currentExpense, setCurrentExpense] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...expenses];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate <= endDate;
      });
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(term)
      );
    }

    setFilteredExpenses(filtered);
    
    toast({
      title: "Filters Applied",
      description: `Showing ${filtered.length} of ${expenses.length} expenses`,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setStartDate(undefined);
    setEndDate(undefined);
    setFilteredExpenses(expenses);
    
    toast({
      title: "Filters Reset",
      description: "Showing all expenses",
    });
  };

  // Handle add new expense
  const handleAddExpense = () => {
    if (!formData.description || !formData.category || formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const newExpense = {
      id: Date.now(),
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: formData.amount
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);

    toast({
      title: "Expense Added",
      description: `${formData.description} has been added to your expenses`,
    });

    setIsAddDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "",
      amount: 0
    });
  };

  // Handle edit expense
  const handleEditExpense = () => {
    if (!formData.description || !formData.category || formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const updatedExpenses = expenses.map(expense => 
      expense.id === formData.id 
        ? { ...formData, id: expense.id } as (typeof expenses)[0]
        : expense
    );

    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);

    toast({
      title: "Expense Updated",
      description: `${formData.description} has been updated`,
    });

    setIsEditDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "",
      amount: 0
    });
  };

  // Handle delete expense
  const handleDeleteExpense = () => {
    if (currentExpense === null) return;

    const expenseToDelete = expenses.find(e => e.id === currentExpense);
    
    const updatedExpenses = expenses.filter(expense => expense.id !== currentExpense);
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses);

    toast({
      title: "Expense Deleted",
      description: `${expenseToDelete?.description} has been removed from your expenses`,
    });

    setIsDeleteDialogOpen(false);
    setCurrentExpense(null);
  };

  // Open edit dialog with expense data
  const openEditDialog = (id: number) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setFormData({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        category: expense.category,
        amount: expense.amount
      });
      setIsEditDialogOpen(true);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setCurrentExpense(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Expenses & Transactions</h1>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            <span>Filter Expenses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Date Range - Start */}
            <div>
              <Label htmlFor="start-date" className="block mb-2">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range - End */}
            <div>
              <Label htmlFor="end-date" className="block mb-2">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="block mb-2">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <Label htmlFor="search" className="block mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search expenses..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <div className="space-x-2">
              <Button onClick={applyFilters} className="bg-finance-teal hover:bg-teal-600">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new expense.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-category">Category</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger id="add-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All Categories").map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleAddExpense}>
                    Add Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-muted-foreground">
                      No expenses found. Try adjusting your filters or add a new expense.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium">{expense.description}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(expense.id)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of your expense.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                defaultValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder={formData.category} />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== "All Categories").map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleEditExpense}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
