import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Users, Briefcase, BarChart3, X, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface SearchResult {
  type: 'scheme' | 'citizen' | 'application';
  id: string;
  title: string;
  subtitle: string;
}

interface GlobalSearchProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  scheme: <FileText size={16} className="text-blue-500" />,
  citizen: <Users size={16} className="text-emerald-500" />,
  application: <Briefcase size={16} className="text-amber-500" />,
};

const typeLabel: Record<string, string> = {
  scheme: 'Scheme',
  citizen: 'Citizen',
  application: 'Application',
};

const quickLinks = [
  { label: 'Dashboard', view: 'dashboard', icon: BarChart3 },
  { label: 'Scheme Management', view: 'schemes', icon: FileText },
  { label: 'Citizens', view: 'citizens', icon: Users },
  { label: 'Applications', view: 'applications', icon: Briefcase },
  { label: 'Analytics', view: 'analytics', icon: BarChart3 },
];

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.get('/search', { q: query });
        if (res.success) {
          const formattedResults = res.results.map((r: any) => ({
            ...r,
            type: r.type.toLowerCase() === 'user' ? 'citizen' : r.type.toLowerCase()
          }));
          setResults(formattedResults);
          setSelectedIdx(0);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? results : quickLinks;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      if (query && results[selectedIdx]) {
        const r = results[selectedIdx];
        onNavigate(r.type === 'scheme' ? 'schemes' : r.type === 'citizen' ? 'citizens' : 'applications');
        onClose();
      } else if (!query && quickLinks[selectedIdx]) {
        onNavigate(quickLinks[selectedIdx].view);
        onClose();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          {loading ? <Loader2 size={20} className="text-blue-500 animate-spin shrink-0" /> : <Search size={20} className="text-slate-400 shrink-0" />}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search schemes, citizens, applications..."
            className="flex-1 text-base text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 rounded border border-slate-200">Esc</kbd>
        </div>

        {/* Results or Quick Links */}
        <div className="max-h-96 overflow-y-auto">
          {!query ? (
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Quick Navigation</p>
              {quickLinks.map((link, i) => (
                <button
                  key={link.view}
                  onClick={() => { onNavigate(link.view); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${i === selectedIdx ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <link.icon size={16} className={i === selectedIdx ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-medium">{link.label}</span>
                  <ArrowRight size={14} className={`ml-auto ${i === selectedIdx ? 'text-blue-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No results for "{query}"</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => { onNavigate(r.type === 'scheme' ? 'schemes' : r.type === 'citizen' ? 'citizens' : 'applications'); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${i === selectedIdx ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {typeIcon[r.type]}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-slate-800 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    {typeLabel[r.type]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">↑↓</kbd>navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">↵</kbd>select</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">Esc</kbd>close</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
