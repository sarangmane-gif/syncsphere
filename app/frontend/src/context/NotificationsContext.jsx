import { createContext, useContext, useState } from "react";

const NotificationsContext = createContext({ notifications: [], addNotification: () => {}, removeNotification: () => {} });

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Team Announcement", message: "New Q3 goals published", timestamp: "2 min ago", type: "announcement" },
    { id: 2, title: "Meeting Reminder", message: "All Hands in 30 minutes", timestamp: "30 min ago", type: "meeting" },
    { id: 3, title: "System Update", message: "Platform updated successfully", timestamp: "1 hour ago", type: "system" },
  ]);

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      timestamp: "now",
    };
    setNotifications([newNotif, ...notifications]);
    return newNotif.id;
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
