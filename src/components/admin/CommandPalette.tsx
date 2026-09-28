import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Activity, FileText, Database, ShieldAlert, CheckSquare } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key inside the component as well (though parent handles it too)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const recentCommands = [
    { id: 'schemes', label: 'Search Schemes', icon: FileText, view: 'schemes' },
    { id: 'analytics', label: 'Open Analytics', icon: Activity, view: 'analytics' },
    { id: 'data-quality', label: 'Data Health', icon: Database, view: 'data-quality' },
  ];

  const navigationCommands = [
    { id: 'nav-overview', label: 'Dashboard', view: 'overview' },
    { id: 'nav-schemes', label: 'Schemes', view: 'schemes' },
    { id: 'nav-users', label: 'Users', view: 'users' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#07111F]/60 backdrop-blur-sm"
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#0B1424] rounded-xl shadow-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#243449] flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center px-4 py-4 border-b border-[#E2E8F0] dark:border-[#243449]">
              <Search className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8] mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything..."
                className="flex-1 bg-transparent border-none outline-none text-[#07111F] dark:text-[#F8FAFC] placeholder-[#94A3B8] text-lg font-sans"
              />
              <div className="text-[10px] font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8] bg-[#F5F7FA] dark:bg-[#101D31] px-2 py-1 rounded">ESC</div>
            </div>

            <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
              {query === '' ? (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mt-2">Recent</div>
                  <div className="space-y-1 mb-4">
                    {recentCommands.map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { onNavigate(cmd.view); onClose(); }}
                        className="w-full flex items-center px-3 py-3 text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-[#1769FF] dark:text-[#60A5FA] mr-3" />
                        <span className="flex-1 text-left">{cmd.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="px-3 py-2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Navigation</div>
                  <div className="space-y-1 mb-2">
                    {navigationCommands.map(cmd => (
                      <button
                        key={cmd.id}
                        onClick={() => { onNavigate(cmd.view); onClose(); }}
                        className="w-full flex items-center px-3 py-3 text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] transition-colors"
                      >
                        <span className="flex-1 text-left">{cmd.label}</span>
                        <div className="text-[10px] font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">JUMP</div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Searching for "{query}"... (Demo Mode)
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
