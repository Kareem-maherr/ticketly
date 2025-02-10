import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaBell, FaTimes, FaComment } from 'react-icons/fa';

interface Notification {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  type?: 'message' | 'ticket';
  messageId?: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to unread notifications
    const q = query(
      collection(db, 'notifications'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      setNotifications(newNotifications.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      ));
    });

    return () => unsubscribe();
  }, []);

  const getBorderColor = (type?: string) => {
    switch (type) {
      case 'message':
        return 'border-blue-500';
      default:
        return 'border-red-500';
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return <FaComment className="h-5 w-5 text-blue-500" />;
      default:
        return <FaBell className="h-5 w-5 text-red-500" />;
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-[450px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-lg shadow-lg p-6 w-full border-l-4 ${getBorderColor(notification.type)} animate-slide-in hover:shadow-xl transition-shadow duration-200`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {notification.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0 ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span className="sr-only">Close</span>
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
