import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  ArrowRight, 
  Activity, 
  Zap, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  MoreVertical, 
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { Card, Button, Badge, Input } from '../components/UIComponents';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateProject, onSelectProject }) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  // --- Derived State ---
  const activeProjects = projects.filter(p => p.status === ProjectStatus.Active).length;
  const completedFeatures = projects.reduce((acc, p) => acc + p.features.length, 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) 
    : 0;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filter === 'ALL' 
      ? true 
      : filter === 'ACTIVE' 
        ? p.status === ProjectStatus.Active 
        : p.status === ProjectStatus.Draft;
    return matchesSearch && matchesStatus;
  });

  // Mock Activity Feed
  const activities = [
    { id: 1, user: 'You', action: 'created a new project', target: 'E-Commerce MVP', time: '2 hours ago', icon: <Plus size={14} /> },
    { id: 2, user: 'System', action: 'generated PRD for', target: 'User Authentication', time: '5 hours ago', icon: <Zap size={14} /> },
    { id: 3, user: 'You', action: 'completed brief for', target: 'SaaS Dashboard', time: '1 day ago', icon: <CheckCircle2 size={14} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{t('dash.title')}</h1>
          <p className="text-muted text-sm max-w-xl">
            {t('dash.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:block text-right mr-4">
              <p className="text-xs text-muted font-medium uppercase tracking-wider">{t('dash.currentPlan')}</p>
              <p className="text-sm text-emerald-400 font-bold">Pro Edition</p>
           </div>
           <Button onClick={onCreateProject} size="lg" icon={<Plus size={18} />} className="shadow-lg shadow-emerald-500/20">
            {t('dash.newProject')}
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('dash.totalProjects')}
          value={projects.length} 
          trend="+2 this month" 
          trendUp={true}
          icon={<FileText size={20} className="text-blue-400" />}
          color="bg-blue-500/10 border-blue-500/20"
        />
        <StatCard 
          title={t('dash.avgProgress')}
          value={`${avgProgress}%`} 
          trend="+5% vs last week" 
          trendUp={true}
          icon={<Activity size={20} className="text-emerald-400" />}
          color="bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard 
          title={t('dash.featuresDefined')} 
          value={completedFeatures} 
          trend="Across all projects" 
          trendUp={true}
          icon={<CheckCircle2 size={20} className="text-violet-400" />}
          color="bg-violet-500/10 border-violet-500/20"
        />
        <StatCard 
          title={t('dash.aiTimeSaved')}
          value="~12h" 
          trend="Estimated efficiency" 
          trendUp={true}
          icon={<Zap size={20} className="text-amber-400" />}
          color="bg-amber-500/10 border-amber-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Project List Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface/30 p-2 rounded-xl border border-border">
            <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border w-full sm:w-auto">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'ALL' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {t('dash.allProjects')}
              </button>
              <button 
                onClick={() => setFilter('ACTIVE')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'ACTIVE' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {t('dash.active')}
              </button>
              <button 
                onClick={() => setFilter('DRAFT')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === 'DRAFT' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted hover:text-text'}`}
              >
                {t('dash.drafts')}
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
              <input 
                type="text" 
                placeholder={t('dash.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl bg-surface/20">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Filter size={24} className="text-muted" />
              </div>
              <h3 className="text-lg font-medium text-white">{t('dash.noProjects')}</h3>
              <p className="text-muted mb-6">Try adjusting your filters or create a new project.</p>
              <Button onClick={onCreateProject}>{t('dash.newProject')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => onSelectProject(project.id)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Activity & Quick Links */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-violet-900/20 rounded-xl p-1 border border-white/5">
             <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-5 border border-border/50">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <Zap size={16} className="text-yellow-400" /> {t('dash.quickActions')}
                </h3>
                <div className="space-y-2">
                  <button onClick={onCreateProject} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-muted hover:text-white transition-colors flex items-center gap-3 group">
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Plus size={14} />
                    </div>
                    {t('dash.startBrief')}
                  </button>
                  <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-muted hover:text-white transition-colors flex items-center gap-3 group">
                     <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                      <Search size={14} />
                    </div>
                    {t('dash.browseTemplates')}
                  </button>
                </div>
             </div>
          </div>

          {/* Activity Feed */}
          <Card className="h-auto">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-white">{t('dash.recentActivity')}</h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2">View All</Button>
            </div>
            <div className="p-0">
               {activities.map((activity, index) => (
                 <div key={activity.id} className={`px-5 py-4 flex gap-3 hover:bg-white/5 transition-colors ${index !== activities.length -1 ? 'border-b border-border/50' : ''}`}>
                    <div className="mt-1 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted flex-shrink-0">
                       {activity.icon}
                    </div>
                    <div>
                       <p className="text-sm text-text leading-snug">
                          <span className="font-medium text-white">{activity.user}</span> {activity.action} <span className="text-primary">{activity.target}</span>
                       </p>
                       <p className="text-xs text-muted mt-1 flex items-center gap-1">
                          <Clock size={10} /> {activity.time}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for cleaner code ---

const StatCard: React.FC<{ title: string; value: string | number; trend: string; trendUp: boolean; icon: React.ReactNode; color: string }> = ({ 
  title, value, trend, trendUp, icon, color 
}) => (
  <div className={`p-5 rounded-xl border bg-surface/50 backdrop-blur-sm ${color} transition-all duration-300 hover:bg-surface`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-muted text-xs font-medium uppercase tracking-wider">{title}</span>
      {icon}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
    </div>
    <div className="flex items-center gap-1 mt-2">
      {trendUp ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingUp size={12} className="text-red-400 rotate-180" />}
      <span className="text-xs text-muted font-medium">{trend}</span>
    </div>
  </div>
);

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-surface border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="flex justify-between items-start mb-4 pl-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/5 flex items-center justify-center text-white font-bold text-lg shadow-inner">
           {project.name.charAt(0)}
        </div>
        <div>
           <h3 className="font-bold text-white group-hover:text-primary transition-colors">{project.name}</h3>
           <p className="text-xs text-muted flex items-center gap-1">
              <Calendar size={10} /> Updated today
           </p>
        </div>
      </div>
      <Badge variant={project.status === ProjectStatus.Active ? 'success' : 'default'}>
        {project.status}
      </Badge>
    </div>

    <p className="text-sm text-slate-400 mb-6 line-clamp-2 pl-2 h-10">
       {project.description || "No description provided."}
    </p>

    <div className="pl-2">
      <div className="flex justify-between text-xs text-muted mb-1.5 font-medium">
        <span>Completion</span>
        <span>{project.progress}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 relative"
          style={{ width: `${project.progress}%` }}
        >
           <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
         <div className="flex -space-x-2">
            {[1,2,3].map(i => (
               <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-surface flex items-center justify-center text-[10px] text-white">
                  {String.fromCharCode(64 + i)}
               </div>
            ))}
         </div>
         <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Project <ArrowRight size={12} />
         </span>
      </div>
    </div>
  </div>
);
