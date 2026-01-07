import { useState } from 'react';
import { Notification } from '../components/Notification';

type NotifType = 'success' | 'error' | 'info';

export function useNotification() {
  const [notif, setNotif] = useState<{
    type: NotifType;
    message: string;
  } | null>(null);

  const showNotification = (type: NotifType, message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 3000);
  };

  const NotificationComponent = notif ? (
    <Notification
      type={notif.type}
      message={notif.message}
      onClose={() => setNotif(null)}
    />
  ) : null;

  return { showNotification, NotificationComponent };
}
