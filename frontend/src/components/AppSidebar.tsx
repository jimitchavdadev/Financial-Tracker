
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  PieChart,
  Receipt,
  Landmark,
  Target,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/providers/ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => {
  const { state } = useSidebar();
  
  const button = (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-2 ${
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      }`}
      onClick={onClick}
    >
      <Icon size={20} />
      {state !== "collapsed" && <span>{label}</span>}
    </Button>
  );

  if (state === "collapsed") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { state, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  const logoutButton = (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      onClick={handleLogout}
    >
      <LogOut size={20} />
      {state !== "collapsed" && <span>Logout</span>}
    </Button>
  );

  return (
    <Sidebar className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <PieChart size={24} className="text-sidebar-primary" />
          <div className="font-bold text-lg group-data-[collapsible=icon]:hidden">FinTrack Pro</div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <div className="space-y-1">
          <NavItem
            icon={Home}
            label="Dashboard"
            path="/dashboard"
            isActive={isActive("/dashboard")}
            onClick={() => handleNavigation("/dashboard")}
          />
          <NavItem
            icon={PieChart}
            label="Budgets"
            path="/budgets"
            isActive={isActive("/budgets")}
            onClick={() => handleNavigation("/budgets")}
          />
          <NavItem
            icon={Receipt}
            label="Expenses"
            path="/expenses"
            isActive={isActive("/expenses")}
            onClick={() => handleNavigation("/expenses")}
          />
          <NavItem
            icon={Landmark}
            label="Investments"
            path="/investments"
            isActive={isActive("/investments")}
            onClick={() => handleNavigation("/investments")}
          />
          <NavItem
            icon={Target}
            label="Goals"
            path="/goals"
            isActive={isActive("/goals")}
            onClick={() => handleNavigation("/goals")}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            path="/settings"
            isActive={isActive("/settings")}
            onClick={() => handleNavigation("/settings")}
          />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Sun size={16} className="dark:text-gray-400 text-yellow-500" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
            <Moon size={16} className="text-gray-400 dark:text-blue-300" />
          </div>
          <span className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            {theme === "dark" ? "Dark" : "Light"} Mode
          </span>
        </div>
        {state === "collapsed" ? (
          <Tooltip>
            <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          logoutButton
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
