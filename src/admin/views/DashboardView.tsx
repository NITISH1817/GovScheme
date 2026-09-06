import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FileText, Users, Briefcase, CheckCircle, Clock, XCircle,
  TrendingUp, Activity, Cpu, Mic, HardDrive, Server,
  RefreshCw, AlertCircle, Eye, BookOpen
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { DashboardSkeleton } from '../components/Skeleton';

interface Metrics {
  totalSchemes: number;
  publishedSchemes: number;
  draftSchemes: number;
  archivedSchemes: number;
  totalCitizens: number;
  activeUsers: number;
  todayRegistrations: number;
  totalApplications: number;
  approvedApps: number;
  pendingApps: number;
  rejectedApps: number;
  ocrRequests: number;
  aiRequests: number;
  voiceRequests: number;
  storageUsed: string;
  apiHealth: number;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  delay?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  label, value, icon, color, bgColor, change, changeType = 'neutral', delay = 0
}) => {
  const numVal = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numVal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-none">{label}</p>
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none mb-1.5">
        {typeof value === 'string' ? value : animated.toLocaleString()}
      </p>
      {change && (
        <p className={`text-xs font-medium flex items-center gap-1 ${
          changeType === 'up' ? 'text-emerald-600' : changeType === 'down' ? 'text-red-500' : 'text-slate-400'
        }`}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''}
          {change}
        </p>
      )}
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-1">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeRange, setTimeRange] = useState('6M');

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/analytics/dashboard', { timeRange });
      if (res.success) setData(res);
    } catch {
      // fallback handled by skeleton
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
      setLastRefresh(new Date());
    }, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) return <DashboardSkeleton />;
  if (!data) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <AlertCircle size={32} className="mr-3" /> Failed to load dashboard data.
    </div>
  );

  const m: Metrics = data.metrics;
  const charts = data.charts;

  const kpiCards: KPICardProps[] = [
    { label: 'Total Schemes', value: m.totalSchemes, icon: <FileText size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50', change: 'All schemes', changeType: 'neutral', delay: 0 },
    { label: 'Published Schemes', value: m.publishedSchemes, icon: <Eye size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', change: 'Live on portal', changeType: 'up', delay: 0.05 },
    { label: 'Draft Schemes', value: m.draftSchemes, icon: <BookOpen size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50', change: 'Pending review', changeType: 'neutral', delay: 0.1 },
    { label: 'Archived Schemes', value: m.archivedSchemes, icon: <FileText size={18} />, color: 'text-slate-500', bgColor: 'bg-slate-100', change: 'Inactive', changeType: 'neutral', delay: 0.15 },
    { label: 'Total Citizens', value: m.totalCitizens, icon: <Users size={18} />, color: 'text-purple-600', bgColor: 'bg-purple-50', change: 'Registered users', changeType: 'up', delay: 0.2 },
    { label: 'Active Users', value: m.activeUsers, icon: <Activity size={18} />, color: 'text-indigo-600', bgColor: 'bg-indigo-50', change: 'Applied ≥1 scheme', changeType: 'neutral', delay: 0.25 },
    { label: "Today's Registrations", value: m.todayRegistrations, icon: <TrendingUp size={18} />, color: 'text-teal-600', bgColor: 'bg-teal-50', change: 'Last 24 hours', changeType: 'up', delay: 0.3 },
    { label: 'Total Applications', value: m.totalApplications, icon: <Briefcase size={18} />, color: 'text-blue-600', bgColor: 'bg-blue-50', change: 'All time', changeType: 'neutral', delay: 0.35 },
    { label: 'Approved', value: m.approvedApps, icon: <CheckCircle size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', change: 'Approved applications', changeType: 'up', delay: 0.4 },
    { label: 'Pending Review', value: m.pendingApps, icon: <Clock size={18} />, color: 'text-amber-600', bgColor: 'bg-amber-50', change: 'Awaiting action', changeType: 'down', delay: 0.45 },
    { label: 'Rejected', value: m.rejectedApps, icon: <XCircle size={18} />, color: 'text-red-500', bgColor: 'bg-red-50', change: 'Declined applications', changeType: 'neutral', delay: 0.5 },
    { label: 'OCR Requests', value: m.ocrRequests, icon: <FileText size={18} />, color: 'text-cyan-600', bgColor: 'bg-cyan-50', change: 'Documents scanned', changeType: 'up', delay: 0.55 },
    { label: 'AI Requests', value: m.aiRequests, icon: <Cpu size={18} />, color: 'text-violet-600', bgColor: 'bg-violet-50', change: 'AI engine calls', changeType: 'up', delay: 0.6 },
    { label: 'Voice Requests', value: m.voiceRequests, icon: <Mic size={18} />, color: 'text-pink-600', bgColor: 'bg-pink-50', change: 'Voice assistant uses', changeType: 'neutral', delay: 0.65 },
    { label: 'Storage Used', value: m.storageUsed, icon: <HardDrive size={18} />, color: 'text-orange-600', bgColor: 'bg-orange-50', change: 'Of 10 GB quota', changeType: 'neutral', delay: 0.7 },
    { label: 'API Health', value: `${m.apiHealth}%`, icon: <Server size={18} />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', change: 'Uptime this month', changeType: 'up', delay: 0.75 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="ALL">All Time</option>
          </select>
          <button
            onClick={() => { setLoading(true); fetchData(); setLastRefresh(new Date()); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KPICard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User Growth + Applications - Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">User & Application Growth</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly trend over 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts.userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="users" name="Citizens" stroke="#3b82f6" strokeWidth={2} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#10b981" strokeWidth={2} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status - Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Application Status</h3>
          <p className="text-xs text-slate-400 mb-5">Current distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts.applicationsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {charts.applicationsByStatus.map((_: any, index: number) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'Applications']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Schemes by State */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Schemes by State</h3>
          <p className="text-xs text-slate-400 mb-5">Top 8 states</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.schemesByState} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Schemes" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily API Traffic */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-1">Daily API Traffic</h3>
          <p className="text-xs text-slate-400 mb-5">Last 7 days — requests, OCR & AI calls</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts.dailyTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="requests" name="Total Requests" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ocr" name="OCR" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ai" name="AI" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Usage Radar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 col-span-1 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-1">Feature Usage Distribution</h3>
          <p className="text-xs text-slate-400 mb-5">Relative engagement across modules</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
              { subject: 'AI Assistant', A: m.aiRequests, fullMark: 5000 },
              { subject: 'OCR Scan', A: m.ocrRequests, fullMark: 5000 },
              { subject: 'Voice Search', A: m.voiceRequests, fullMark: 5000 },
              { subject: 'App Track', A: m.totalApplications, fullMark: 5000 },
              { subject: 'Profile Update', A: m.activeUsers, fullMark: 5000 },
              { subject: 'Auth', A: m.totalCitizens, fullMark: 5000 },
            ]}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="Usage" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
