import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle, Target, FolderKanban, 
  Calendar, List, ArrowRight, Plus, Activity
} from 'lucide-react';
import { getVelocityChartAPI, getPerformanceMetricsAPI, getBurndownChartAPI } from '../../services/analytics.service';
import { getProjectsAPI } from '../../services/project.service';
import { getTasksAPI as getAllTasksAPI } from '../../services/task.service';
import { TaskDetail } from '../../features/tasks';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();
  
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
    const loadTasks = async () => {
      try {
        const data = await getAllTasksAPI();
        setAllTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };
    loadTasks();
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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask) => {
    setAllTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const todaysTasks = allTasks.filter(t => {
    if (selectedProjectId && t.project_id !== selectedProjectId) return false;
    if (!t.due_date || t.status === 'done') return false;
    const due = new Date(t.due_date);
    return due >= today && due < tomorrow;
  });

  const upcomingTasks = allTasks.filter(t => {
    if (selectedProjectId && t.project_id !== selectedProjectId) return false;
    if (!t.due_date || t.status === 'done') return false;
    const due = new Date(t.due_date);
    return due >= tomorrow && due <= nextWeek;
  });

  const overdueTasks = allTasks.filter(t => {
    if (selectedProjectId && t.project_id !== selectedProjectId) return false;
    if (!t.due_date || t.status === 'done') return false;
    const due = new Date(t.due_date);
    return due < today;
  });

  const completedThisWeek = allTasks.filter(t => {
    if (t.status !== 'done') return false;
    const updated = new Date(t.updated_at);
    return updated >= nextWeek && updated <= today;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200 ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );

  const TaskItem = ({ task, onClick }) => (
    <div 
      onClick={() => onClick?.(task)}
      className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-lg cursor-pointer transition"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          task.priority === 'urgent' ? 'bg-rose-500' :
          task.priority === 'high' ? 'bg-orange-500' :
          task.priority === 'medium' ? 'bg-indigo-500' : 'bg-emerald-500'
        }`} />
        <span className="text-sm text-slate-700 truncate max-w-[200px]">{task.title}</span>
      </div>
      <span className="text-xs text-slate-400">{formatDate(task.due_date)}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50/50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500 mt-1">Track your team performance</p>
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.project_id} value={p.project_id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total Tasks" 
            value={metrics.totalTasks}
            icon={Target}
            color="bg-indigo-100 text-indigo-600"
            subtitle="All time"
            onClick={() => navigate('/tasks')}
          />
          <StatCard 
            title="Overdue" 
            value={overdueTasks.length}
            icon={AlertTriangle}
            color="bg-rose-100 text-rose-600"
            subtitle={`${metrics.overdueRate}% rate`}
          />
          <StatCard 
            title="Avg Lead Time" 
            value={`${metrics.avgLeadTimeDays}d`}
            icon={Clock}
            color="bg-amber-100 text-amber-600"
            subtitle="From creation"
          />
          <StatCard 
            title="Completion" 
            value={`${Math.max(0, 100 - metrics.overdueRate)}%`}
            icon={TrendingUp}
            color="bg-emerald-100 text-emerald-600"
            subtitle="On time"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's & Upcoming Tasks */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-500" size={18} />
                  <h3 className="text-sm font-semibold text-slate-800">Today</h3>
                </div>
                <span className="text-xs font-medium bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                  {todaysTasks.length}
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {todaysTasks.length > 0 ? (
                  todaysTasks.slice(0, 5).map(task => (
                    <TaskItem key={task.task_id} task={task} onClick={handleTaskClick} />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">No tasks due today</div>
                )}
              </div>
              {todaysTasks.length > 5 && (
                <div className="p-3 border-t border-slate-100 text-center">
                  <button className="text-xs text-indigo-600 font-medium flex items-center justify-center gap-1">
                    +{todaysTasks.length - 5} more <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="text-amber-500" size={18} />
                  <h3 className="text-sm font-semibold text-slate-800">This Week</h3>
                </div>
                <span className="text-xs font-medium bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md">
                  {upcomingTasks.length}
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.slice(0, 5).map(task => (
                    <TaskItem key={task.task_id} task={task} onClick={handleTaskClick} />
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">No upcoming tasks</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Velocity Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-800">Team Velocity</h3>
                <p className="text-sm text-slate-500">Tasks completed per week</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="week_start" tickFormatter={(val) => val?.substring(5) || ''} axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#F1F5F9'}} />
                    <Bar dataKey="completed_tasks" fill="#6366F1" radius={[4, 4, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Burndown Chart */}
            {selectedProjectId ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-800">Project Burndown</h3>
                  <p className="text-sm text-slate-500">Remaining tasks over time</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={burndownData}>
                      <defs>
                        <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tickFormatter={(val) => val?.substring(5) || ''} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_tasks" stroke="#94A3B8" strokeDasharray="5 5" name="Total" />
                      <Area type="stepAfter" dataKey="remaining_tasks" stroke="#10B981" fillOpacity={1} fill="url(#colorRemaining)" name="Remaining" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center min-h-[250px]">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderKanban className="text-slate-400" size={32} />
                </div>
                <h3 className="text-base font-medium text-slate-800 mb-1">Select a Project</h3>
                <p className="text-sm text-slate-500">Choose a project to view burndown chart</p>
                <button 
                  onClick={() => navigate('/projects')}
                  className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-medium"
                >
                  <Plus size={16} /> Create Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Projects Quick Access */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="text-emerald-500" size={18} />
              <h3 className="text-sm font-semibold text-slate-800">Projects Overview</h3>
            </div>
            <button 
              onClick={() => navigate('/projects')}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {projects.slice(0, 3).map(project => (
              <div 
                key={project.project_id}
                onClick={() => navigate(`/projects/${project.project_id}`)}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm cursor-pointer transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FolderKanban className="text-indigo-600" size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{project.name}</h4>
                    <p className="text-xs text-slate-500">{project.member_count || 0} members</p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${project.stats?.completion_percentage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{Math.round(project.stats?.completion_percentage || 0)}% complete</p>
              </div>
            ))}
            <div 
              onClick={() => navigate('/projects')}
              className="p-4 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition flex flex-col items-center justify-center"
            >
              <Plus className="text-slate-400 mb-2" size={24} />
              <p className="text-sm font-medium text-slate-600">New Project</p>
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleTaskUpdate} 
        />
      )}
    </div>
  );
};