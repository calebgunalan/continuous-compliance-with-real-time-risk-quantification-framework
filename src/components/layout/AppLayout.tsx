import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      
      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "pl-64" : "pl-[72px]"
      )}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search Bar */}
            <div className="relative hidden md:flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search controls, threats, reports..."
                className="h-9 w-80 rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
              <div className="status-dot status-dot-success" />
              <span className="text-xs font-medium text-success">Live Monitoring</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
