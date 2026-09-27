import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Bell, CheckCircle2, FileText, ExternalLink, Calendar, RefreshCcw, AlertCircle, FileArchive } from 'lucide-react';
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
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const getIconForCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'scheme': return <RefreshCcw className="w-4 h-4 text-[#1769FF]" />;
      case 'document': return <FileArchive className="w-4 h-4 text-[#15803D]" />;
      case 'deadline': return <Calendar className="w-4 h-4 text-[#D97706]" />;
      case 'action required': return <AlertCircle className="w-4 h-4 text-[#B91C1C]" />;
      default: return <Bell className="w-4 h-4 text-[#123C69]" />;
    }
  };

  const categories = ['All', 'Recommendations', 'Documents', 'Deadlines', 'Scheme Updates', 'Applications', 'Action Required'];

  const filtered = activeCategory === 'All' 
    ? notifications 
    : notifications.filter(n => n.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded shadow-xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#123C69] text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-white/80" /> {t('notificationCenter', 'Notification Center')}
            </h2>
            <p className="text-xs text-blue-200 mt-1">{t('notificationDesc', 'Official alerts regarding your government schemes and applications.')}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Categories */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#07111F] overflow-y-auto hidden sm:block">
            <div className="py-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors border-l-2 ${
                    activeCategory === cat 
                      ? 'border-[#1769FF] bg-[#1769FF]/10 text-[#1769FF]' 
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0F1B2D] p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{activeCategory === 'All' ? t('allAlerts', 'All Alerts') : activeCategory}</span>
              <button onClick={onMarkAllRead} className="text-xs text-[#1769FF] font-bold hover:underline">
                {t('markAllRead', 'Mark all as read')}
              </button>
            </div>

            <div className="space-y-4">
              {filtered.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded border text-sm transition-colors ${
                    notif.read
                      ? 'bg-white dark:bg-[#0F1B2D] border-gray-200 dark:border-gray-800 opacity-70'
                      : 'bg-blue-50 dark:bg-[#16243A] border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-[#0F1B2D]'}`}>
                      {getIconForCategory(notif.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className={`font-bold ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{notif.timestamp}</span>
                      </div>
                      <p className={`text-xs mb-3 ${notif.read ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.description}
                      </p>
                      
                      {/* Action Required States */}
                      {!notif.read && notif.category.toLowerCase() === 'deadline' && (
                        <button className="px-3 py-1.5 bg-[#D97706] text-white text-xs font-bold rounded shadow-sm hover:bg-yellow-700 transition-colors">
                          {t('uploadMissingDoc', 'Upload Missing Document')}
                        </button>
                      )}
                      
                      {notif.link && (
                        <a href={notif.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769FF] hover:underline">
                          {t('viewDetails', 'View Details')} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">{t('noNewAlerts', 'You have no new alerts in this category.')}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
