"use client";

import { useState, useEffect } from "react";
import { Bell, Check, ShoppingBag, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    const data = await getUnreadNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications([]);
    setOpen(false);
  };

  const handleNotificationClick = async (notification: any) => {
    await markNotificationAsRead(notification.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    setOpen(false);
    if (notification.orderId) {
      // Just navigate to orders page, we could use search params or just general list
      router.push("/admin/orders");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case "ORDER_CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "RETURN_REQUESTED":
        return <RotateCcw className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-auto max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-neutral-50 cursor-pointer transition-colors group"
                >
                  <div className="mt-0.5 bg-white shadow-sm border rounded-full p-1.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-neutral-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                  >
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
