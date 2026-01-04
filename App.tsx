
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Source, 
  SourceType, 
  LayerId 
} from './types';
import { 
  CameraIcon, 
  MonitorIcon, 
  MicIcon, 
  PlayIcon, 
  RadioIcon, 
  LayersIcon, 
  SettingsIcon,
  SparklesIcon
} from './components/Icons';
import VideoPlayer from './components/VideoPlayer';
import GeminiLiveSession from './components/GeminiLiveSession';

const INITIAL_SOURCES: Source[] = [
  { id: 'color-black', name: 'Black Screen', type: 'color', color: '#000000' },
  { id: 'ai-guest', name: 'AI Guest', type: 'ai' },
  { id: 'img-placeholder', name: 'Intro Graphic', type: 'image', imageUrl: 'https://picsum.photos/seed/broadcaster/1280/720' },
];

const App: React.FC = () => {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [previewId, setPreviewId] = useState<string | null>('color-black');
  const [liveId, setLiveId] = useState<string | null>('color-black');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerId>(LayerId.Layer2);
  const [aiActive, setAiActive] = useState(false);
  const [transcript, setTranscript] = useState<{ text: string; role: string }[]>([]);

  const previewSource = sources.find(s => s.id === previewId) || null;
  const liveSource = sources.find(s => s.id === liveId) || null;

  const addSource = async (type: SourceType) => {
    try {
      let stream: MediaStream | undefined;
      let name = "New Source";

      if (type === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        name = "Camera Stream";
      } else if (type === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        name = "Screen Capture";
      }

      const newSource: Source = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        stream
      };

      setSources(prev => [...prev, newSource]);
      setPreviewId(newSource.id);
    } catch (err) {
      console.error("Error adding source:", err);
      alert("Permission denied or error accessing hardware.");
    }
  };

  const handleGoLive = () => {
    // Basic switch transition
    setLiveId(previewId);
  };

  const handleSmoothTransition = () => {
    // In a real app, this would involve canvas mixing and crossfades
    setLiveId(previewId);
  };

  const onTranscript = useCallback((text: string, role: 'user' | 'model') => {
    setTranscript(prev => [...prev.slice(-10), { text, role }]);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Top Header / Menu Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shadow-lg z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <RadioIcon />
            </div>
            <h1 className="font-bold tracking-tight text-lg">BROADCASTER<span className="text-blue-500 italic">PRO</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-slate-400">
            <button className="hover:text-white">File</button>
            <button className="hover:text-white">Edit</button>
            <button className="hover:text-white">Switch</button>
            <button className="hover:text-white">Media</button>
            <button className="hover:text-white">Output</button>
            <button className="hover:text-white">Layout</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <GeminiLiveSession isActive={aiActive} onTranscript={onTranscript} />
          
          <button 
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-all ${
              isStreaming 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-white' : 'bg-red-500'}`} />
            {isStreaming ? 'STOP STREAM' : 'STREAM'}
          </button>

          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold transition-all ${
              isRecording 
                ? 'bg-orange-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-slate-500'}`} />
            {isRecording ? 'STOP REC' : 'RECORD'}
          </button>

          <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded">
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Main Broadcast Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Monitors (Preview & Live) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950">
          
          {/* Preview Monitor */}
          <div className="flex flex-col gap-2 group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Preview Monitor
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1920 x 1080 | 60FPS</span>
            </div>
            <div className="relative border-2 border-emerald-900/50 rounded-lg overflow-hidden monitor-ratio shadow-2xl group-hover:border-emerald-500/50 transition-colors">
              <VideoPlayer source={previewSource} className="w-full h-full" />
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 rounded text-xs font-mono border border-emerald-500/30">
                {previewSource?.name || 'Empty'}
              </div>
            </div>
          </div>

          {/* Live Monitor */}
          <div className="flex flex-col gap-2 group">
             <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Program
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ENCODING: CBR 6000Kbps</span>
            </div>
            <div className="relative border-2 border-red-900/50 rounded-lg overflow-hidden monitor-ratio shadow-2xl group-hover:border-red-500/50 transition-colors">
              <VideoPlayer source={liveSource} className="w-full h-full" muted={false} />
              <div className="absolute top-4 right-4 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
                PROGRAM
              </div>
              <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/60 rounded text-xs font-mono border border-red-500/30">
                {liveSource?.name || 'Empty'}
              </div>
            </div>
          </div>

        </div>

        {/* Transition Controls Bar */}
        <div className="h-14 bg-slate-900 border-y border-slate-800 flex items-center justify-center gap-6 px-4">
          <div className="flex items-center gap-1">
            <button onClick={handleGoLive} className="h-10 px-6 bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-black text-xs uppercase tracking-tighter rounded shadow-lg transition-transform active:scale-95">
              Cut
            </button>
            <button onClick={handleSmoothTransition} className="h-10 px-6 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-black text-xs uppercase tracking-tighter rounded shadow-lg transition-transform active:scale-95">
              Smooth
            </button>
          </div>
          
          <div className="h-full w-px bg-slate-800 mx-2" />
          
          <div className="flex flex-col items-center">
            <input type="range" className="w-32 accent-blue-500 bg-slate-700 h-1.5 rounded-full appearance-none cursor-pointer" />
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Transition T-Bar</span>
          </div>

          <div className="h-full w-px bg-slate-800 mx-2" />

          <button 
            onClick={() => setAiActive(!aiActive)}
            className={`flex items-center gap-2 px-4 h-10 rounded text-xs font-bold transition-all ${
                aiActive ? 'bg-blue-600 text-white shadow-blue-500/20 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <SparklesIcon />
            {aiActive ? 'AI CO-HOST LIVE' : 'ACTIVATE AI'}
          </button>
        </div>

        {/* Bottom Panel: Layers & Sources */}
        <div className="h-64 flex bg-slate-900 border-t border-slate-800">
          
          {/* Layer Selection (Left Sidebar of Bottom Panel) */}
          <div className="w-48 border-r border-slate-800 flex flex-col bg-slate-950">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Layers</span>
              <LayersIcon />
            </div>
            <div className="flex-1 overflow-y-auto p-1 space-y-1">
              {Object.values(LayerId).map(layer => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`w-full text-left px-3 py-2 text-xs rounded transition-colors border ${
                    activeLayer === layer 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Sources Library (Main Section of Bottom Panel) */}
          <div className="flex-1 flex flex-col bg-slate-900/50">
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Bin</span>
                   <div className="flex gap-2">
                      <button onClick={() => addSource('camera')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors" title="Add Camera">
                        <CameraIcon />
                      </button>
                      <button onClick={() => addSource('screen')} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors" title="Add Screen">
                        <MonitorIcon />
                      </button>
                      <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors" title="Add Media">
                        <PlayIcon />
                      </button>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 italic">Drag sources to reorder</span>
                </div>
            </div>
            
            {/* Horizontal Scrollable Sources */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex gap-4">
              {sources.map(source => (
                <button
                  key={source.id}
                  onClick={() => setPreviewId(source.id)}
                  onDoubleClick={() => {
                    setPreviewId(source.id);
                    setLiveId(source.id);
                  }}
                  className={`relative flex-shrink-0 w-44 aspect-video rounded border-2 transition-all group overflow-hidden ${
                    previewId === source.id ? 'border-emerald-500 scale-105 z-10' : 
                    liveId === source.id ? 'border-red-500 opacity-90' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                   <VideoPlayer source={source} className="w-full h-full pointer-events-none" />
                   
                   {/* Overlay Labels */}
                   <div className="absolute inset-x-0 bottom-0 bg-black/80 px-2 py-1 flex items-center justify-between">
                      <span className="text-[10px] font-medium truncate w-full text-left">{source.name}</span>
                   </div>

                   {liveId === source.id && (
                     <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-600 rounded-sm text-[8px] font-black tracking-tighter shadow-lg">
                       LIVE
                     </div>
                   )}
                   {previewId === source.id && (
                     <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-500 rounded-sm text-[8px] font-black tracking-tighter shadow-lg">
                       PVW
                     </div>
                   )}
                </button>
              ))}
              
              <button 
                onClick={() => addSource('camera')}
                className="flex-shrink-0 w-44 aspect-video rounded border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 flex flex-col items-center justify-center gap-2 text-slate-600 transition-all"
              >
                <div className="p-2 rounded-full bg-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <span className="text-[10px] font-bold uppercase">Add New Source</span>
              </button>
            </div>
          </div>

          {/* AI Activity Log (Right Section) */}
          <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-950">
             <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Commentary</span>
                <SparklesIcon />
             </div>
             <div className="flex-1 overflow-y-auto p-3 text-[11px] font-mono space-y-3">
                {transcript.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center px-4">
                     <p>Activate AI to start the live commentary assistant.</p>
                  </div>
                ) : (
                  transcript.map((t, i) => (
                    <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                       <span className={`text-[8px] mb-1 font-bold ${t.role === 'user' ? 'text-blue-500' : 'text-purple-400'}`}>
                         {t.role.toUpperCase()}
                       </span>
                       <div className={`p-2 rounded-lg max-w-[90%] ${
                         t.role === 'user' ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-purple-600/10 border border-purple-500/30'
                       }`}>
                         {t.text}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>

      </main>

      {/* Status Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[10px] font-medium text-slate-500">
        <div className="flex items-center gap-4">
           <span className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             SYSTEM: OK
           </span>
           <span>CPU: 12%</span>
           <span>MEM: 1.4GB</span>
        </div>
        <div className="flex items-center gap-4 uppercase">
           <span>DROPPED FRAMES: 0 (0.0%)</span>
           <span className="text-slate-300">REC: 00:00:00</span>
           <span className="text-red-500 font-bold">STREAM: 00:00:00</span>
        </div>
      </footer>

    </div>
  );
};

export default App;
