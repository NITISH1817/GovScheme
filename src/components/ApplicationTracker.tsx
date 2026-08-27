import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Building2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ApplicationTrackerRecord } from '../types';

interface ApplicationTrackerProps {
  applications: ApplicationTrackerRecord[];
  onNavigateTab: (tab: string) => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onNavigateTab
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-l-4 border-gov-navy shadow-sm rounded-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-slate-700">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600">
            <Clock className="w-4 h-4 text-gov-navy dark:text-blue-400" /> Live Government DBT Tracking
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">Citizen Application Tracker</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time status updates on submitted welfare applications across official government portals.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('schemes')}
          className="px-6 py-3 rounded-md bg-gov-navy hover:bg-gov-blue text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Apply For New Scheme</span>
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {applications.map((app) => (
          <div key={app.id} className="gov-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-slate-900 dark:text-white font-heading">
                    {app.schemeName}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    app.status === 'Approved' || app.status === 'Benefit Released'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    Status: {app.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Application ID: {app.applicationNumber} • Applied Date: {app.appliedDate}
                </p>
              </div>

              <a
                href={app.officialPortalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md bg-gov-navy hover:bg-gov-blue text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Track on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Horizontal / Vertical Timeline */}
            <div className="space-y-3">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 font-heading block">
                Official Verification Timeline Stage Progress:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                {app.statusTimeline.map((stageItem, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-md border text-xs flex flex-col justify-between space-y-2 ${
                      stageItem.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold">Stage {idx + 1}</span>
                      {stageItem.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold block line-clamp-2">{stageItem.stage}</span>
                      <span className="text-[10px] opacity-75">{stageItem.date}</span>
                    </div>
                    {stageItem.remarks && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold bg-amber-100/50 p-1.5 rounded">
                        {stageItem.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
