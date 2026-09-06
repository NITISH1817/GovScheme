import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Download, RefreshCw, TrendingUp, Activity } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { DashboardSkeleton } from '../components/Skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-1">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard: React.FC<{
  title: string; subtitle?: string; children: React.ReactNode;
  delay?: number; onExport?: () => void;
}> = ({ title, subtitle, children, delay = 0, onExport }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white rounded-xl border border-slate-200 p-5"
  >
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {onExport && (
        <button onClick={onExport} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Download size={15} />
        </button>
      )}
    </div>
    {children}
  </motion.div>
);

// Synthetic monthly trend data
const makeMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map(name => ({
    name,
    registrations: Math.floor(Math.random() * 500 + 200),
    applications: Math.floor(Math.random() * 300 + 100),
    approved: Math.floor(Math.random() * 150 + 50),
    rejected: Math.floor(Math.random() * 50 + 10),
  }));
};

const aiUsageData = [
  { name: 'Mon', recommendations: 820, ocr: 340, chatbot: 180 },
  { name: 'Tue', recommendations: 932, ocr: 420, chatbot: 220 },
  { name: 'Wed', recommendations: 901, ocr: 390, chatbot: 195 },
  { name: 'Thu', recommendations: 1034, ocr: 480, chatbot: 240 },
  { name: 'Fri', recommendations: 890, ocr: 360, chatbot: 210 },
  { name: 'Sat', recommendations: 543, ocr: 200, chatbot: 140 },
  { name: 'Sun', recommendations: 420, ocr: 160, chatbot: 100 },
];

const funnelData = [
  { value: 10000, name: 'Portal Visitors', fill: '#3b82f6' },
  { value: 6800, name: 'Registered Users', fill: '#6366f1' },
  { value: 3200, name: 'Started Application', fill: '#8b5cf6' },
  { value: 2100, name: 'Submitted Application', fill: '#a855f7' },
  { value: 1400, name: 'Approved', fill: '#10b981' },
];

const radarData = [
  { metric: 'Agriculture', A: 120 },
  { metric: 'Education', A: 98 },
  { metric: 'Health', A: 86 },
  { metric: 'Housing', A: 72 },
  { metric: 'Employment', A: 65 },
  { metric: 'Women', A: 55 },
  { metric: 'SC/ST', A: 48 },
];

export const AnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData] = useState(makeMonthlyData);
  const [dateRange, setDateRange] = useState('6m');

  useEffect(() => {
    apiClient.get('/analytics/dashboard')
      .then(data => { if (data.success) setAnalyticsData(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const schemesByCategory = analyticsData?.charts?.schemesByCategory || [];
  const schemesByState = analyticsData?.charts?.schemesByState || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Advanced Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Interactive platform intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {['1m', '3m', '6m', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateRange === range ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >{range}</button>
          ))}
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Row 1: Monthly Registrations + Applications (Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Monthly Registrations" subtitle="Citizen registrations over time" delay={0}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#3b82f6" strokeWidth={2} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Applications per Month" subtitle="Submissions, approvals, and rejections" delay={0.05}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="applications" name="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Scheme Popularity + State-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Scheme Popularity by Category" subtitle="Distribution across scheme types" delay={0.1}>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={schemesByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={3} nameKey="name">
                {schemesByCategory.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'Schemes']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="State-wise Usage" subtitle="Top 8 states by scheme count" delay={0.15}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={schemesByState} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Schemes" radius={[0, 6, 6, 0]}>
                {schemesByState.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: AI Usage Line + Application Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="AI & OCR Usage" subtitle="Daily API calls by module (last 7 days)" delay={0.2}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={aiUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="recommendations" name="Recommendations" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ocr" name="OCR Scans" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="chatbot" name="Chatbot" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Application Funnel" subtitle="Citizen journey from visit to approval" delay={0.25}>
          <ResponsiveContainer width="100%" height={230}>
            <FunnelChart>
              <Tooltip formatter={(v: number) => [v.toLocaleString(), '']} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="insideLeft" fill="#fff" stroke="none" dataKey="name" style={{ fontSize: 11, fontWeight: 600 }} />
                <LabelList position="right" fill="#64748b" stroke="none" dataKey="value" formatter={(v: number) => v.toLocaleString()} style={{ fontSize: 11 }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Radar chart */}
      <ChartCard title="Scheme Category Radar" subtitle="Relative scheme volume across categories" delay={0.3}>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
            <Radar name="Schemes" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
