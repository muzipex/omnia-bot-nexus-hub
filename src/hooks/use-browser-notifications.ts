import { useEffect } from "react";

export function useBrowserNotifications(title: string, options?: NotificationOptions) {
  useEffect(() => {
    if (window.Notification && Notification.permission === "granted") {
      new Notification(title, options);
    }
    // otherwise, ask permission
    else if (window.Notification && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  }, [title, options]);
}
