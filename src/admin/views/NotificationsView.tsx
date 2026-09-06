import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, AlertCircle, Info, Clock, CheckCircle } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { useToast } from '../components/Toast';

export const NotificationsView: React.FC = () => {
  const [composeMode, setComposeMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAudience: 'All'
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      showToast('Title and message are required', 'error');
      return;
    }
    try {
      const res = await apiClient.post('/notifications', formData);
      if (res.success) {
        showToast('Notification sent successfully!', 'success');
        setComposeMode(false);
        setFormData({ title: '', message: '', type: 'info', targetAudience: 'All' });
        fetchNotifications();
      }
    } catch (error) {
      showToast('Failed to send notification', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notification Center</h2>
          <p className="text-slate-500 text-sm">Manage and broadcast messages to citizens.</p>
        </div>
        <button 
          onClick={() => setComposeMode(!composeMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
            composeMode 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {composeMode ? <span>Cancel</span> : <><Send size={18} /><span>Compose New</span></>}
        </button>
      </div>

      {composeMode ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Bell size={18} className="text-blue-500" /> Broadcast Notification
            </h3>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                <div className="relative">
                  <select 
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="All">All Registered Citizens</option>
                    <option value="Citizens">Verified Citizens Only</option>
                    <option value="Admins">Admins Only</option>
                  </select>
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notification Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="type" 
                      value="info" 
                      checked={formData.type === 'info'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="flex items-center gap-1 text-sm"><Info size={16} className="text-blue-500"/> Info</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="type" 
                      value="warning" 
                      checked={formData.type === 'warning'}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="text-amber-600 focus:ring-amber-500" 
                    />
                    <span className="flex items-center gap-1 text-sm"><AlertCircle size={16} className="text-amber-500"/> Warning</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input 
                type="text" 
                placeholder="Enter notification title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea 
                rows={4} 
                placeholder="Type your message here..." 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <p className="text-xs text-slate-500 mt-2 text-right">{formData.message.length}/500 characters</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setComposeMode(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                Discard
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-lg font-medium transition-colors flex items-center gap-2">
                <Send size={18} /> Send Now
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Broadcasts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider bg-white">
                  <th className="p-4">Message</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Sent At</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Loading notifications...</td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">No broadcast notifications sent yet.</td>
                  </tr>
                ) : notifications.map((notif) => (
                  <tr key={notif._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${notif.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                          {notif.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{notif.title}</div>
                          <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{notif.message}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full w-fit text-xs font-medium text-slate-700">
                        <Users size={12} /> {notif.targetAudience}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500">{new Date(notif.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle size={12} /> Sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
