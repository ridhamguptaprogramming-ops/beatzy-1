
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, Plus, Trash2, Save, Play, Pause, Clock, Check, 
  Music2, Sparkles, Loader2, AlertCircle, Wand2 
} from 'lucide-react';
import { Song, LyricLine } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface LyricsEditorViewProps {
  song: Song;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBack: () => void;
  onSave: (updatedSong: Song) => void;
}

const LyricsEditorView: React.FC<LyricsEditorViewProps> = ({ 
  song, 
  currentTime, 
  isPlaying, 
  onTogglePlay, 
  onBack, 
  onSave 
}) => {
  const [lines, setLines] = useState<LyricLine[]>(song.lyrics || []);
  const [showToast, setShowToast] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [timeInputValue, setTimeInputValue] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Gemini AI Generation
  const handleAiGenerate = async () => {
    try {
      setIsAiGenerating(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = `Generate synchronized lyrics for the song "${song.title}" by "${song.artist}". 
      If you can't find exact timestamps, estimate them based on typical song structure.
      Return the response as a JSON array of objects, where each object has a "time" (number in seconds) and "text" (string) property. 
      Do not include any other text or Markdown formatting in your response.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.NUMBER, description: "Time in seconds" },
                text: { type: Type.STRING, description: "Lyric text for this timestamp" }
              },
              required: ["time", "text"]
            }
          }
        }
      });

      const generatedLyrics = JSON.parse(response.text || '[]');
      if (Array.isArray(generatedLyrics) && generatedLyrics.length > 0) {
        setLines(generatedLyrics.sort((a, b) => a.time - b.time));
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lines, currentTime]);

  useEffect(() => {
    if (activeIndex !== -1 && lineRefs.current[activeIndex] && editingTimeIndex === null) {
      const activeElement = lineRefs.current[activeIndex];
      const container = containerRef.current;
      
      if (activeElement && container) {
        const containerHeight = container.clientHeight;
        const elementOffset = activeElement.offsetTop;
        const elementHeight = activeElement.clientHeight;

        container.scrollTo({
          top: elementOffset - (containerHeight / 2) + (elementHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, editingTimeIndex]);

  const handleAddLine = () => {
    const newLine: LyricLine = { time: Math.floor(currentTime), text: '' };
    const newLines = [...lines, newLine].sort((a, b) => a.time - b.time);
    setLines(newLines);
  };

  const handleRemoveLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, updates: Partial<LyricLine>) => {
    setLines(prev => {
      const newLines = [...prev];
      newLines[index] = { ...newLines[index], ...updates };
      return newLines;
    });
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimeEdit = (index: number, initialTime: number) => {
    setEditingTimeIndex(index);
    setTimeInputValue(formatTime(initialTime));
  };

  const handleFinishTimeEdit = (index: number) => {
    const parts = timeInputValue.split(':');
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else {
      seconds = parseInt(timeInputValue, 10);
    }
    
    if (!isNaN(seconds)) {
      handleUpdateLine(index, { time: seconds });
    }
    setEditingTimeIndex(null);
  };

  const handleSave = () => {
    const sortedLines = [...lines].sort((a, b) => a.time - b.time);
    onSave({ ...song, lyrics: sortedLines });
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onBack();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-right duration-500 text-white overflow-hidden">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-[#B6FF1A] text-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl border border-black/10">
            <Check size={18} strokeWidth={3} />
            <span className="font-black text-[12px] uppercase tracking-wider">Lyrics Synced</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition active:scale-90 border border-white/5">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex-1 mx-4">
          <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Vibe Lyrics Studio</h2>
          <p className="font-black text-[14px] truncate text-white tracking-tight uppercase">{song.title}</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleAiGenerate} 
                disabled={isAiGenerating}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-90 border border-white/5 ${isAiGenerating ? 'bg-zinc-800 text-[#B6FF1A]' : 'bg-zinc-900 text-white hover:bg-[#B6FF1A] hover:text-black'}`}
            >
                {isAiGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
            <button onClick={handleSave} className="w-10 h-10 bg-[#B6FF1A] text-black rounded-full flex items-center justify-center hover:opacity-90 transition active:scale-90 shadow-[0_0_20px_rgba(182,255,26,0.2)]">
                <Save size={20} />
            </button>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide pb-40"
      >
        {isAiGenerating && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                <div className="relative">
                    <Loader2 size={48} className="text-[#B6FF1A] animate-spin" />
                    <Wand2 size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                </div>
                <p className="mt-6 font-black uppercase tracking-[0.2em] text-[#B6FF1A] text-xs">AI is writing your lyrics...</p>
                <p className="mt-2 text-zinc-600 text-[10px] font-bold uppercase">Estimating timestamps from song data</p>
            </div>
        )}

        {!isAiGenerating && lines.length > 0 ? lines.map((line, idx) => {
          const isActive = activeIndex === idx;
          const isEditingThisTime = editingTimeIndex === idx;

          return (
            <div 
              key={`${idx}-${line.time}`} 
              ref={(el) => { lineRefs.current[idx] = el; }}
              className={`flex flex-col gap-3 group p-5 rounded-3xl border transition-all duration-500 ${
                isActive 
                  ? 'bg-[#B6FF1A]/10 border-[#B6FF1A] shadow-[0_0_30px_rgba(182,255,26,0.15)] scale-[1.02]' 
                  : 'bg-zinc-900/40 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className={`flex items-center gap-2 transition-colors cursor-pointer group/time ${isActive ? 'text-[#B6FF1A]' : 'text-zinc-500 hover:text-white'}`}
                  onClick={() => handleStartTimeEdit(idx, line.time)}
                >
                  <Clock size={14} strokeWidth={3} />
                  {isEditingThisTime ? (
                    <input 
                      autoFocus
                      type="text"
                      value={timeInputValue}
                      onChange={(e) => setTimeInputValue(e.target.value)}
                      onBlur={() => handleFinishTimeEdit(idx)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFinishTimeEdit(idx)}
                      className="bg-zinc-800 text-[#B6FF1A] text-[13px] font-black w-14 px-1 rounded border border-[#B6FF1A]/30 outline-none tabular-nums"
                    />
                  ) : (
                    <span className="font-black text-[13px] tracking-widest tabular-nums border-b border-transparent group-hover/time:border-current">
                      {formatTime(line.time)}
                    </span>
                  )}
                  {isActive && !isEditingThisTime && (
                    <span className="ml-2 text-[8px] font-black uppercase tracking-widest bg-[#B6FF1A] text-black px-1.5 py-0.5 rounded animate-pulse">
                      Live
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateLine(idx, { time: Math.floor(currentTime) })}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                      isActive 
                        ? 'bg-[#B6FF1A] text-black border-[#B6FF1A] shadow-lg' 
                        : 'bg-zinc-800 text-zinc-400 border-white/5 hover:text-[#B6FF1A]'
                    }`}
                  >
                    Sync Current
                  </button>
                  <button 
                    onClick={() => handleRemoveLine(idx)} 
                    className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <textarea
                value={line.text}
                onChange={(e) => handleUpdateLine(idx, { text: e.target.value })}
                placeholder="Enter lyric line..."
                className={`w-full bg-transparent border-none outline-none text-lg font-bold placeholder:text-zinc-700 resize-none h-16 leading-tight focus:ring-0 transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400'
                }`}
              />
            </div>
          );
        }) : !isAiGenerating && (
          <div className="h-64 flex flex-col items-center justify-center text-zinc-700">
            <Music2 size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-[10px] mb-4">No lines added yet</p>
            <button 
                onClick={handleAiGenerate}
                className="flex items-center gap-2 text-[#B6FF1A] font-black uppercase text-[10px] tracking-widest hover:opacity-80"
            >
                <Sparkles size={14} />
                Try AI Generation
            </button>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-8 left-6 right-6 z-20 flex items-center gap-4">
        <button 
          onClick={onTogglePlay}
          className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
        >
          {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
        </button>
        <button 
          onClick={handleAddLine}
          className="flex-1 h-16 bg-[#B6FF1A] text-black rounded-full flex items-center justify-center gap-3 font-black uppercase text-[13px] tracking-widest shadow-[0_20px_50px_rgba(182,255,26,0.3)] active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={3} />
          Add Manual Line
        </button>
      </div>
    </div>
  );
};

export default LyricsEditorView;
