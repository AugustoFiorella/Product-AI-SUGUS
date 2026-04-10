import React, { useState } from 'react';
import { Sparkles, Save, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Project, ProductBrief as BriefType } from '../types';
import { Card, Button, TextArea } from '../components/UIComponents';
import { generateBrief } from '../services/geminiService';

type UIState = 'idle' | 'loading' | 'generated' | 'error';

interface ProductBriefProps {
  project: Project;
  onUpdate: (brief: BriefType) => void;
  onNext: () => void;
}

// Order and metadata for display
const SECTIONS = [
  { key: 'executiveSummary', aiKey: 'executiveSummary' },
  { key: 'problemStatement', aiKey: 'problemStatement' },
  { key: 'targetUsers',      aiKey: 'targetUsers' },
  { key: 'solution',         aiKey: 'proposedSolution' },
  { key: 'successMetrics',   aiKey: 'successMetrics' },
];

export const ProductBrief: React.FC<ProductBriefProps> = ({ project, onUpdate, onNext }) => {
  const hasExistingContent = Object.values(project.brief.sections).some(s => s.content.trim());

  const [uiState, setUiState] = useState<UIState>(hasExistingContent ? 'generated' : 'idle');
  const [idea, setIdea] = useState('');
  const [brief, setBrief] = useState<BriefType>(project.brief);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setUiState('loading');
    setErrorMsg('');
    try {
      const result = await generateBrief(idea.trim());
      const updatedSections = { ...brief.sections };
      SECTIONS.forEach(({ key, aiKey }) => {
        if (updatedSections[key] && result[aiKey as keyof typeof result]) {
          updatedSections[key] = {
            ...updatedSections[key],
            content: result[aiKey as keyof typeof result],
          };
        }
      });
      setBrief({ sections: updatedSections });
      setUiState('generated');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al conectar con Gemini.';
      setErrorMsg(msg);
      setUiState('error');
    }
  };

  const handleSectionChange = (id: string, value: string) => {
    setBrief(prev => ({
      ...prev,
      sections: { ...prev.sections, [id]: { ...prev.sections[id], content: value } },
    }));
  };

  const saveBrief = () => onUpdate(brief);

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (uiState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-white/10 mb-2">
            <Sparkles size={26} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            ¿Qué problema querés resolver?
          </h1>
          <p className="text-muted text-sm max-w-md">
            Describilo en una oración. La IA va a generar las 5 secciones del brief automáticamente.
          </p>
        </div>

        <div className="w-full space-y-3">
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            placeholder="Ej: Quiero una app para gestionar turnos de peluquería sin que los dueños tengan que contestar WhatsApp todo el día..."
            rows={5}
            className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-base text-white placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all leading-relaxed"
            autoFocus
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted">
              {idea.length > 0 ? `${idea.length} caracteres · Ctrl+Enter para generar` : 'Ctrl+Enter para generar'}
            </span>
            <Button
              onClick={handleGenerate}
              disabled={!idea.trim()}
              icon={<Sparkles size={16} />}
              size="lg"
            >
              Generar Brief
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (uiState === 'loading') {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-muted text-sm">Generando tu Product Brief con IA…</p>
        </div>
        {SECTIONS.map(({ key }) => (
          <div key={key} className="rounded-xl border border-border overflow-hidden animate-pulse">
            <div className="px-6 py-3 bg-surface/50 border-b border-border/50">
              <div className="h-4 w-36 bg-slate-700 rounded" />
            </div>
            <div className="p-5 space-y-2">
              <div className="h-3 w-full bg-slate-800 rounded" />
              <div className="h-3 w-5/6 bg-slate-800 rounded" />
              <div className="h-3 w-4/6 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (uiState === 'error') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-in fade-in duration-300">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={26} className="text-red-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-white">Algo salió mal</h2>
          <p className="text-muted text-sm max-w-sm">{errorMsg}</p>
        </div>
        <Button
          onClick={() => setUiState('idle')}
          icon={<RefreshCw size={16} />}
          variant="outline"
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  // ── Generated ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Brief</h1>
          <p className="text-muted text-sm">Ajustá el contenido generado para <span className="text-white">{project.name}</span></p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUiState('idle')}
            icon={<RefreshCw size={14} />}
          >
            Regenerar
          </Button>
          <Button variant="secondary" onClick={saveBrief} icon={<Save size={16} />}>
            Save Draft
          </Button>
          <Button onClick={() => { saveBrief(); onNext(); }} icon={<ArrowRight size={16} />}>
            Continue to Features
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map(({ key }) => {
          const section = brief.sections[key];
          if (!section) return null;
          return (
            <Card key={key}>
              <div className="px-6 py-3 border-b border-border/50 bg-surface/30 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${section.content.trim() ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <div>
                  <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                  <p className="text-xs text-muted">{section.description}</p>
                </div>
              </div>
              <div className="p-4">
                <TextArea
                  value={section.content}
                  onChange={e => handleSectionChange(key, e.target.value)}
                  placeholder={section.placeholder}
                  rows={4}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
