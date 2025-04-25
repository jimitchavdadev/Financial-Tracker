
import { ReactNode } from "react";
import { SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        {!isMobile && <SidebarRail />}
        <main className="flex-1 overflow-auto transition-all duration-300">
          <div className="p-2 sm:p-4 md:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
