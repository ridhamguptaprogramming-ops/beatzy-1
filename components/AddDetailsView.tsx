import React, { useState, useRef } from 'react';
import { ChevronLeft, Pencil, Music, Globe, Music2, ChevronRight, Check, Loader2, UploadCloud, User } from 'lucide-react';
import { Song } from '../types';

interface AddDetailsViewProps {
  onBack: () => void;
  onAddSong: (song: Song) => void;
}

type PickerType = 'none' | 'visibility' | 'genre';

const AddDetailsView: React.FC<AddDetailsViewProps> = ({ onBack, onAddSong }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageBlob, setSelectedImageBlob] = useState<Blob | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState('Public');
  const [genre, setGenre] = useState('Hip - Hop & Rap');
  const [activePicker, setActivePicker] = useState<PickerType>('none');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const genres = ['Hip - Hop & Rap', 'Pop', 'Electronic', 'Rock', 'Jazz', 'R&B', 'Classical', 'Lo-fi', 'Party', 'Blues'];
  const visibilities = ['Public', 'Private', 'Unlisted'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")); 
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageBlob(file);
      // Clean up previous preview URL to prevent memory leaks
      if (selectedImagePreview && selectedImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreview);
      }
      setSelectedImagePreview(URL.createObjectURL(file));
    }
  };

  const startUpload = async () => {
    if (!selectedFile || !title) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);

    const audioUrl = URL.createObjectURL(selectedFile);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const newSong: Song = {
            id: Date.now().toString(),
            title: title || 'Untitled Track',
            artist: artist || 'Unknown Artist',
            album: 'My Uploads',
            // Pass preview URL but storage layer will prioritize the Blobs
            coverUrl: selectedImagePreview || "https://images.unsplash.com/photo-1627773755483-267444009746?q=80&w=600&auto=format&fit=crop",
            coverBlob: selectedImageBlob || undefined,
            audioUrl: audioUrl,
            audioBlob: selectedFile, // Store actual file binary
            duration: '--:--', 
            genre: genre,
            releaseYear: new Date().getFullYear(),
          };

          setUploadStatus('success');
          
          setTimeout(() => {
            onAddSong(newSong);
          }, 800);
          
          return 100;
        }
        const increment = selectedFile.size > 5000000 ? 5 : 15;
        return Math.min(100, prev + Math.floor(Math.random() * increment) + 5);
      });
    }, 80);
  };

  // SVG Progress Ring calculations
  const radius = 105;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col min-h-screen bg-black px-6 pt-12 pb-10 animate-in slide-in-from-bottom duration-500 overflow-hidden text-white">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
      <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

      {/* Header */}
      <div className="flex items-center mb-10 relative">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-[#111] rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition active:scale-90 border border-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="absolute left-1/2 -translate-x-1/2 font-black text-[16px] tracking-tight uppercase">Add Details</h2>
      </div>

      {/* Cover Image Area with Circular Progress */}
      <div className="flex justify-center mb-10 relative">
        {uploadStatus !== 'idle' && (
          <svg
            height={radius * 2}
            width={radius * 2}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 z-10 pointer-events-none"
          >
            <circle
              stroke="rgba(182, 255, 26, 0.1)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="#B6FF1A"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="drop-shadow-[0_0_8px_rgba(182,255,26,0.6)]"
            />
          </svg>
        )}
        
        <div className={`relative w-[210px] h-[210px] rounded-[48px] bg-[#080808] flex items-center justify-center border border-white/[0.05] shadow-[0_25px_60px_rgba(0,0,0,0.9)] group overflow-hidden transition-all duration-500 ${uploadStatus === 'uploading' ? 'scale-90 opacity-80' : 'scale-100'}`}>
          <img 
            src={selectedImagePreview || "https://images.unsplash.com/photo-1627773755483-267444009746?q=80&w=600&auto=format&fit=crop"} 
            alt="Album Cover" 
            className={`w-full h-full object-cover transition-all duration-700 ${!selectedImagePreview ? 'opacity-30 grayscale blur-[2px]' : 'opacity-100'}`}
          />
          
          {uploadStatus === 'idle' && (
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="absolute top-5 left-5 w-9 h-9 bg-black/70 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 hover:bg-black transition active:scale-90 z-10 shadow-2xl"
            >
              <Pencil size={14} className="text-white" />
            </button>
          )}

          {!selectedImagePreview && uploadStatus === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <UploadCloud size={32} className="text-zinc-600 mb-2" />
              <p className="text-[10px] font-black uppercase text-zinc-500">Pick Art</p>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
              <p className="text-[10px] font-black text-[#B6FF1A] uppercase tracking-[0.2em] animate-pulse">Syncing...</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Fields */}
      <div className={`space-y-4 mb-8 transition-opacity duration-500 ${uploadStatus !== 'idle' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song Title"
            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-[#B6FF1A] outline-none transition-all placeholder:text-zinc-700"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist Name"
            className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-1 focus:ring-[#B6FF1A] outline-none transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      {/* Interaction List */}
      <div className={`space-y-1 flex-1 transition-opacity duration-500 ${uploadStatus !== 'idle' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-between py-5 px-1 group transition-all hover:bg-white/[0.02] rounded-2xl active:scale-[0.98]"
        >
          <div className="flex items-center gap-5">
            <div className={`${selectedFile ? 'text-[#B6FF1A]' : 'text-zinc-500'} transition-colors duration-300`}>
              <Music size={22} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <span className={`font-bold text-[16px] ${selectedFile ? 'text-[#B6FF1A]' : 'text-white'}`}>
                {selectedFile ? 'Change Music' : 'Add Music'}
              </span>
              {selectedFile && <p className="text-[10px] text-zinc-500 truncate max-w-[200px] mt-0.5">{selectedFile.name}</p>}
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-800" />
        </button>

        <button 
          onClick={() => setActivePicker('visibility')}
          className="w-full flex items-center justify-between py-5 px-1 group transition-all hover:bg-white/[0.02] rounded-2xl active:scale-[0.98]"
        >
          <div className="flex items-center gap-5">
            <div className="text-zinc-500 group-hover:text-white transition duration-300">
              <Globe size={22} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">VISIBILITY</p>
              <p className="font-bold text-[16px] text-white">{visibility}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-800" />
        </button>

        <button 
          onClick={() => setActivePicker('genre')}
          className="w-full flex items-center justify-between py-5 px-1 group transition-all hover:bg-white/[0.02] rounded-2xl active:scale-[0.98]"
        >
          <div className="flex items-center gap-5">
            <div className="text-zinc-500 group-hover:text-white transition duration-300">
              <Music2 size={22} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em] mb-1">PICK GENRE</p>
              <p className="font-bold text-[16px] text-white">{genre}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-800" />
        </button>
      </div>

      {/* Upload Progress Section */}
      {uploadStatus !== 'idle' && (
        <div className="mb-6 px-1 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${uploadStatus === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[#B6FF1A]/20 text-[#B6FF1A]'}`}>
                {uploadStatus === 'success' ? <Check size={12} strokeWidth={4} /> : <Loader2 size={12} className="animate-spin" />}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 block">
                  {uploadStatus === 'uploading' ? 'Syncing Library' : 'Upload Complete'}
                </span>
                {uploadStatus === 'uploading' && (
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Processing high-quality audio...</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[12px] font-black tabular-nums block ${uploadStatus === 'success' ? 'text-emerald-500' : 'text-[#B6FF1A]'}`}>
                {uploadProgress}%
              </span>
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.03] shadow-inner">
            <div 
              className={`h-full transition-all duration-300 ease-out relative ${uploadStatus === 'success' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-[#B6FF1A] shadow-[0_0_15px_rgba(182,255,26,0.5)]'}`}
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="pt-2">
        <button 
          onClick={startUpload}
          disabled={!selectedFile || !title || uploadStatus !== 'idle'}
          className={`w-full py-5 rounded-[24px] font-black text-base shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3
            ${uploadStatus === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
              : uploadStatus === 'uploading'
                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-[#B6FF1A] text-black shadow-[#B6FF1A]/30 disabled:opacity-20 disabled:grayscale'
            }`}
        >
          {uploadStatus === 'idle' && (
            <>
              <UploadCloud size={20} />
              Save Track
            </>
          )}
          {uploadStatus === 'uploading' && (
            <>
              <Loader2 size={20} className="animate-spin" />
              Uploading...
            </>
          )}
          {uploadStatus === 'success' && (
            <>
              <Check size={20} strokeWidth={4} />
              Done
            </>
          )}
        </button>
      </div>

      {/* Dynamic Pickers */}
      {activePicker !== 'none' && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-in fade-in duration-300" onClick={() => setActivePicker('none')} />
          <div className="fixed bottom-0 left-0 right-0 bg-[#0c0c0c] z-[70] rounded-t-[40px] px-8 pt-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-white/[0.05]">
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8" />
            <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-600 mb-6 px-2">
              Select {activePicker === 'visibility' ? 'Visibility' : 'Genre'}
            </h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {(activePicker === 'visibility' ? visibilities : genres).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    if (activePicker === 'visibility') setVisibility(option);
                    else setGenre(option);
                    setActivePicker('none');
                  }}
                  className={`w-full flex items-center justify-between py-5 px-4 rounded-2xl transition-all
                    ${(activePicker === 'visibility' ? visibility : genre) === option 
                      ? 'bg-[#B6FF1A]/10 text-[#B6FF1A]' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
                    }`}
                >
                  <span className="font-bold text-lg">{option}</span>
                  {(activePicker === 'visibility' ? visibility : genre) === option && <Check size={20} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default AddDetailsView;