import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Header from '../components/layout/Header';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/api/notifications')
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.meta?.unreadCount || 0);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to load notifications');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_hired':
        return '🎉';
      case 'bid_rejected':
        return '📭';
      case 'new_bid':
        return '💼';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'bid_hired':
        return 'bg-green-50 border-green-200';
      case 'bid_rejected':
        return 'bg-red-50 border-red-200';
      case 'new_bid':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-zinc-50 border-zinc-200';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      
      <main className="max-w-4xl mx-auto pt-28 px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-zinc-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20 border rounded-xl bg-white">
            <p className="text-lg font-medium mb-2">No notifications</p>
            <p className="text-sm text-zinc-600">
              You're all caught up!
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-5 ${getNotificationColor(notif.type)} ${
                  !notif.read ? 'shadow-md' : 'opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getNotificationIcon(notif.type)}</div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{notif.title}</h3>
                    <p className="text-sm text-zinc-700 mt-1">{notif.message}</p>
                    
                    {notif.data?.gigId && (
                      <Link
                        to={`/gigs/${notif.data.gigId}`}
                        className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                      >
                        View Gig →
                      </Link>
                    )}
                    
                    <p className="text-xs text-zinc-500 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-2 rounded-lg bg-white hover:bg-zinc-100 transition text-sm"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="p-2 rounded-lg bg-white hover:bg-red-100 transition text-sm"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
