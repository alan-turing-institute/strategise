import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Code as CodeIcon, 
  Share2, 
  Network, 
  Cpu, 
  Terminal, 
  ChevronDown, 
  Maximize2,
  RefreshCw,
  Zap,
  BookOpen
} from 'lucide-react';

// --- Mock Data & Constants ---

// --- Components ---

const Header = () => (
  <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-700">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
        <Network size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">GameInterpreter</h1>
        <p className="text-xs text-slate-400 font-medium tracking-wide">AI-POWERED GAME THEORY MODELING</p>
      </div>
    </div>
    <div className="flex gap-4">
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
        <BookOpen size={16} /> Documentation
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-600 transition-all text-sm font-medium">
        <Share2 size={16} /> Share Project
      </button>
    </div>
  </header>
);

const CodeWindow = ({ code, isGenerating }) => (
  <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-2">
        <CodeIcon size={16} className="text-blue-400" />
        <span className="font-semibold text-slate-200 text-sm">Generated Python Code (PyGambit)</span>
      </div>
      <div className="flex gap-2">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
           <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
         </div>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-4 font-mono text-sm relative group">
      {isGenerating ? (
         <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
            <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={16} /> Generating PyGambit model...</span>
         </div>
      ) : code ? (
        <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          <code dangerouslySetInnerHTML={{ 
            __html: code.replace(/import/g, '<span class="text-purple-400">import</span>')
                        .replace(/game =/g, '<span class="text-blue-400">game =</span>')
                        .replace(/g =/g, '<span class="text-blue-400">g =</span>')
                        .replace(/#.*/g, match => `<span class="text-slate-500 italic">${match}</span>`)
                        .replace(/"(.*?)"/g, '<span class="text-green-400">"$1"</span>')
            }} />
        </pre>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-600">
           <Zap size={32} className="mb-2 opacity-50"/>
           <p>Enter a description and generate code to view it here.</p>
        </div>
      )}
    </div>
  </div>
);

// A simple tree visualizer mockup using SVG
const GameTreeVisualizer = ({ svgContent, show, isLoading }) => {
  if (!show) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
       <p className="text-sm">Click "Visualize Game Tree" to render</p>
    </div>
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
       <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={16} /> Rendering Tree...</span>
    </div>
  );

  if (svgContent) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center p-4 overflow-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  return null;
};


