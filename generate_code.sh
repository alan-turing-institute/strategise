#!/bin/bash

# Project Name
PROJECT_NAME="game-interpreter-app"

echo "🚀 Initializing $PROJECT_NAME..."

# Create Project Directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# 1. Create package.json
echo "📦 Creating package.json..."
cat << 'EOF' > package.json
{
  "name": "game-interpreter-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}
EOF

# 2. Create vite.config.js
echo "⚙️  Creating vite.config.js..."
cat << 'EOF' > vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
EOF

# 3. Create Tailwind Config
echo "🎨 Creating Tailwind configuration..."
cat << 'EOF' > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat << 'EOF' > postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 4. Create Entry HTML
echo "📄 Creating index.html..."
cat << 'EOF' > index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GameInterpreter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# 5. Create Source Directory and Files
mkdir -p src

echo "💅 Creating styles..."
cat << 'EOF' > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

echo "⚛️  Creating src/main.jsx..."
cat << 'EOF' > src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

echo "📝 Writing application code to src/App.jsx..."
cat << 'EOF' > src/App.jsx
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

const PRESET_GAMES = [
  {
    id: 'pd',
    name: "Prisoner's Dilemma",
    description: "Two members of a criminal gang are arrested and imprisoned. Each prisoner is in solitary confinement with no means of communicating with the other. The prosecutors lack sufficient evidence to convict the pair on the principal charge, but they have enough to convict both on a lesser charge. Simultaneously, the prosecutors offer each prisoner a bargain.",
    mockCode: `import pygambit as g
import numpy as np

# Create a new game table for 2 players with 2 strategies each
game = g.Game.new_table([2, 2])
game.title = "Prisoner's Dilemma"

# Label players
game.players[0].label = "Alice"
game.players[1].label = "Bob"

# Label strategies
game.players[0].strategies[0].label = "Cooperate"
game.players[0].strategies[1].label = "Defect"
game.players[1].strategies[0].label = "Cooperate"
game.players[1].strategies[1].label = "Defect"

# Set payoffs (Player 1, Player 2)
# R=Reward, P=Punishment, S=Sucker, T=Temptation
# R=3, P=1, S=0, T=5
game[0, 0][0] = 3  # R
game[0, 0][1] = 3  # R
game[0, 1][0] = 0  # S
game[0, 1][1] = 5  # T
game[1, 0][0] = 5  # T
game[1, 0][1] = 0  # S
game[1, 1][0] = 1  # P
game[1, 1][1] = 1  # P`,
    nashOutput: `NE 1: (Defect, Defect) | Payoff: (1.0, 1.0)`
  },
  {
    id: 'bos',
    name: "Battle of the Sexes",
    description: "A couple wants to meet this evening. One prefers the opera, the other prefers a football match. They would rather be together at a disfavored event than apart at their favored event.",
    mockCode: `import pygambit as g

game = g.Game.new_table([2, 2])
game.title = "Battle of the Sexes"

game.players[0].label = "Husband"
game.players[1].label = "Wife"

# Strategies
ops = ["Opera", "Football"]
for p in game.players:
    for i, s in enumerate(p.strategies):
        s.label = ops[i]

# Payoffs
# (Opera, Opera) -> (3, 2)
game[0, 0][0] = 3
game[0, 0][1] = 2

# (Opera, Football) -> (0, 0)
game[0, 1][0] = 0
game[0, 1][1] = 0

# (Football, Opera) -> (0, 0)
game[1, 0][0] = 0
game[1, 0][1] = 0

# (Football, Football) -> (2, 3)
game[1, 1][0] = 2
game[1, 1][1] = 3`,
    nashOutput: `NE 1: (Opera, Opera) | Payoff: (3.0, 2.0)\nNE 2: (Football, Football) | Payoff: (2.0, 3.0)\nNE 3: Mixed Strategy (0.6, 0.4) | Payoff: (1.2, 1.2)`
  },
  {
    id: 'hawk_dove',
    name: "Hawk-Dove Game",
    description: "Two animals contest a resource. They can behave like a Hawk (aggressive) or a Dove (peaceful). If both are Doves, they share. If both are Hawks, they fight and get injured. If one is Hawk and one Dove, the Hawk takes all.",
    mockCode: `import pygambit as g

# V = Value of resource (2)
# C = Cost of injury (10)
game = g.Game.new_table([2, 2])
game.title = "Hawk-Dove"

game.players[0].label = "Animal A"
game.players[1].label = "Animal B"

strats = ["Hawk", "Dove"]
for p in game.players:
    for i, s in enumerate(p.strategies):
        s.label = strats[i]

# Payoffs calculated based on V=2, C=10
# H, H -> (V-C)/2, (V-C)/2 -> -4, -4
game[0, 0][0] = -4
game[0, 0][1] = -4

# H, D -> V, 0 -> 2, 0
game[0, 1][0] = 2
game[0, 1][1] = 0

# D, H -> 0, V -> 0, 2
game[1, 0][0] = 0
game[1, 0][1] = 2

# D, D -> V/2, V/2 -> 1, 1
game[1, 1][0] = 1
game[1, 1][1] = 1`,
    nashOutput: `NE 1: (Hawk, Dove) | Payoff: (2.0, 0.0)\nNE 2: (Dove, Hawk) | Payoff: (0.0, 2.0)\nNE 3: Mixed Strategy (0.5, 0.5)`
  }
];

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
const GameTreeVisualizer = ({ gameId, show }) => {
  if (!show) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
       <p className="text-sm">Click "Visualize Game Tree" to render</p>
    </div>
  );

  // Simple hardcoded SVG structures for the demo
  const renderTree = () => {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
           <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
             <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
           </marker>
        </defs>
        
        {/* Root */}
        <circle cx="200" cy="40" r="15" fill="#3b82f6" className="stroke-blue-600 stroke-2" />
        <text x="200" y="20" textAnchor="middle" className="text-xs fill-slate-500 font-mono">P1</text>
        
        {/* Branches L1 */}
        <line x1="200" y1="55" x2="100" y2="120" stroke="#94a3b8" strokeWidth="2" />
        <line x1="200" y1="55" x2="300" y2="120" stroke="#94a3b8" strokeWidth="2" />
        
        <text x="130" y="80" textAnchor="end" className="text-xs fill-slate-500 font-sans bg-white">Choice A</text>
        <text x="270" y="80" textAnchor="start" className="text-xs fill-slate-500 font-sans">Choice B</text>

        {/* Nodes L2 */}
        <circle cx="100" cy="120" r="12" fill="#ef4444" className="stroke-red-600 stroke-2" />
        <circle cx="300" cy="120" r="12" fill="#ef4444" className="stroke-red-600 stroke-2" />
        <text x="80" y="125" textAnchor="end" className="text-xs fill-slate-500 font-mono">P2</text>
        <text x="320" y="125" textAnchor="start" className="text-xs fill-slate-500 font-mono">P2</text>

        {/* Branches L2 */}
        {/* Left Subtree */}
        <line x1="100" y1="132" x2="50" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
        <line x1="100" y1="132" x2="150" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
        
        {/* Right Subtree */}
        <line x1="300" y1="132" x2="250" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
        <line x1="300" y1="132" x2="350" y2="220" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />

        {/* Payoffs */}
        <rect x="30" y="220" width="40" height="25" rx="4" fill="#f1f5f9" stroke="#e2e8f0" />
        <text x="50" y="237" textAnchor="middle" className="text-[10px] font-mono fill-slate-700">3,3</text>

        <rect x="130" y="220" width="40" height="25" rx="4" fill="#f1f5f9" stroke="#e2e8f0" />
        <text x="150" y="237" textAnchor="middle" className="text-[10px] font-mono fill-slate-700">0,5</text>

        <rect x="230" y="220" width="40" height="25" rx="4" fill="#f1f5f9" stroke="#e2e8f0" />
        <text x="250" y="237" textAnchor="middle" className="text-[10px] font-mono fill-slate-700">5,0</text>

        <rect x="330" y="220" width="40" height="25" rx="4" fill="#f1f5f9" stroke="#e2e8f0" />
        <text x="350" y="237" textAnchor="middle" className="text-[10px] font-mono fill-slate-700">1,1</text>
      </svg>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-in fade-in duration-500">
       {renderTree()}
    </div>
  );
};


