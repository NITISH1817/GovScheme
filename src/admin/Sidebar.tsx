import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Briefcase,
  BarChart3, FileBadge, Cpu, Bell, Settings,
  ShieldCheck, LogOut, ChevronLeft, ChevronRight,
  Activity, FileBarChart, ChevronDown, ChevronUp
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  activeView: string;
  setActiveView: (v: string) => void;
  onLogout?: () => void;
  adminName?: string;
  adminRole?: string;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'schemes', label: 'Scheme Management', icon: FileText, badge: null },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
    ],
  },
  {
    label: 'Users & Applications',
    items: [
      { id: 'citizens', label: 'Citizens', icon: Users },
      { id: 'applications', label: 'Applications', icon: Briefcase, badge: 8 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'ocr', label: 'OCR Verification', icon: FileBadge },
      { id: 'ai', label: 'AI Logs', icon: Cpu },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  activeView,
  setActiveView,
  onLogout,
  adminName = 'Super Admin',
  adminRole = 'Administrator',
}) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(navGroups.map(g => g.label)));

  const toggleGroup = (label: string) => {
    if (isCollapsed) return;
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const initials = adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-[#0f1729] text-slate-300 h-screen flex flex-col border-r border-slate-800/60 relative z-20 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-white font-bold text-sm leading-none">GovScheme</p>
                <p className="text-slate-500 text-xs mt-0.5">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {navGroups.map(group => (
          <div key={group.label} className="mb-1">
            {/* Group header */}
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-400 transition-colors"
              >
                {group.label}
                {openGroups.has(group.label) ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
            {isCollapsed && <div className="mx-auto w-8 border-t border-slate-800/80 my-2" />}

            <AnimatePresence initial={false}>
              {(isCollapsed || openGroups.has(group.label)) && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden px-2 space-y-0.5"
                >
                  {group.items.map(item => {
                    const isActive = activeView === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveView(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative group ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                          }`}
                        >
                          <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 text-left truncate"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {!isCollapsed && 'badge' in item && item.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-blue-900 text-blue-300'}`}>
                              {item.badge}
                            </span>
                          )}
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full -ml-2"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Admin Profile + Logout */}
      <div className="border-t border-slate-800/60 p-3 shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-lg mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
            {initials}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-white text-xs font-semibold truncate">{adminName}</p>
                <p className="text-slate-500 text-[10px] truncate">{adminRole}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => { if (onLogout) onLogout(); }}
          title={isCollapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.div>
  );
};
