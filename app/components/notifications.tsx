"use client";

import { useState, useEffect } from "react";
import { Notification } from "@/lib/types";
import { notificationApi, farcasterApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { formatDateTime } from "@/lib/utils";
import { Bell } from "lucide-react";

interface NotificationsProps {
  currentUserFid?: number;
}

export default function Notifications({ currentUserFid }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<Record<number, any>>({});

  useEffect(() => {
    if (currentUserFid && isOpen) {
      fetchNotifications();
    }
  }, [currentUserFid, isOpen]);

  const fetchNotifications = async () => {
    if (!currentUserFid) return;

    setIsLoading(true);
    try {
      const userNotifications = await notificationApi.getUserNotifications(currentUserFid);
      setNotifications(userNotifications);

      // Get user details for all senders
      const senderFids = new Set<number>();
      userNotifications.forEach(notification => {
        senderFids.add(notification.senderFid);
      });

      const userDetailsMap: Record<number, any> = {};
      await Promise.all(
        Array.from(senderFids).map(async (fid) => {
          try {
            const user = await farcasterApi.getUserByFid(fid);
            userDetailsMap[fid] = user;
          } catch (error) {
            console.error(`Error fetching user ${fid}:`, error);
          }
        })
      );

      setUserDetails(userDetailsMap);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!currentUserFid) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4">No notifications</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification) => {
                  const sender = userDetails[notification.senderFid];
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-md text-sm ${
                        !notification.read ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {sender
                              ? `${sender.displayName} (@${sender.username})`
                              : `User #${notification.senderFid}`}
                          </p>
                          <p>{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
