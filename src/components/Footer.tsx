import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, ExternalLink, Phone, Info, Globe2, FileText } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  currentLang: LanguageCode;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLang, onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white font-heading">{t('appName')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Government Portal Dataset</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Core Platform Features
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('schemes')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rule-Based Eligibility Engine</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Multilingual AI Assistant</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vault')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Document Vault & OCR Scanner</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracker')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Application Status Tracker</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('kiosk')} className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CSC Gram Panchayat Kiosk Mode</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals Direct Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              National Portals Redirects
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in/' },
                { name: 'PMAY-G Rural Housing', url: 'https://pmayg.nic.in/' },
                { name: 'Ayushman Bharat PMJAY', url: 'https://pmjay.gov.in/' },
                { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/' },
                { name: 'DigiLocker Govt Vault', url: 'https://www.digilocker.gov.in/' },
                { name: 'UMANG Citizen Services', url: 'https://web.umang.gov.in/' },
              ].map(link => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center justify-between text-slate-400 hover:text-white"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Helplines & Transparency Notice */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
              National Helplines
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>PM-KISAN Helpline: <strong>155261 / 011-24300606</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ayushman Bharat: <strong>14555</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>National Pension Portal: <strong>1800-11-0001</strong></span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 leading-normal mt-4">
              <span className="text-amber-400 font-bold block mb-1">TRANSPARENCY DISCLAIMER</span>
              {t('guaranteedDisclaimer')}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 GovScheme AI — Government Scheme Eligibility Recommender Platform. All Rights Reserved.</p>
          <div className="flex space-x-4">
            <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">National Portal of India</a>
            <span>•</span>
            <button onClick={() => onNavigate('kiosk')} className="hover:text-slate-300">CSC Kiosk</button>
            <span>•</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-slate-300">Admin Portal</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
