import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es';

export const translations = {
  en: {
    // Menu
    'menu.dashboard': 'Dashboard',
    'menu.productDevelopment': 'Product Development',
    'menu.brief': '1. Product Brief',
    'menu.features': '2. Feature Ideation',
    'menu.prd': '3. PRD Generation',
    'menu.journey': '4. User Journey',
    'menu.implementation': '5. Implementation',
    'menu.settings': 'Settings',
    'menu.language': 'Language',
    
    // Dashboard
    'dash.title': 'Dashboard',
    'dash.subtitle': 'Overview of your product portfolio, recent activity, and AI generation usage.',
    'dash.newProject': 'New Project',
    'dash.currentPlan': 'Current Plan',
    'dash.totalProjects': 'Total Projects',
    'dash.avgProgress': 'Avg. Progress',
    'dash.featuresDefined': 'Features Defined',
    'dash.aiTimeSaved': 'AI Time Saved',
    'dash.allProjects': 'All Projects',
    'dash.active': 'Active',
    'dash.drafts': 'Drafts',
    'dash.search': 'Search projects...',
    'dash.noProjects': 'No projects found',
    'dash.quickActions': 'Quick Actions',
    'dash.startBrief': 'Start new brief',
    'dash.browseTemplates': 'Browse templates',
    'dash.recentActivity': 'Recent Activity',
    
    // Common
    'common.save': 'Save',
    'common.continue': 'Continue',
    'common.generate': 'Generate',
  },
  es: {
    // Menu
    'menu.dashboard': 'Panel Principal',
    'menu.productDevelopment': 'Desarrollo de Producto',
    'menu.brief': '1. Brief del Producto',
    'menu.features': '2. Ideación de Features',
    'menu.prd': '3. Generación PRD',
    'menu.journey': '4. Flujo de Usuario',
    'menu.implementation': '5. Implementación',
    'menu.settings': 'Configuración',
    'menu.language': 'Idioma',

    // Dashboard
    'dash.title': 'Panel de Control',
    'dash.subtitle': 'Resumen de tu portafolio, actividad reciente y uso de IA.',
    'dash.newProject': 'Nuevo Proyecto',
    'dash.currentPlan': 'Plan Actual',
    'dash.totalProjects': 'Proyectos Totales',
    'dash.avgProgress': 'Progreso Prom.',
    'dash.featuresDefined': 'Features Definidas',
    'dash.aiTimeSaved': 'Tiempo Ahorrado',
    'dash.allProjects': 'Todos',
    'dash.active': 'Activos',
    'dash.drafts': 'Borradores',
    'dash.search': 'Buscar proyectos...',
    'dash.noProjects': 'No se encontraron proyectos',
    'dash.quickActions': 'Acciones Rápidas',
    'dash.startBrief': 'Iniciar nuevo brief',
    'dash.browseTemplates': 'Ver plantillas',
    'dash.recentActivity': 'Actividad Reciente',

    // Common
    'common.save': 'Guardar',
    'common.continue': 'Continuar',
    'common.generate': 'Generar',
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
