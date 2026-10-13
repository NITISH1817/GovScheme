import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, PieChart, Users, Activity, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Pie, Cell } from 'recharts';
import { apiClient } from '../../api/apiClient';

export const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6M');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      let res: any = null;
      try {
        res = await apiClient.get('/admin/analytics', { timeRange });
      } catch (adminErr) {
        res = await apiClient.get('/analytics/dashboard', { timeRange });
      }

      if (res && res.metrics) {
        setAnalyticsData(res);
      }
    } catch (e: any) {
      console.error('Failed to load analytics', e);
      setError(e?.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const metrics = {
    totalCitizens: analyticsData?.metrics?.totalCitizens ?? 0,
    totalApplications: analyticsData?.metrics?.totalApplications ?? 0,
    approvedApps: analyticsData?.metrics?.approvedApps ?? 0,
    apiHealth: analyticsData?.metrics?.apiHealth ?? 100
  };

  const areaData = analyticsData?.charts?.userGrowth || [];
  const barData = analyticsData?.charts?.schemesByCategory || [];

  const handleExportCSV = () => {
    const headers = ['Category / Month', 'Citizens', 'Applications'];
    const rows = areaData.map((d: any) => [`"${d.name}"`, d.users, d.applications]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govscheme_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Platform Analytics & Intelligence</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Deep dive into citizen engagement, demographic penetration, and scheme performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
          >
            <option value="1M">Last 30 Days</option>
            <option value="3M">Last Quarter (3M)</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Full Year (1Y)</option>
          </select>
          <button 
            onClick={fetchAnalytics}
            className="p-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-xs transition-colors shadow-md shadow-blue-500/20"
          >
            <Download className="w-4 h-4" /> Export Analytics CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 font-medium text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <span>{error}</span>
          <button 
            type="button" 
            onClick={fetchAnalytics} 
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#1769FF]/10 dark:bg-[#60A5FA]/10 rounded-lg">
              <Users className="w-6 h-6 text-[#1769FF] dark:text-[#60A5FA]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">Live</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">
              {(metrics.totalCitizens ?? 0).toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">Registered Citizens</div>
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#D97706]/10 dark:bg-[#FBBF24]/10 rounded-lg">
              <Activity className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">Live</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">
              {(metrics.totalApplications ?? 0).toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">Applications Submitted</div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#8B5CF6]/10 dark:bg-[#A78BFA]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#8B5CF6] dark:text-[#A78BFA]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">Live</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">
              {(metrics.approvedApps ?? 0).toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">Applications Sanctioned</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Engagement Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-6">Beneficiary Growth & Intake Curve</h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1769FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1769FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: '#243449', color: '#F8FAFC', borderRadius: '8px' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Area type="monotone" dataKey="users" stroke="#1769FF" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-6">Program Distribution by Category</h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: '#243449', color: '#F8FAFC', borderRadius: '8px' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Bar dataKey="value" fill="#1769FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
