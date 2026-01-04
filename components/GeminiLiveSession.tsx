
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audioUtils';

interface GeminiLiveSessionProps {
  isActive: boolean;
  onTranscript?: (text: string, role: 'user' | 'model') => void;
}

const GeminiLiveSession: React.FC<GeminiLiveSessionProps> = ({ isActive, onTranscript }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setStatus('idle');
  };

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    const startSession = async () => {
      try {
        setStatus('connecting');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

        // Setup Audio Contexts
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          outputNodeRef.current = audioContextRef.current.createGain();
          outputNodeRef.current.connect(audioContextRef.current.destination);
        }

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
            },
            systemInstruction: `You are the AI co-host for a professional live stream called Broadcaster Pro. 
            You commentate on what's happening, interact with the audience (simulated), and help the producer (the user). 
            Keep your responses punchy and broadcast-ready. Use a bit of professional energy.`,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setStatus('active');
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (msg) => {
              // Handle Audio
              const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64 && audioContextRef.current && outputNodeRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNodeRef.current);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }

              // Handle Transcripts
              if (msg.serverContent?.outputTranscription) {
                onTranscript?.(msg.serverContent.outputTranscription.text, 'model');
              } else if (msg.serverContent?.inputTranscription) {
                onTranscript?.(msg.serverContent.inputTranscription.text, 'user');
              }

              if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => {
              console.error('Gemini Live error:', e);
              setStatus('error');
            },
            onclose: () => setStatus('idle'),
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start Gemini Live:', err);
        setStatus('error');
      }
    };

    startSession();

    return () => cleanup();
  }, [isActive]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded text-xs font-mono">
      <div className={`w-2 h-2 rounded-full ${
        status === 'active' ? 'bg-green-500 animate-pulse' :
        status === 'connecting' ? 'bg-yellow-500' :
        status === 'error' ? 'bg-red-500' : 'bg-slate-600'
      }`} />
      <span className="text-slate-300">
        AI CO-HOST: {status.toUpperCase()}
      </span>
    </div>
  );
};

export default GeminiLiveSession;
