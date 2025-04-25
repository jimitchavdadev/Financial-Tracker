
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Initial settings data
const initialSettingsData = {
  userProfile: {
    fullName: "Alex Jordan",
    email: "alex.jordan@example.com"
    // For password change simulation
  },
  linkedAccounts: [
    { id: 'acc1', name: 'Chase Checking', last4: '1234', status: 'Linked' },
    { id: 'acc2', name: 'Bank of America Savings', last4: '5678', status: 'Linked' },
  ],
  preferences: {
    currency: 'USD',
    notifications: {
      weeklySummary: true,
      budgetAlerts: false,
      investmentAlerts: true,
      goalAchieved: true
    }
  }
};

// Available currencies
const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

const Settings = () => {
  const [settings, setSettings] = useState(initialSettingsData);
  const [fullName, setFullName] = useState(settings.userProfile.fullName);
  const [email, setEmail] = useState(settings.userProfile.email);
  const [currency, setCurrency] = useState(settings.preferences.currency);
  const [notifications, setNotifications] = useState(settings.preferences.notifications);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  // Handle toggle notification
  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle save settings
  const handleSaveSettings = () => {
    const updatedSettings = {
      ...settings,
      userProfile: {
        ...settings.userProfile,
        fullName,
        email
      },
      preferences: {
        ...settings.preferences,
        currency,
        notifications
      }
    };
    
    setSettings(updatedSettings);
    setIsSettingsSaved(true);
    
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully",
    });
    
    // Reset saved state after 3 seconds
    setTimeout(() => {
      setIsSettingsSaved(false);
    }, 3000);
  };

  // Handle update password
  const handleUpdatePassword = () => {
    // Basic validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password should be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate checking the current password
    if (passwordData.currentPassword !== "password") {
      toast({
        title: "Incorrect Password",
        description: "Your current password is incorrect",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate password update success
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully",
    });
    
    setIsPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  // Handle unlink account
  const handleUnlinkAccount = (id: string) => {
    setSettings(prev => ({
      ...prev,
      linkedAccounts: prev.linkedAccounts.filter(account => account.id !== id)
    }));
    
    toast({
      title: "Account Unlinked",
      description: "The bank account has been unlinked from your profile",
    });
  };

  // Handle link new account (simulation)
  const handleLinkNewAccount = () => {
    toast({
      title: "Plaid Integration Simulation",
      description: "Account linking not implemented. This would integrate with Plaid in a real app.",
    });
  };

  // Toggle password visibility
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <Button 
          className={`mt-4 sm:mt-0 ${isSettingsSaved ? 'bg-green-500 hover:bg-green-600' : 'bg-finance-teal hover:bg-teal-600'}`}
          onClick={handleSaveSettings}
        >
          {isSettingsSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input 
              id="full-name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password to update.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggleCurrentPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePassword}>
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="text-sm text-muted-foreground mt-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              For testing, use "password" as the current password
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Bank Accounts</CardTitle>
          <CardDescription>
            Manage connected financial accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.linkedAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bank accounts linked. Click "Link New Account" to connect a bank account.
            </div>
          ) : (
            <div className="space-y-4">
              {settings.linkedAccounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-4 border rounded-md">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">••••{account.last4}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUnlinkAccount(account.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Unlink
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button onClick={handleLinkNewAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Link New Account
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your app settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base" htmlFor="weekly-summary">
                    Weekly Summary Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your financial activity
                  </p>
                </div>
                <Switch
                  id="weekly-summary"
                  checked={notifications.weeklySummary}
                  onCheckedChange={() => handleToggleNotification('weeklySummary')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base" htmlFor="budget-alerts">
                    Budget Threshold Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you approach category budget limits
                  </p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={notifications.budgetAlerts}
                  onCheckedChange={() => handleToggleNotification('budgetAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base" htmlFor="investment-alerts">
                    Investment Price Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of significant changes to your investments
                  </p>
                </div>
                <Switch
                  id="investment-alerts"
                  checked={notifications.investmentAlerts}
                  onCheckedChange={() => handleToggleNotification('investmentAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base" htmlFor="goal-achieved">
                    Goal Achievement Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you reach a financial goal
                  </p>
                </div>
                <Switch
                  id="goal-achieved"
                  checked={notifications.goalAchieved}
                  onCheckedChange={() => handleToggleNotification('goalAchieved')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
