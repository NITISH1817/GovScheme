import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const GlobalUI: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${(totalScroll / windowHeight) * 100}`;
      setScrollProgress(Number(scroll));
      setShowBackToTop(totalScroll > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
        <div 
          className="h-full bg-blue-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        
        {/* Help Chat Popover */}
        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-72 mb-2 overflow-hidden"
            >
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold">GovScheme Support</h3>
                <button onClick={() => setIsHelpOpen(false)} className="hover:bg-white/20 p-1 rounded">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  Hi there! How can we help you today?
                </p>
                <a href="mailto:support@govscheme.example.com" className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg text-center hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  Email Support
                </a>
                <a href="tel:1800111222" className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg text-center hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  Call Toll-Free: 1800-111-222
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={scrollToTop}
                className="w-12 h-12 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Help and Support"
          >
            {isHelpOpen ? <X size={20} /> : <MessageCircle size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', destructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