export default function App() {
  const [prompt, setPrompt] = useState("");
  const [activeGameId, setActiveGameId] = useState(null);
  const [presets, setPresets] = useState([]);
  
  // Pipeline States
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const [showVisual, setShowVisual] = useState(false);
  const [visualSvg, setVisualSvg] = useState(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  
  const [isComputingNash, setIsComputingNash] = useState(false);
  const [nashAlgorithm, setNashAlgorithm] = useState("gnm"); // gnm, lcp, simpdiv
  const [nashResults, setNashResults] = useState(null);

  // Load presets from server
  const fetchGames = () => {
    fetch('http://127.0.0.1:5000/games')
      .then(res => res.json())
      .then(data => setPresets(data))
      .catch(err => console.error("Failed to load games:", err));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Handle Preset Selection
  const loadPreset = (gameId) => {
    const game = presets.find(g => g.id === gameId);
    if (game) {
      setPrompt(game.description);
      setActiveGameId(gameId);
      // Reset pipeline
      setGeneratedCode("");
      setShowVisual(false);
      setVisualSvg(null);
      setNashResults(null);
    }
  };

  // Mock API Call: Generate Code
  const handleGenerateCode = () => {
    if (!prompt) return;
    setIsCodeGenerating(true);
    setGeneratedCode("");
    setShowVisual(false);
    setNashResults(null);
    
    // Simulate LLM delay, but use the real code from the file if available
    setTimeout(() => {
      const game = presets.find(g => g.id === activeGameId);
      // Fallback if custom text used, just show standard template
      const code = game ? game.mockCode : `# Generated Code based on prompt\nimport pygambit as g\ngame = g.Game.new_table([2,2])\n# Logic inferred from prompt...\ngame.title = "Custom Game"`;
      
      setGeneratedCode(code);
      setIsCodeGenerating(false);
    }, 1000);
  };

  // Toggle Visualization
  const handleVisualize = () => {
    setShowVisual(true);
    if (generatedCode) {
      setIsVisualLoading(true);
      fetch('http://127.0.0.1:5000/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.svg) {
          setVisualSvg(data.svg);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsVisualLoading(false));
    }
  };

  // Mock API Call: Compute Nash
  const handleComputeNash = () => {
    setIsComputingNash(true);
    setNashResults(null);
    
    setTimeout(() => {
      const game = presets.find(g => g.id === activeGameId);
      const result = game ? game.nashOutput : `NE 1: Mixed Strategy found via ${nashAlgorithm}`;
      setNashResults(result);
      setIsComputingNash(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <Header />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* SECTION 1: Natural Language Input */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Describe your game
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Two firms are competing for market share. If both set high prices..."
                  className="w-full h-32 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-shadow text-slate-700 placeholder:text-slate-400"
                />
                {/* Preset Dropdown Overlay - simplistic approach for mockup */}
                <div className="absolute bottom-3 right-3 flex gap-2 items-center">
                   {presets.length === 0 && (
                     <button 
                       onClick={fetchGames}
                       className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-500 rounded-md transition-colors"
                       title="Refresh Examples"
                     >
                       <RefreshCw size={14} />
                     </button>
                   )}
                   <select 
                      onChange={(e) => loadPreset(e.target.value)}
                      className="bg-slate-100 border border-slate-300 text-slate-600 text-xs rounded-md px-2 py-1 hover:bg-slate-200 cursor-pointer outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Load Example...</option>
                      {presets.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col justify-end gap-3">
              <button 
                onClick={handleGenerateCode}
                disabled={!prompt || isCodeGenerating}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 ${
                  !prompt ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5'
                }`}
              >
                {isCodeGenerating ? (
                   <RefreshCw className="animate-spin" size={20} />
                ) : (
                   <Zap size={20} className="fill-blue-400 text-white" /> 
                )}
                Generate Code
              </button>
              <p className="text-xs text-slate-500 text-center leading-relaxed px-2">
                Uses GameInterpreter LLM pipeline to construct a structured <code className="bg-slate-100 px-1 rounded text-slate-700">pygambit.Game</code> object.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Grid Layout for Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          
          {/* LEFT COL: Code Editor */}
          <div className="lg:col-span-5 h-full flex flex-col gap-4">
             <CodeWindow code={generatedCode} isGenerating={isCodeGenerating} />
          </div>

          {/* RIGHT COL: Visuals & Computation */}
          <div className="lg:col-span-7 h-full flex flex-col gap-6">
            
            {/* TOP: Visualizer */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
               <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-indigo-500" />
                    <span className="font-semibold text-slate-700 text-sm">Game Tree Visualization</span>
                  </div>
                  <button 
                    onClick={handleVisualize}
                    disabled={!generatedCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors disabled:opacity-50"
                  >
                    <Maximize2 size={12} />
                    Draw via draw_tree
                  </button>
               </div>
               <div className="flex-1 relative bg-slate-50/30">
                 <GameTreeVisualizer svgContent={visualSvg} show={showVisual} isLoading={isVisualLoading} />
               </div>
            </div>

            {/* BOTTOM: Nash Solver */}
            <div className="h-64 bg-slate-900 rounded-xl shadow-sm border border-slate-700 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-400" />
                  <span className="font-semibold text-slate-200 text-sm">Nash Equilibria Solver</span>
                </div>
                <div className="h-4 w-px bg-slate-600"></div>
                
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-slate-400">Algorithm:</label>
                  <div className="relative group">
                    <select 
                      value={nashAlgorithm}
                      onChange={(e) => setNashAlgorithm(e.target.value)}
                      className="appearance-none bg-slate-900 text-slate-200 text-xs py-1 px-3 pr-8 rounded border border-slate-600 hover:border-slate-500 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="gnm">Global Newton Method (gnm)</option>
                      <option value="simpdiv">Simplicial Subdivision (simpdiv)</option>
                      <option value="lcp">Linear Complementarity (lcp)</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <button 
                  onClick={handleComputeNash}
                  disabled={!generatedCode || isComputingNash}
                  className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isComputingNash ? 'Running...' : 'Run Solver'}
                  <Play size={10} className="fill-current" />
                </button>
              </div>

              {/* Console Output */}
              <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
                {!generatedCode ? (
                  <div className="text-slate-600 italic">Waiting for game model generation...</div>
                ) : !nashResults && !isComputingNash ? (
                  <div className="text-slate-500">Ready to compute. Select an algorithm and run.</div>
                ) : isComputingNash ? (
                   <div className="flex flex-col gap-2">
                     <div className="text-emerald-500/70">&gt; Initializing solver engine...</div>
                     <div className="text-emerald-500/70">&gt; Loading pygambit.{nashAlgorithm}...</div>
                     <div className="text-white animate-pulse">&gt; Computing...</div>
                   </div>
                ) : (
                  <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="text-slate-400 text-xs border-b border-slate-800 pb-2 mb-2">
                      Output for {activeGameId || 'Custom Game'} using <span className="text-emerald-400">{nashAlgorithm}</span>:
                    </div>
                    {nashResults.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-emerald-500">➜</span>
                        <span className="text-slate-200">{line}</span>
                      </div>
                    ))}
                    <div className="text-slate-500 text-xs mt-2">&gt; Process finished with exit code 0</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
