import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  Maximize2,
  RefreshCw,
  X,
  Settings,
  AlertCircle
} from 'lucide-react';

// --- Mock Data & Constants ---

// --- Components ---

const Header = () => (
  <header className="flex items-center justify-center px-6 py-4 bg-white text-slate-900 border-b border-slate-200">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
        <Network size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">Strategise</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide">SUBMIT STRATEGIES FOR GAMES</p>
      </div>
    </div>
  </header>
);



// A simple tree visualizer mockup using SVG
const GameTreeVisualizer = ({ svgContent, isLoading, error }) => {
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse">
      <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={16} /> Rendering Tree...</span>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800 font-semibold mb-2">Error rendering visualization</p>
          <p className="text-red-700 text-sm whitespace-pre-wrap break-words">{error}</p>
        </div>
      </div>
    );
  }

  if (svgContent) {
    return (
      <div
        className="w-full h-full p-4 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
      <p className="text-sm">Select a game to render the tree</p>
    </div>
  );
};


export default function App() {
  const [prompt, setPrompt] = useState("");
  const [activeGameId, setActiveGameId] = useState(null);
  const [presets, setPresets] = useState([]);
  const [connectionError, setConnectionError] = useState(null);

  // Visualization state
  const [generatedCode, setGeneratedCode] = useState("");
  const [visualSvg, setVisualSvg] = useState(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [showFullscreenSvg, setShowFullscreenSvg] = useState(false);

  // Visualization Settings
  const [vizSettings, setVizSettings] = useState({
    shared_terminal_depth: false,
    scale_factor: 1.0,
    level_scaling: 1.0,
    sublevel_scaling: 1.0,
    width_scaling: 1.0,
    edge_thickness: 1.0,
    action_label_position: 0.5,
    color_scheme: "gambit"
  });
  const [showVizSettings, setShowVizSettings] = useState(false);
  const [vizSettingsPos, setVizSettingsPos] = useState({ x: 0, y: 0 });
  const [isDraggingSettings, setIsDraggingSettings] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleSettingsDragStart = (e) => {
    setIsDraggingSettings(true);
    setDragOffset({
      x: e.clientX - vizSettingsPos.x,
      y: e.clientY - vizSettingsPos.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingSettings) return;
      setVizSettingsPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDraggingSettings(false);
    };

    if (isDraggingSettings) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSettings, dragOffset]);

  useEffect(() => {
    if (showVizSettings) {
      const leftX = 24; // Position on the left side of the screen
      const centerY = (window.innerHeight - 400) / 2;
      setVizSettingsPos({ x: leftX, y: centerY });
    }
  }, [showVizSettings]);

  const [visualError, setVisualError] = useState(null);

  // Load presets from server
  const fetchGames = () => {
    setConnectionError(null);
    fetch('http://127.0.0.1:5000/games')
      .then(res => {
        if (!res.ok) throw new Error("Server returned " + res.status);
        return res.json();
      })
      .then(data => setPresets(data))
      .catch(err => {
        console.error("Failed to load games:", err);
        setConnectionError("Cannot connect to backend server. Make sure 'server.py' is running.");
      });
  };

  useEffect(() => {
    fetchGames();
  }, []);



  // Handle Preset Selection — load V1 code and auto-draw
  const loadPreset = (gameId) => {
    const game = presets.find(g => g.id === gameId);
    if (game) {
      setPrompt(game.description);
      setActiveGameId(gameId);
      setVisualSvg(null);
      setVisualError(null);

      // Load V1 code (first variant or mockCode)
      const variants = game.codeVariants || (game.mockCode ? [game.mockCode] : []);
      const code = variants.length > 0 ? variants[0] : "";
      setGeneratedCode(code);

      // Auto-draw the game tree
      if (code) {
        setIsVisualLoading(true);
        fetch('http://127.0.0.1:5000/visualize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, ...vizSettings })
        })
          .then(res => {
            if (!res.ok) {
              return res.json().then(err => {
                const msg = err.details ? `${err.error}\n\n${err.details}` : err.error;
                throw new Error(msg || 'Failed to generate visualization');
              });
            }
            return res.json();
          })
          .then(data => {
            if (data.svg) {
              setVisualSvg(data.svg);
            } else if (data.error) {
              setVisualError(data.error);
            }
          })
          .catch(err => {
            console.error(err);
            setVisualError(err.message || 'Failed to generate visualization');
          })
          .finally(() => setIsVisualLoading(false));
      }
    }
  };

  // Redraw when settings change while a game is loaded
  useEffect(() => {
    if (generatedCode) {
      setIsVisualLoading(true);
      setVisualError(null);
      fetch('http://127.0.0.1:5000/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode, ...vizSettings })
      })
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => {
              const msg = err.details ? `${err.error}\n\n${err.details}` : err.error;
              throw new Error(msg || 'Failed to generate visualization');
            });
          }
          return res.json();
        })
        .then(data => {
          if (data.svg) {
            setVisualSvg(data.svg);
          } else if (data.error) {
            setVisualError(data.error);
          }
        })
        .catch(err => {
          console.error(err);
          setVisualError(err.message || 'Failed to generate visualization');
        })
        .finally(() => setIsVisualLoading(false));
    }
  }, [vizSettings]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <Header />

      {connectionError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-center gap-2 text-red-700 text-sm animate-in slide-in-from-top-2">
          <AlertCircle size={16} />
          <span className="font-medium">{connectionError}</span>
          <button
            onClick={fetchGames}
            className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-xs font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* TWO-PANEL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1" style={{ minHeight: '70vh' }}>

          {/* LEFT PANEL: Game Description */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-semibold text-slate-700">
                Choose your game
              </label>
              <div className="flex gap-2 items-center">
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
                  <option value="" disabled>📚 Load Example Game...</option>
                  {presets.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Select an example game from the dropdown above..."
              className="flex-1 w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-shadow text-slate-700 placeholder:text-slate-400"
            />
          </section>

          {/* RIGHT PANEL: Game Tree Visualizer */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="flex gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 items-center">
              <span className="flex-1 font-semibold text-slate-700 text-sm">Game Tree</span>
              <button
                onClick={() => setShowVizSettings(!showVizSettings)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
                title="Toggle visualization settings"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => setShowFullscreenSvg(true)}
                disabled={!visualSvg}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors disabled:opacity-50"
                title="Expand fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex-1 relative bg-slate-50/30">
              <GameTreeVisualizer svgContent={visualSvg} isLoading={isVisualLoading} error={visualError} />
            </div>
          </div>

        </div>
      </main>

      {/* Visualization Settings Modal */}
      {showVizSettings && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 w-80 max-h-[70vh] overflow-y-auto z-50"
          style={{
            left: `${vizSettingsPos.x}px`,
            top: `${vizSettingsPos.y}px`,
            cursor: isDraggingSettings ? 'grabbing' : 'default'
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 sticky top-0 cursor-grab hover:bg-slate-100 transition-colors"
            onMouseDown={handleSettingsDragStart}
          >
            <span className="font-semibold text-slate-700 text-sm">Settings</span>
            <button
              onClick={() => setShowVizSettings(false)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <X size={16} className="text-slate-600" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Scale Factor</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={vizSettings.scale_factor}
                onChange={(e) => setVizSettings({ ...vizSettings, scale_factor: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.scale_factor.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Level Spacing</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={vizSettings.level_scaling}
                onChange={(e) => setVizSettings({ ...vizSettings, level_scaling: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.level_scaling.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Sublevel Spacing</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={vizSettings.sublevel_scaling}
                onChange={(e) => setVizSettings({ ...vizSettings, sublevel_scaling: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.sublevel_scaling.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Width Scaling</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={vizSettings.width_scaling}
                onChange={(e) => setVizSettings({ ...vizSettings, width_scaling: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.width_scaling.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Edge Thickness</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={vizSettings.edge_thickness}
                onChange={(e) => setVizSettings({ ...vizSettings, edge_thickness: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.edge_thickness.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Action Label Position</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={vizSettings.action_label_position}
                onChange={(e) => setVizSettings({ ...vizSettings, action_label_position: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-300 rounded-lg"
              />
              <span className="text-slate-500">{vizSettings.action_label_position.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Terminal Depth</label>
              <button
                onClick={() => setVizSettings({ ...vizSettings, shared_terminal_depth: !vizSettings.shared_terminal_depth })}
                className={`w-full px-2 py-1 rounded text-xs font-medium transition-colors ${vizSettings.shared_terminal_depth ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {vizSettings.shared_terminal_depth ? 'Aligned' : 'Default'}
              </button>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Color Scheme</label>
              <select
                value={vizSettings.color_scheme}
                onChange={(e) => setVizSettings({ ...vizSettings, color_scheme: e.target.value })}
                className="w-full px-2 py-1 rounded text-xs border border-slate-300 bg-white text-slate-700"
              >
                <option value="gambit">Gambit</option>
                <option value="default">Default</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen SVG Modal */}
      {showFullscreenSvg && visualSvg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[95vw] h-[95vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-indigo-500" />
                <span className="font-semibold text-slate-700">Game Tree Visualization (Fullscreen)</span>
              </div>
              <button
                onClick={() => setShowFullscreenSvg(false)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50/30">
              <div
                className="min-w-full min-h-full [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: visualSvg }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
