export enum ProjectStatus {
  Draft = 'Draft',
  Active = 'Active',
  Completed = 'Completed'
}

export enum FeaturePriority {
  MustHave = 'Must Have',
  ShouldHave = 'Should Have',
  CouldHave = 'Could Have',
  WontHave = "Won't Have"
}

export enum FeatureComplexity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface BriefSection {
  id: string;
  title: string;
  content: string;
  placeholder: string;
  description: string;
}

export interface ProductBrief {
  sections: Record<string, BriefSection>;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  priority: FeaturePriority;
  complexity: FeatureComplexity;
}

export interface PRD {
  featureId: string;
  content: string; // Markdown content
}

// --- Journey Types ---
export interface JourneyNode {
  id: string;
  type: 'entry' | 'default' | 'exit';
  label: string;
  x: number;
  y: number;
}

export interface JourneyEdge {
  id: string;
  source: string;
  target: string;
}

export interface UserJourney {
  nodes: JourneyNode[];
  edges: JourneyEdge[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0-100
  brief: ProductBrief;
  features: Feature[];
  prds: PRD[];
  userJourney: UserJourney;
  createdAt: string;
}

export type ViewState = 'DASHBOARD' | 'BRIEF' | 'FEATURES' | 'PRD' | 'JOURNEY' | 'TECH_DOCS';

export const INITIAL_BRIEF_SECTIONS: Record<string, BriefSection> = {
  executiveSummary: { id: 'executiveSummary', title: 'Executive Summary', content: '', placeholder: 'Overview of the product vision...', description: 'High-level overview of the product.' },
  problemStatement: { id: 'problemStatement', title: 'Problem Statement', content: '', placeholder: 'What pain point are we solving?', description: 'Clear description of the problem.' },
  targetUsers: { id: 'targetUsers', title: 'Target Users', content: '', placeholder: 'Who is this for?', description: 'Demographics and psychographics.' },
  solution: { id: 'solution', title: 'Proposed Solution', content: '', placeholder: 'How do we solve it?', description: ' The core value proposition.' },
  successMetrics: { id: 'successMetrics', title: 'Success Metrics', content: '', placeholder: 'KPIs and OKRs...', description: 'How we measure success.' },
};
