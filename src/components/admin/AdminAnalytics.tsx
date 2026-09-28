import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, PieChart, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const barData = [
    { name: 'Agriculture', applications: 4000 },
    { name: 'Education', applications: 3000 },
    { name: 'Health', applications: 2000 },
    { name: 'Housing', applications: 2780 },
    { name: 'Finance', applications: 1890 },
    { name: 'Women', applications: 2390 },
  ];

  const areaData = [
    { name: 'Jan', active: 4000 },
    { name: 'Feb', active: 4500 },
    { name: 'Mar', active: 5200 },
    { name: 'Apr', active: 6800 },
    { name: 'May', active: 7400 },
    { name: 'Jun', active: 8900 },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Platform Analytics</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Deep dive into citizen engagement and scheme performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] text-[#07111F] dark:text-[#F8FAFC] rounded-lg font-bold text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#1769FF]/10 dark:bg-[#60A5FA]/10 rounded-lg">
              <Users className="w-6 h-6 text-[#1769FF] dark:text-[#60A5FA]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">1.2M</div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">Active Citizens</div>
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#D97706]/10 dark:bg-[#FBBF24]/10 rounded-lg">
              <Activity className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">+8.2%</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">450K</div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">Applications Submitted</div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#8B5CF6]/10 dark:bg-[#A78BFA]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#8B5CF6] dark:text-[#A78BFA]" />
            </div>
            <span className="text-xs font-bold text-[#15803D] dark:text-[#4ADE80] bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-2 py-1 rounded-full">+4.1%</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">82%</div>
            <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">AI Match Success Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Engagement Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-6">User Engagement Trend</h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1769FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1769FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: '#243449', color: '#F8FAFC', borderRadius: '8px' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Area type="monotone" dataKey="active" stroke="#1769FF" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-6">Applications by Category</h3>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#0B1424', borderColor: '#243449', color: '#F8FAFC', borderRadius: '8px' }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Bar dataKey="applications" fill="#1769FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