export default function App() {
  const [prompt, setPrompt] = useState("");
  const [activeGameId, setActiveGameId] = useState(null);
  
  // Pipeline States
  const [isCodeGenerating, setIsCodeGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  
  const [showVisual, setShowVisual] = useState(false);
  
  const [isComputingNash, setIsComputingNash] = useState(false);
  const [nashAlgorithm, setNashAlgorithm] = useState("gnm"); // gnm, lcp, simpdiv
  const [nashResults, setNashResults] = useState(null);

  // Handle Preset Selection
  const loadPreset = (gameId) => {
    const game = PRESET_GAMES.find(g => g.id === gameId);
    if (game) {
      setPrompt(game.description);
      setActiveGameId(gameId);
      // Reset pipeline
      setGeneratedCode("");
      setShowVisual(false);
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
    
    // Simulate LLM delay
    setTimeout(() => {
      const game = PRESET_GAMES.find(g => g.id === activeGameId);
      // Fallback if custom text used, just show standard template
      const code = game ? game.mockCode : `# Generated Code based on prompt\nimport pygambit as g\ngame = g.Game.new_table([2,2])\n# Logic inferred from prompt...\ngame.title = "Custom Game"`;
      
      setGeneratedCode(code);
      setIsCodeGenerating(false);
    }, 1500);
  };

  // Toggle Visualization
  const handleVisualize = () => {
    setShowVisual(true);
  };

  // Mock API Call: Compute Nash
  const handleComputeNash = () => {
    setIsComputingNash(true);
    setNashResults(null);
    
    setTimeout(() => {
      const game = PRESET_GAMES.find(g => g.id === activeGameId);
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
                <div className="absolute bottom-3 right-3 flex gap-2">
                   <select 
                      onChange={(e) => loadPreset(e.target.value)}
                      className="bg-slate-100 border border-slate-300 text-slate-600 text-xs rounded-md px-2 py-1 hover:bg-slate-200 cursor-pointer outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Load Example...</option>
                      {PRESET_GAMES.map(g => (
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
                 <GameTreeVisualizer gameId={activeGameId} show={showVisual} />
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
EOF

# 6. Install dependencies
echo "⬇️  Installing dependencies..."
npm install

echo "✅ Done! To run your GameInterpreter app:"
echo "   cd $PROJECT_NAME"
echo "   npm run dev"