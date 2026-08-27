import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bell, CheckCircle2, FileText, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-heading">Citizen Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500">Alerts & Updates</span>
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                notif.read
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  : 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white font-medium'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold font-heading">{notif.title}</span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{notif.description}</p>
              {notif.link && (
                <a
                  href={notif.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline pt-1"
                >
                  <span>Open Portal Link</span> <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
