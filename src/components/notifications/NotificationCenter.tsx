import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  FileText,
  Wrench,
  Info,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, unknown>;
}

export function NotificationCenter() {
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!organizationId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('organization_id', organizationId)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      control_failure: <Shield className="h-4 w-4 text-destructive" />,
      control_warning: <AlertTriangle className="h-4 w-4 text-warning" />,
      risk_alert: <AlertCircle className="h-4 w-4 text-destructive" />,
      maturity_change: <TrendingUp className="h-4 w-4 text-primary" />,
      security_incident: <AlertTriangle className="h-4 w-4 text-destructive" />,
      report_ready: <FileText className="h-4 w-4 text-success" />,
      remediation_update: <Wrench className="h-4 w-4 text-primary" />,
    };
    return icons[type] || <Info className="h-4 w-4 text-muted-foreground" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      error: 'border-l-destructive',
      warning: 'border-l-warning',
      success: 'border-l-success',
      info: 'border-l-primary',
    };
    return colors[severity] || 'border-l-border';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {!notifications?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4",
                    getSeverityColor(notification.severity),
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.is_read ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full text-sm" size="sm">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
