import React, { useState, useEffect, useContext } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle, Target, Users
} from 'lucide-react';
import { getVelocityChartAPI, getPerformanceMetricsAPI, getBurndownChartAPI } from '../../services/analytics.service';
import { getProjectsAPI } from '../../services/project.service';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  const [metrics, setMetrics] = useState({
    overdueRate: 0,
    avgLeadTimeDays: 0,
    totalTasks: 0,
    overdueTasks: 0
  });
  const [velocityData, setVelocityData] = useState([]);
  const [burndownData, setBurndownData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjectsAPI();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pId = selectedProjectId || null;
        const [metricsRes, velocityRes] = await Promise.all([
          getPerformanceMetricsAPI(pId),
          getVelocityChartAPI(pId)
        ]);
        
        if (metricsRes?.data) {
          setMetrics(metricsRes.data);
        }
        if (velocityRes?.data) {
          setVelocityData(velocityRes.data);
        }
        
        if (pId) {
          const burndownRes = await getBurndownChartAPI(pId);
          if (burndownRes?.data) {
            setBurndownData(burndownRes.data);
          }
        } else {
          setBurndownData([]);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProjectId]);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass} size={20} />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Track your project progress</p>
          </div>
          
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Personal Dashboard</option>
            {projects.map(p => (
              <option key={p.project_id} value={p.project_id}>{p.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Tasks" 
                value={metrics.totalTasks}
                icon={Target}
                colorClass="text-blue-500"
                subtitle="All time"
              />
              <StatCard 
                title="Overdue Tasks" 
                value={metrics.overdueTasks}
                icon={AlertTriangle}
                colorClass="text-red-500"
                subtitle={`${metrics.overdueRate}%`}
              />
              <StatCard 
                title="Overdue Rate" 
                value={`${metrics.overdueRate}%`}
                icon={TrendingUp}
                colorClass="text-orange-500"
                subtitle="Needs attention"
              />
              <StatCard 
                title="Avg Lead Time" 
                value={`${metrics.avgLeadTimeDays}d`}
                icon={Clock}
                colorClass="text-emerald-500"
                subtitle="From creation"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Velocity Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Team Velocity</h3>
                  <p className="text-sm text-slate-500">Tasks per week</p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={velocityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="week_start" tickFormatter={(val) => val.substring(5)} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{fill: '#F1F5F9'}} />
                      <Bar dataKey="completed_tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Burndown Chart */}
              {selectedProjectId ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Project Burndown</h3>
                    <p className="text-sm text-slate-500">Remaining tasks</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={burndownData}>
                        <defs>
                          <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total_tasks" stroke="#94A3B8" strokeDasharray="5 5" name="Total Scope" />
                        <Area type="stepAfter" dataKey="remaining_tasks" stroke="#10B981" fillOpacity={1} fill="url(#colorRemaining)" name="Remaining" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-1">Select Project</h3>
                  <p className="text-sm text-slate-400">Select a project to view burndown chart</p>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};
