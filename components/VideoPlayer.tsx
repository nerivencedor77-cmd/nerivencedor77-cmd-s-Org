
import React, { useEffect, useRef } from 'react';
import { Source } from '../types';

interface VideoPlayerProps {
  source: Source | null;
  className?: string;
  muted?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source, className = "", muted = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && source?.stream) {
      videoRef.current.srcObject = source.stream;
    }
  }, [source]);

  if (!source) {
    return (
      <div className={`bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800 ${className}`}>
        No Signal
      </div>
    );
  }

  if (source.type === 'image') {
    return (
      <div className={`bg-black overflow-hidden relative border border-slate-800 ${className}`}>
        <img src={source.imageUrl} className="w-full h-full object-contain" alt={source.name} />
      </div>
    );
  }

  if (source.type === 'color') {
    return (
      <div className={`border border-slate-800 ${className}`} style={{ backgroundColor: source.color || '#000' }} />
    );
  }

  if (source.type === 'ai') {
     return (
      <div className={`bg-slate-900 flex flex-col items-center justify-center text-blue-400 border border-slate-800 ${className}`}>
        <div className="animate-pulse bg-blue-500/20 p-4 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <span className="text-xs font-mono uppercase tracking-widest">AI Agent: Online</span>
      </div>
    );
  }

  return (
    <div className={`bg-black overflow-hidden relative border border-slate-800 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoPlayer;
