import React, { useState } from 'react';
import { Project, PRD, Feature, BriefSection } from '../types';
import { Button, Card, TextArea } from '../components/UIComponents';
import { Sparkles, CheckCircle2, Copy } from 'lucide-react';
import { generatePRD } from '../services/geminiService';

interface PRDGeneratorProps {
  project: Project;
  onUpdate: (prds: PRD[]) => void;
}

export const PRDGenerator: React.FC<PRDGeneratorProps> = ({ project, onUpdate }) => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    project.features.length > 0 ? project.features[0].id : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const activeFeatures = project.features.filter(f => f.priority !== "Won't Have");

  const getPRD = (featureId: string) => project.prds.find(p => p.featureId === featureId);

  const handleGenerate = async () => {
    if (!selectedFeatureId) return;

    setIsLoading(true);
    const feature = project.features.find(f => f.id === selectedFeatureId);
    
    if (feature) {
      // Create context from brief
      const context = (Object.values(project.brief.sections) as BriefSection[])
        .map(s => `${s.title}: ${s.content}`)
        .join('\n\n');

      const content = await generatePRD(feature, context);
      
      const newPRD: PRD = { featureId: feature.id, content };
      
      // Update or add
      const existingIdx = project.prds.findIndex(p => p.featureId === feature.id);
      let updatedPRDs = [...project.prds];
      if (existingIdx >= 0) {
        updatedPRDs[existingIdx] = newPRD;
      } else {
        updatedPRDs.push(newPRD);
      }
      
      onUpdate(updatedPRDs);
    }
    setIsLoading(false);
  };

  const currentFeature = activeFeatures.find(f => f.id === selectedFeatureId);
  const currentPRD = selectedFeatureId ? getPRD(selectedFeatureId) : null;

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6">
      {/* Sidebar: Features List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2">PRD Generation</h1>
           <p className="text-muted text-sm">Select a feature to generate technical specs.</p>
        </div>
        
        <Card className="flex-1 overflow-y-auto bg-surface/50">
          <div className="p-2 space-y-1">
            {activeFeatures.map(feature => {
              const hasPrd = !!getPRD(feature.id);
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeatureId(feature.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                    selectedFeatureId === feature.id 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'hover:bg-surface border border-transparent'
                  }`}
                >
                  <span className="truncate font-medium">{feature.title}</span>
                  {hasPrd && <CheckCircle2 size={16} className="text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Main Area: Editor/Viewer */}
      <div className="w-2/3 flex flex-col">
        {selectedFeatureId && currentFeature ? (
          <Card className="flex-1 flex flex-col h-full bg-surface border-border">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <div>
                <h2 className="font-bold text-lg text-white">{currentFeature.title}</h2>
                <span className="text-xs text-muted uppercase">{currentFeature.priority}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isLoading} 
                  icon={<Sparkles size={16} />}
                  size="sm"
                >
                  {currentPRD ? 'Regenerate' : 'Generate with AI'}
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-0 overflow-hidden relative">
               {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-10">
                     <Sparkles className="w-8 h-8 text-primary animate-pulse mb-4" />
                     <p className="text-muted">Writing detailed specifications...</p>
                  </div>
               ) : null}
               
               <TextArea 
                 className="w-full h-full resize-none border-0 p-6 focus:ring-0 bg-background font-mono text-sm leading-relaxed" 
                 value={currentPRD?.content || ""}
                 placeholder="Select 'Generate with AI' to create the PRD..."
                 onChange={(e) => {
                   // Allow manual edits
                   if (!selectedFeatureId) return;
                   const updated = [...project.prds];
                   const idx = updated.findIndex(p => p.featureId === selectedFeatureId);
                   if (idx >= 0) {
                     updated[idx].content = e.target.value;
                     onUpdate(updated);
                   }
                 }}
               />
            </div>
          </Card>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            Select a feature to start
          </div>
        )}
      </div>
    </div>
  );
};