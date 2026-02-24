import React, { useState } from 'react';
import { Sparkles, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, ProductBrief as BriefType, BriefSection } from '../types';
import { Card, Button, TextArea, Input } from '../components/UIComponents';
import { generateBriefSection } from '../services/geminiService';

interface ProductBriefProps {
  project: Project;
  onUpdate: (brief: BriefType) => void;
  onNext: () => void;
}

export const ProductBrief: React.FC<ProductBriefProps> = ({ project, onUpdate, onNext }) => {
  const [brief, setBrief] = useState<BriefType>(project.brief);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    executiveSummary: true,
    problemStatement: true,
  });

  const handleSectionChange = (id: string, value: string) => {
    const updatedBrief = {
      ...brief,
      sections: {
        ...brief.sections,
        [id]: { ...brief.sections[id], content: value }
      }
    };
    setBrief(updatedBrief);
    // Ideally use debounce here in real app
  };

  const handleGenerate = async (sectionId: string) => {
    setLoadingSection(sectionId);
    try {
      // Collect context from other sections to inform the AI
      const context = (Object.values(brief.sections) as BriefSection[])
        .filter(s => s.id !== sectionId && s.content.length > 0)
        .map(s => `${s.title}: ${s.content}`)
        .join('\n\n');

      const content = await generateBriefSection(
        brief.sections[sectionId].title,
        context,
        project.name
      );
      
      handleSectionChange(sectionId, content);
      setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
    } catch (error) {
      alert("Failed to generate content. Make sure API Key is set.");
    } finally {
      setLoadingSection(null);
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveBrief = () => {
    onUpdate(brief);
    // Trigger toast in real app
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Brief</h1>
          <p className="text-muted text-sm">Define the core vision of {project.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveBrief} icon={<Save size={16} />}>
            Save Draft
          </Button>
          <Button onClick={() => { saveBrief(); onNext(); }}>
            Continue to Features
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {(Object.values(brief.sections) as BriefSection[]).map((section) => (
          <Card key={section.id} className="transition-all duration-300">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-border/50 bg-surface/50"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                 <div className={`p-1 rounded ${section.content ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                 </div>
                 <h3 className="font-semibold text-text">{section.title}</h3>
              </div>
              {expandedSections[section.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expandedSections[section.id] && (
              <div className="p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-muted">{section.description}</p>
                <div className="relative">
                  <TextArea
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    placeholder={section.placeholder}
                    className="min-h-[150px] font-mono text-sm leading-relaxed pr-12"
                  />
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleGenerate(section.id)}
                      isLoading={loadingSection === section.id}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/20"
                      title="Generate with AI"
                    >
                      <Sparkles size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};