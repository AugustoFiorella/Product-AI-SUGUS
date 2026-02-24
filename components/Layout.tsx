import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ListTodo, 
  FileCode, 
  GitBranch, 
  Code2, 
  LogOut,
  ChevronRight,
  Menu,
  Globe,
  Languages
} from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  projectName?: string;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  completed?: boolean;
}> = ({ icon, label, isActive, onClick, completed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-primary/10 text-primary border border-primary/20' 
        : 'text-muted hover:text-text hover:bg-surface'
    }`}
  >
    <div className={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
    <span>{label}</span>
    {completed && (
      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></span>
    )}
    {isActive && !completed && (
      <ChevronRight className="ml-auto w-4 h-4 text-primary opacity-50" />
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, projectName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex font-sans text-text">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-violet-400">
              ProductAI
            </span>
          </div>

          {/* Project Info */}
          {projectName && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Current Project</p>
              <h2 className="text-sm font-medium text-text truncate" title={projectName}>{projectName}</h2>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label={t('menu.dashboard')}
              isActive={currentView === 'DASHBOARD'} 
              onClick={() => onNavigate('DASHBOARD')} 
            />
            
            <div className="pt-4 pb-2 px-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">{t('menu.productDevelopment')}</p>
            </div>

            <NavItem 
              icon={<FileText size={18} />} 
              label={t('menu.brief')}
              isActive={currentView === 'BRIEF'} 
              onClick={() => onNavigate('BRIEF')} 
              completed={false} 
            />
            <NavItem 
              icon={<ListTodo size={18} />} 
              label={t('menu.features')}
              isActive={currentView === 'FEATURES'} 
              onClick={() => onNavigate('FEATURES')} 
            />
            <NavItem 
              icon={<FileCode size={18} />} 
              label={t('menu.prd')}
              isActive={currentView === 'PRD'} 
              onClick={() => onNavigate('PRD')} 
            />
             <NavItem 
              icon={<GitBranch size={18} />} 
              label={t('menu.journey')}
              isActive={currentView === 'JOURNEY'} 
              onClick={() => onNavigate('JOURNEY')} 
            />
             <NavItem 
              icon={<Code2 size={18} />} 
              label={t('menu.implementation')}
              isActive={currentView === 'TECH_DOCS'} 
              onClick={() => onNavigate('TECH_DOCS')} 
            />
            
            <div className="my-4 border-t border-border mx-2" />
            
            {/* Language Switcher in Menu */}
             <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <div className="text-muted-foreground"><Languages size={18} /></div>
              <span>{language === 'en' ? 'Español' : 'English'}</span>
              <div className="ml-auto">
                 <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-border">
                    {language.toUpperCase()}
                 </span>
              </div>
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
              <img src="https://picsum.photos/32/32" alt="User" className="w-8 h-8 rounded-full border border-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">Demo User</p>
                <p className="text-xs text-muted truncate">Pro Plan</p>
              </div>
              <LogOut size={16} className="text-muted hover:text-red-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border bg-surface flex items-center px-4 justify-between z-40">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text">
             <Menu size={24} />
           </button>
           <span className="font-bold">ProductAI</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative">
          <div className="max-w-6xl mx-auto pb-20">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};
