import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCheck, Trash2, Send, Plus, Filter, 
  AlertCircle, CheckCircle2, Info, Radio, RefreshCw, X
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface AdminNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const NotificationCenterView: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Broadcast Form
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState('Broadcast');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await apiClient.put(`/notifications/${id}/read`, {});
      if (res && res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      // optimistic update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setAlertBanner({ text: 'All notifications marked as read', type: 'success' });
      setTimeout(() => setAlertBanner(null), 3000);
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.post('/notifications', {
        title: newTitle,
        message: newMessage,
        type: newType
      });

      if (res && res.success && res.notification) {
        setNotifications(prev => [res.notification, ...prev]);
        setAlertBanner({ text: 'Broadcast notification transmitted to all connected systems.', type: 'success' });
        setIsComposeOpen(false);
        setNewTitle('');
        setNewMessage('');
      } else {
        setAlertBanner({ text: 'Failed to create broadcast notification.', type: 'error' });
      }
    } catch (err: any) {
      setAlertBanner({ text: err.message || 'Broadcast failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setAlertBanner(null), 4000);
    }
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'All') return true;
    if (filterType === 'Unread') return !n.read;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1769FF] text-white">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            National alert broadcasts, critical system dispatches, and applicant intake logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-40 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#15803D]" /> Mark All Read
          </button>
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg text-sm font-bold transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Send Broadcast
          </button>
        </div>
      </div>

      {alertBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
            alertBanner.type === 'success' 
              ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
              : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
          }`}
        >
          {alertBanner.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {alertBanner.text}
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#243449] pb-3">
        {['All', 'Unread', 'System', 'ApplicationUpdate', 'SchemeAlert', 'Broadcast'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === tab 
                ? 'bg-[#1769FF] text-white shadow-sm' 
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#FFFFFF] dark:bg-[#0B1424] rounded-xl border border-[#E2E8F0] dark:border-[#243449] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-12 text-center text-[#64748B] dark:text-[#94A3B8]">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No notifications in this filter category.
          </div>
        ) : (
          filtered.map(notif => (
            <div
              key={notif._id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.read 
                  ? 'bg-[#FFFFFF] dark:bg-[#0B1424] border-[#E2E8F0] dark:border-[#243449]' 
                  : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                  notif.type === 'System' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                  notif.type === 'ApplicationUpdate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  notif.type === 'SchemeAlert' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${notif.read ? 'font-semibold text-[#07111F] dark:text-[#F8FAFC]' : 'font-bold text-[#1769FF] dark:text-[#60A5FA]'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#1769FF] dark:bg-[#60A5FA]" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="text-[10px] text-[#94A3B8] font-semibold mt-2">
                    {new Date(notif.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Type: {notif.type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769FF] transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notif._id)}
                  title="Remove"
                  className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] hover:border-[#B91C1C] text-[#64748B] dark:text-[#94A3B8] hover:text-[#B91C1C] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07111F]/60 backdrop-blur-sm"
              onClick={() => setIsComposeOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC]">Dispatch System Notification</h2>
                <button onClick={() => setIsComposeOpen(false)} className="p-1 text-[#64748B] hover:text-[#07111F] dark:hover:text-[#F8FAFC]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Alert Category</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Broadcast">Broadcast (All Portals)</option>
                    <option value="System">System Warning</option>
                    <option value="SchemeAlert">Scheme Policy Advisory</option>
                    <option value="ApplicationUpdate">Citizen Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Subject Header *</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Scheduled Portal Maintenance Window"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Message Content *</label>
                  <textarea 
                    rows={4} 
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Detail the operational announcement..."
                    className="w-full p-3 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#1769FF] hover:bg-[#123C69] disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
                  >
                    {isSubmitting ? 'Transmitting...' : 'Dispatch Alert'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
