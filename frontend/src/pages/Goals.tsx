
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Plus, Target, Pencil, Trash2, PlusCircle, AlertCircle, Calendar } from "lucide-react";

// Initial goals data
const initialGoalsData = [
  { id: 1, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 7500, targetDate: '2025-12-31' },
  { id: 2, name: 'Down Payment for House', targetAmount: 50000, currentAmount: 15200, targetDate: '2027-06-30' },
  { id: 3, name: 'European Vacation', targetAmount: 5000, currentAmount: 4800, targetDate: '2025-08-01' },
  { id: 4, name: 'New Car', targetAmount: 20000, currentAmount: 2000, targetDate: null },
];

const Goals = () => {
  const [goals, setGoals] = useState(initialGoalsData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: ""
  });
  const [contributionAmount, setContributionAmount] = useState(0);
  const { toast } = useToast();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No target date";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Calculate time remaining
  const calculateTimeRemaining = (targetDate: string | null) => {
    if (!targetDate) return "No deadline";
    
    const target = new Date(targetDate);
    const today = new Date();
    
    if (target < today) return "Deadline passed";
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days left`;
    
    const diffMonths = Math.ceil(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months left`;
    
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (remainingMonths === 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} left`;
    }
    
    return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} left`;
  };

  // Handle add new goal
  const handleAddGoal = () => {
    if (!formData.name || formData.targetAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    const newGoal = {
      id: Date.now(),
      name: formData.name,
      targetAmount: formData.targetAmount,
      currentAmount: formData.currentAmount || 0,
      targetDate: formData.targetDate || null
    };

    setGoals([...goals, newGoal]);

    toast({
      title: "Goal Added",
      description: `${formData.name} has been added to your financial goals`,
    });

    setIsAddDialogOpen(false);
    setFormData({
      id: 0,
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: ""
    });
  };

  // Handle edit goal
  const handleEditGoal = () => {
    if (!formData.name || formData.targetAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    setGoals(goals.map(goal => 
      goal.id === formData.id ? formData : goal
    ));

    toast({
      title: "Goal Updated",
      description: `${formData.name} has been updated`,
    });

    setIsEditDialogOpen(false);
    setFormData({
      id: 0,
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: ""
    });
  };

  // Handle delete goal
  const handleDeleteGoal = () => {
    if (currentGoal === null) return;

    const goalToDelete = goals.find(g => g.id === currentGoal);
    
    setGoals(goals.filter(goal => goal.id !== currentGoal));

    toast({
      title: "Goal Deleted",
      description: `${goalToDelete?.name} has been removed from your goals`,
    });

    setIsDeleteDialogOpen(false);
    setCurrentGoal(null);
  };

  // Handle add contribution
  const handleAddContribution = () => {
    if (currentGoal === null || contributionAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      });
      return;
    }

    const updatedGoals = goals.map(goal => {
      if (goal.id === currentGoal) {
        const newAmount = goal.currentAmount + contributionAmount;
        return {
          ...goal,
          currentAmount: newAmount > goal.targetAmount ? goal.targetAmount : newAmount
        };
      }
      return goal;
    });

    setGoals(updatedGoals);

    const goal = goals.find(g => g.id === currentGoal);
    
    toast({
      title: "Contribution Added",
      description: `Added ${formatCurrency(contributionAmount)} to ${goal?.name}`,
    });

    setIsContributionDialogOpen(false);
    setContributionAmount(0);
    setCurrentGoal(null);
  };

  // Open edit dialog with goal data
  const openEditDialog = (id: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      setFormData({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate || ""
      });
      setIsEditDialogOpen(true);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setCurrentGoal(id);
    setIsDeleteDialogOpen(true);
  };

  // Open contribution dialog
  const openContributionDialog = (id: number) => {
    setCurrentGoal(id);
    setIsContributionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Financial Goals</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0 bg-finance-teal hover:bg-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Goal</DialogTitle>
              <DialogDescription>
                Create a new financial goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g. Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-amount">Target Amount</Label>
                <Input
                  id="target-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Goal amount"
                  value={formData.targetAmount || ''}
                  onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-amount">Initial Saved Amount (Optional)</Label>
                <Input
                  id="current-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Current progress"
                  value={formData.currentAmount || ''}
                  onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleAddGoal}>
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty Goals Alert */}
      {goals.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any financial goals yet. Click "Add New Goal" to create your first goal.
          </AlertDescription>
        </Alert>
      )}

      {/* Goals Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          
          return (
            <Card key={goal.id} className="hover-scale">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center">
                      {goal.targetDate && <Calendar className="h-4 w-4 mr-1" />}
                      {calculateTimeRemaining(goal.targetDate)}
                    </CardDescription>
                  </div>
                  <Target className="h-5 w-5 text-finance-teal" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mt-2 mb-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress: {progress}%</span>
                    <span>
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {goal.currentAmount < goal.targetAmount ? (
                    <span>
                      Remaining: {formatCurrency(goal.targetAmount - goal.currentAmount)}
                    </span>
                  ) : (
                    <span className="text-green-500 font-medium">Goal completed! 🎉</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(goal.id)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openDeleteDialog(goal.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  className="bg-finance-teal hover:bg-teal-600"
                  onClick={() => openContributionDialog(goal.id)}
                  disabled={goal.currentAmount >= goal.targetAmount}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Financial Goal</DialogTitle>
            <DialogDescription>
              Update the details of your financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g. Emergency Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-target">Target Amount</Label>
              <Input
                id="edit-target"
                type="number"
                min="0"
                step="0.01"
                placeholder="Goal amount"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-current">Current Amount</Label>
              <Input
                id="edit-current"
                type="number"
                min="0"
                step="0.01"
                placeholder="Current progress"
                value={formData.currentAmount || ''}
                onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Target Date (Optional)</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleEditGoal}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Financial Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog */}
      <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money towards your financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contribution">Contribution Amount</Label>
              <Input
                id="contribution"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={contributionAmount || ''}
                onChange={(e) => setContributionAmount(Number(e.target.value))}
              />
            </div>
            {currentGoal !== null && (
              <div className="text-sm">
                <p className="font-medium">
                  Goal: {goals.find(g => g.id === currentGoal)?.name}
                </p>
                <p className="text-muted-foreground mt-1">
                  Current progress: {formatCurrency(goals.find(g => g.id === currentGoal)?.currentAmount || 0)}
                  {" "}of{" "}
                  {formatCurrency(goals.find(g => g.id === currentGoal)?.targetAmount || 0)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContributionDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-finance-teal hover:bg-teal-600" onClick={handleAddContribution}>
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
