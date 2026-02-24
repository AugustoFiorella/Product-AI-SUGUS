import React, { useState } from 'react';
import { Project, Feature, FeaturePriority, FeatureComplexity, BriefSection } from '../types';
import { Button, Badge } from '../components/UIComponents';
import { Sparkles, GripVertical, Trash2, Plus, Target, Layers, Lightbulb, Archive } from 'lucide-react';
import { generateFeatures } from '../services/geminiService';

interface FeatureIdeationProps {
  project: Project;
  onUpdate: (features: Feature[]) => void;
  onNext: () => void;
}

export const FeatureIdeation: React.FC<FeatureIdeationProps> = ({ project, onUpdate, onNext }) => {
  const [features, setFeatures] = useState<Feature[]>(project.features);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedFeatureId, setDraggedFeatureId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<FeaturePriority | null>(null);

  const priorities = Object.values(FeaturePriority);

  // --- Logic ---

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const briefContext = (Object.values(project.brief.sections) as BriefSection[])
      .map(s => `${s.title}: ${s.content}`)
      .join('\n\n');

    const newFeatures = await generateFeatures(briefContext);
    const updatedFeatures = [...features, ...newFeatures];
    setFeatures(updatedFeatures);
    onUpdate(updatedFeatures);
    setIsGenerating(false);
  };

  const deleteFeature = (id: string) => {
    const updated = features.filter(f => f.id !== id);
    setFeatures(updated);
    onUpdate(updated);
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedFeatureId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small timeout to allow the ghost image to be created before hiding the element if desired
    // (Optional) e.target.style.opacity = '0.5'; 
  };

  const handleDragOver = (e: React.DragEvent, priority: FeaturePriority) => {
    e.preventDefault(); // Necessary to allow dropping
    setDragOverColumn(priority);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newPriority: FeaturePriority) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedFeatureId) return;

    const updatedFeatures = features.map(f => 
      f.id === draggedFeatureId ? { ...f, priority: newPriority } : f
    );
    
    setFeatures(updatedFeatures);
    onUpdate(updatedFeatures);
    setDraggedFeatureId(null);
  };

  // --- UI Helpers ---

  const getPriorityTheme = (p: FeaturePriority) => {
    switch (p) {
      case FeaturePriority.MustHave: 
        return {
          bg: 'bg-rose-500/5',
          border: 'border-rose-500/20',
          header: 'text-rose-400',
          icon: 'text-rose-500',
          accent: 'bg-rose-500',
          dropZone: 'bg-rose-500/10 border-rose-500/50'
        };
      case FeaturePriority.ShouldHave: 
        return {
          bg: 'bg-orange-500/5',
          border: 'border-orange-500/20',
          header: 'text-orange-400',
          icon: 'text-orange-500',
          accent: 'bg-orange-500',
          dropZone: 'bg-orange-500/10 border-orange-500/50'
        };
      case FeaturePriority.CouldHave: 
        return {
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
          header: 'text-blue-400',
          icon: 'text-blue-500',
          accent: 'bg-blue-500',
          dropZone: 'bg-blue-500/10 border-blue-500/50'
        };
      case FeaturePriority.WontHave: 
        return {
          bg: 'bg-slate-500/5',
          border: 'border-slate-500/20',
          header: 'text-slate-400',
          icon: 'text-slate-500',
          accent: 'bg-slate-500',
          dropZone: 'bg-slate-500/10 border-slate-500/50'
        };
    }
  };

  const getPriorityIcon = (p: FeaturePriority) => {
    switch (p) {
      case FeaturePriority.MustHave: return <Target size={18} />;
      case FeaturePriority.ShouldHave: return <Layers size={18} />;
      case FeaturePriority.CouldHave: return <Lightbulb size={18} />;
      case FeaturePriority.WontHave: return <Archive size={18} />;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Feature Ideation</h1>
          <p className="text-muted mt-1">
            Drag and drop features to prioritize them using the MoSCoW framework.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handleGenerateAI} 
            isLoading={isGenerating}
            icon={<Sparkles size={16} />}
            className="shadow-lg shadow-violet-900/20"
          >
            Generate Ideas
          </Button>
          <Button onClick={onNext} className="shadow-lg shadow-emerald-900/20">
            Generate PRDs
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-4 min-h-[500px]">
        {priorities.map((priority) => {
          const columnFeatures = features.filter(f => f.priority === priority);
          const theme = getPriorityTheme(priority);
          const isOver = dragOverColumn === priority;
          
          return (
            <div 
              key={priority} 
              className={`flex flex-col h-full rounded-2xl border transition-colors duration-300 ${isOver ? theme.dropZone : `bg-surface/30 ${theme.border}`}`}
              onDragOver={(e) => handleDragOver(e, priority)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, priority)}
            >
              {/* Column Header */}
              <div className={`p-4 flex items-center justify-between border-b ${theme.border} bg-surface/50 rounded-t-2xl backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-surface ${theme.icon} shadow-sm`}>
                    {getPriorityIcon(priority)}
                  </div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${theme.header}`}>{priority}</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-background/50 border border-white/5 text-muted px-2.5 py-1 rounded-full">
                  {columnFeatures.length}
                </span>
              </div>
              
              {/* Droppable Area */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {columnFeatures.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40 border-2 border-dashed border-border rounded-xl">
                    <div className="mb-2 text-muted">{getPriorityIcon(priority)}</div>
                    <p className="text-sm text-muted font-medium">No features here</p>
                    <p className="text-xs text-muted-foreground">Drag items to move them</p>
                  </div>
                ) : (
                  columnFeatures.map((feature) => (
                    <div 
                      key={feature.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, feature.id)}
                      className={`
                        group relative bg-surface hover:bg-slate-800 border border-border hover:border-border/80 
                        rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
                        ${draggedFeatureId === feature.id ? 'opacity-50 ring-2 ring-primary border-primary' : ''}
                      `}
                    >
                      {/* Drag Handle & Content */}
                      <div className="flex gap-3">
                        <div className="mt-1 text-muted/30 group-hover:text-muted transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-2">
                             <h4 className="font-semibold text-sm text-slate-100 leading-snug break-words">
                                {feature.title}
                             </h4>
                             <button 
                                onClick={() => deleteFeature(feature.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 hover:text-red-400 text-muted rounded-md -mt-1 -mr-1"
                                title="Delete feature"
                              >
                                <Trash2 size={14} />
                              </button>
                          </div>
                          <p className="text-xs text-slate-400 mb-3 line-clamp-3 leading-relaxed">
                            {feature.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              feature.complexity === FeatureComplexity.High ? 'warning' :
                              feature.complexity === FeatureComplexity.Medium ? 'info' : 'success'
                            }>
                              {feature.complexity}
                            </Badge>
                            
                            {/* Color Bar Indicator */}
                            <div className={`h-1.5 w-8 rounded-full ${theme.accent} opacity-40`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Button Footer */}
              <div className="p-3 pt-0">
                 <button className="w-full py-2.5 rounded-xl border border-dashed border-border text-muted hover:text-white hover:border-primary/50 hover:bg-surface transition-all text-xs font-medium flex items-center justify-center gap-2 group">
                    <Plus size={14} className="group-hover:scale-110 transition-transform"/>
                    Add Manual Feature
                 </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-surface border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4 animate-bounce">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Brainstorming Features</h3>
              <p className="text-muted text-sm">Our AI is analyzing your brief and generating prioritized features...</p>
           </div>
        </div>
      )}
    </div>
  );
};