import React, { useState, useRef, useEffect } from 'react';
import { Project, UserJourney, JourneyNode, JourneyEdge, BriefSection } from '../types';
import { Button, Card } from '../components/UIComponents';
import { Sparkles, Plus, ZoomIn, ZoomOut, RefreshCcw, Save, MousePointer2, Move, X } from 'lucide-react';
import { generateUserJourney } from '../services/geminiService';

interface UserJourneyProps {
  project: Project;
  onUpdate: (journey: UserJourney) => void;
}

export const UserJourneyView: React.FC<UserJourneyProps> = ({ project, onUpdate }) => {
  // State
  const [nodes, setNodes] = useState<JourneyNode[]>(project.userJourney?.nodes || []);
  const [edges, setEdges] = useState<JourneyEdge[]>(project.userJourney?.edges || []);
  
  // Canvas Transform State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Interaction State
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse position on drag start
  const [mode, setMode] = useState<'move' | 'connect'>('move');
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleGenerateAI = async () => {
    setIsLoading(true);
    const context = (Object.values(project.brief.sections) as BriefSection[])
        .map(s => `${s.title}: ${s.content}`)
        .join('\n\n');
    
    const journey = await generateUserJourney(context);
    setNodes(journey.nodes);
    setEdges(journey.edges);
    // Reset view
    setScale(1);
    setPan({ x: 50, y: 50 });
    setIsLoading(false);
  };

  const handleSave = () => {
    onUpdate({ nodes, edges });
  };

  const addNode = () => {
    const id = crypto.randomUUID();
    const newNode: JourneyNode = {
      id,
      label: 'New Screen',
      type: 'default',
      x: -pan.x + 100 + (Math.random() * 50), // Spawn visible
      y: -pan.y + 100 + (Math.random() * 50),
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(edge => edge.source !== id && edge.target !== id));
  };

  // --- Canvas Interaction ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      setNodes(prev => prev.map(n => 
        n.id === isDraggingNode 
          ? { ...n, x: n.x + dx, y: n.y + dy } 
          : n
      ));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // Simple zoom logic
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const newScale = Math.min(Math.max(0.3, scale + (direction * zoomIntensity)), 2);
    setScale(newScale);
  };

  // --- Node Interaction ---

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent canvas pan
    
    if (mode === 'connect') {
      if (!connectSource) {
        setConnectSource(id);
      } else {
        if (connectSource !== id) {
          // Create edge
          setEdges([...edges, { id: crypto.randomUUID(), source: connectSource, target: id }]);
          setConnectSource(null);
          setMode('move'); // Reset to move after connection
        }
      }
    } else {
      setIsDraggingNode(id);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // --- Rendering Helpers ---

  // Calculate Bezier curves for edges
  const getPath = (sourceId: string, targetId: string) => {
    const source = nodes.find(n => n.id === sourceId);
    const target = nodes.find(n => n.id === targetId);
    if (!source || !target) return '';

    // Assume card width 200, height 80 for center calculation
    const w = 200;
    const h = 80;
    
    const sx = source.x + w; // Start from right
    const sy = source.y + h / 2;
    const tx = target.x; // End at left
    const ty = target.y + h / 2;

    // Bezier control points
    const c1x = sx + 50;
    const c1y = sy;
    const c2x = tx - 50;
    const c2y = ty;

    return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border">
        <div className="flex gap-2">
          <Button 
            onClick={addNode} 
            variant="secondary" 
            size="sm"
            icon={<Plus size={16} />}
          >
            Add Screen
          </Button>
          <div className="w-px h-8 bg-border mx-2" />
          <Button 
            onClick={() => setMode('move')} 
            variant={mode === 'move' ? 'primary' : 'ghost'}
            size="sm"
            className={mode === 'move' ? '' : 'text-muted'}
            title="Move Mode"
          >
            <Move size={18} />
          </Button>
          <Button 
            onClick={() => { setMode('connect'); setConnectSource(null); }} 
            variant={mode === 'connect' ? 'primary' : 'ghost'}
            size="sm"
            className={mode === 'connect' ? '' : 'text-muted'}
            title="Connect Mode"
          >
            <MousePointer2 size={18} />
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.3, s - 0.1))}><ZoomOut size={18}/></Button>
          <span className="text-xs text-muted w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn size={18}/></Button>
          <Button variant="ghost" size="sm" onClick={() => { setPan({x:0,y:0}); setScale(1); }} title="Reset View"><RefreshCcw size={18}/></Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateAI} 
            isLoading={isLoading}
            icon={<Sparkles size={16} />}
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            Generate Flow
          </Button>
          <Button onClick={handleSave} icon={<Save size={16} />}>
            Save Diagram
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-[#0b1221] rounded-xl border border-border overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        {/* Transform Layer */}
        <div 
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        >
          {/* Edges Layer (SVG) */}
          <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-0">
             <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
             </defs>
             {edges.map(edge => (
               <path 
                 key={edge.id}
                 d={getPath(edge.source, edge.target)}
                 stroke="#64748b"
                 strokeWidth="2"
                 fill="none"
                 markerEnd="url(#arrowhead)"
               />
             ))}
             {/* Draw temp line if connecting */}
             {mode === 'connect' && connectSource && (
                // Note: Real-time mouse line is tricky without tracking canvas-relative mouse pos in state constantly. 
                // For MVP, we skip the rubber-banding line or add it later.
                <></>
             )}
          </svg>

          {/* Nodes Layer */}
          {nodes.map(node => {
            const isEntry = node.type === 'entry';
            const isExit = node.type === 'exit';
            const isSelected = connectSource === node.id;
            
            return (
              <div
                key={node.id}
                onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                className={`
                  absolute w-[200px] rounded-lg shadow-lg border-2 p-3 z-10 cursor-pointer transition-shadow
                  flex flex-col gap-2 group
                  ${isEntry ? 'bg-blue-900/20 border-blue-500/50 hover:border-blue-400' : 
                    isExit ? 'bg-purple-900/20 border-purple-500/50 hover:border-purple-400' : 
                    'bg-surface border-border hover:border-slate-500'}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                `}
                style={{ left: node.x, top: node.y }}
              >
                {/* Header/Label */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-1 block
                    ${isEntry ? 'text-blue-400' : isExit ? 'text-purple-400' : 'text-slate-500'}
                  `}>
                    {node.type}
                  </span>
                  <button 
                    onClick={(e) => deleteNode(node.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <input 
                  value={node.label}
                  onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, label: e.target.value } : n))}
                  className="bg-transparent text-white font-medium text-sm focus:outline-none w-full"
                />
              </div>
            );
          })}
        </div>

        {/* UI Overlay Instructions */}
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur border border-border p-3 rounded-lg text-xs text-muted pointer-events-none">
          {mode === 'move' && <p>Drag nodes to move. Drag background to pan. Scroll to zoom.</p>}
          {mode === 'connect' && <p className="text-primary font-bold">Select a source node, then select a target node to connect.</p>}
        </div>
      </div>
    </div>
  );
};
