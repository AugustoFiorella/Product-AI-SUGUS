import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { ProductBrief } from './views/ProductBrief';
import { FeatureIdeation } from './views/FeatureIdeation';
import { PRDGenerator } from './views/PRDGenerator';
import { UserJourneyView } from './views/UserJourney';
import { Project, ProjectStatus, ViewState, INITIAL_BRIEF_SECTIONS, BriefSection } from './types';
import { GoogleGenAI } from "@google/genai";
import { LanguageProvider } from './contexts/LanguageContext';

// Ensure we have an API Key, though we won't block render if missing, just alert on action
const apiKey = process.env.API_KEY;

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Persistence (mocking backend)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('productai_projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('productai_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: `Untitled Project ${projects.length + 1}`,
      description: 'New product idea',
      status: ProjectStatus.Draft,
      progress: 0,
      brief: { sections: JSON.parse(JSON.stringify(INITIAL_BRIEF_SECTIONS)) }, // Deep copy
      features: [],
      prds: [],
      userJourney: { nodes: [], edges: [] },
      createdAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setCurrentView('BRIEF');
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => {
      if (p.id !== projectId) return p;
      
      const updated = { ...p, ...updates };
      // Calc progress loosely
      let progress = 0;
      if ((Object.values(updated.brief.sections) as BriefSection[]).some(s => s.content)) progress += 20;
      if (updated.features.length > 0) progress += 30;
      if (updated.prds.length > 0) progress += 30;
      if (updated.userJourney && updated.userJourney.nodes.length > 0) progress += 20;
      
      updated.progress = Math.min(100, progress);
      return updated;
    }));
  };

  const handleNavigate = (view: ViewState) => {
    if (view !== 'DASHBOARD' && !activeProjectId) {
      alert("Please select or create a project first.");
      return;
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    if (currentView === 'DASHBOARD') {
      return (
        <Dashboard 
          projects={projects} 
          onCreateProject={createProject}
          onSelectProject={(id) => {
            setActiveProjectId(id);
            setCurrentView('BRIEF');
          }}
        />
      );
    }

    if (!activeProject) return <div>Project not found</div>;

    switch (currentView) {
      case 'BRIEF':
        return (
          <ProductBrief 
            project={activeProject} 
            onUpdate={(brief) => updateProject(activeProject.id, { brief })}
            onNext={() => setCurrentView('FEATURES')}
          />
        );
      case 'FEATURES':
        return (
          <FeatureIdeation 
            project={activeProject} 
            onUpdate={(features) => updateProject(activeProject.id, { features })}
            onNext={() => setCurrentView('PRD')}
          />
        );
      case 'PRD':
        return (
          <PRDGenerator 
            project={activeProject}
            onUpdate={(prds) => updateProject(activeProject.id, { prds })}
          />
        );
      case 'JOURNEY':
        return (
          <UserJourneyView 
            project={activeProject}
            onUpdate={(userJourney) => updateProject(activeProject.id, { userJourney })}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
            <p>The {currentView} module is under development for this demo.</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={handleNavigate}
      projectName={activeProject?.name}
    >
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
