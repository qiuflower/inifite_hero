/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ComicFace, ComicPanelData, AudioTrack, AspectRatio } from './types';

interface VideoEditorProps {
    faces: ComicFace[];
    audioTrack?: AudioTrack;
    aspectRatio: AspectRatio;
    onGenerateMusic: () => void;
    onBack: () => void;
    onExport: () => void;
    onSettings: () => void;
    onTogglePanelAudio: (faceId: string, panelId: string) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ 
    faces, audioTrack, aspectRatio, onGenerateMusic, onBack, onExport, onSettings, onTogglePanelAudio
}) => {
    // Flatten panels
    const allPanels = faces.flatMap(f => f.panels.map(p => ({ ...p, faceId: f.id })));
    const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [viewMode, setViewMode] = useState<'start' | 'end' | 'both'>('start');
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [videoError, setVideoError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedPanelId && allPanels.length > 0) {
            setSelectedPanelId(allPanels[0].id);
        }
    }, [allPanels.length]);

    const activePanel = allPanels.find(p => p.id === selectedPanelId);

    // Reset error when switching panels
    useEffect(() => {
        setVideoError(null);
    }, [selectedPanelId]);

    // Default to playing Suno audio when entering editor
    useEffect(() => {
        if (audioTrack && audioTrack.url) {
            setAudioPlaying(true);
        }
    }, [audioTrack]);

    const isPortrait = aspectRatio === '9:16';
    const playerAspectClass = isPortrait ? "aspect-[9/16] h-[90%]" : "aspect-[16/9] w-[90%]";
    
    // Auto-play video when switching if available
    useEffect(() => { 
        if(videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }

        if (activePanel?.videoUrl) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }, [selectedPanelId, activePanel?.videoUrl]);

    // Handle video play/pause and Mute logic
    useEffect(() => {
        if(videoRef.current) {
            videoRef.current.muted = !activePanel?.videoVolume;
            if(isPlaying) {
                videoRef.current.play().catch(e => {
                    console.warn("Autoplay blocked/failed", e);
                    setIsPlaying(false);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, activePanel?.videoVolume]);

    // Handle global audio track
    useEffect(() => {
        if(audioRef.current) {
            if(audioPlaying) {
                audioRef.current.play().catch(e => console.warn("Audio play failed", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [audioPlaying]);

    const handleDownloadClip = (url: string, index: number) => {
        // Direct open for download, bypassing CORS issues
        window.open(url, '_blank');
    }

    const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activePanel) return;
        const url = URL.createObjectURL(file);
        if(videoRef.current) videoRef.current.src = url;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#121212] text-white flex flex-col font-sans">
            {/* --- HEADER --- */}
            <header className="h-12 border-b border-[#2a2a2a] flex items-center justify-between px-4 bg-[#1e1e1e]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">← Exit Studio</button>
                    <span className="font-bold text-gray-200">Veo Director Suite (3.1)</span>
                </div>
                <div className="flex gap-2">
                     <button onClick={onSettings} className="bg-[#333] w-8 h-8 rounded flex items-center justify-center hover:bg-[#444] text-gray-200" title="Settings">⚙️</button>
                     <button onClick={onExport} className="bg-blue-600 px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-500 transition-colors uppercase tracking-wider flex items-center gap-2 shadow-lg">
                         <span>Export Full MV</span>
                     </button>
                </div>
            </header>

            {/* --- WORKSPACE --- */}
            <div className="flex-grow flex overflow-hidden">
                
                {/* 1. PLAYER (Left/Center) */}
                <div className="flex-1 bg-black relative flex items-center justify-center p-4">
                    <div className={`${playerAspectClass} relative bg-[#0f0f0f] border border-[#333] shadow-2xl flex items-center justify-center overflow-hidden group`}>
                        {activePanel ? (
                            <>
                                {activePanel.videoUrl && viewMode === 'start' ? (
                                    <video 
                                        ref={videoRef}
                                        key={activePanel.videoUrl} 
                                        src={activePanel.videoUrl}
                                        className="w-full h-full object-cover" 
                                        controls={false}
                                        loop
                                        playsInline
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onError={(e) => {
                                            console.error("Video Playback Error", e);
                                            setVideoError("Playback Failed");
                                            setIsPlaying(false);
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full relative">
                                        {viewMode === 'start' && (
                                            activePanel.imageUrl ? (
                                                <img src={activePanel.imageUrl} className="w-full h-full object-cover opacity-90" alt="Start Frame" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600 text-xs">No Start Frame</div>
                                            )
                                        )}
                                        {viewMode === 'end' && (
                                            (activePanel.lastFrameUrl || activePanel.imageUrl) ? (
                                                <img src={activePanel.lastFrameUrl || activePanel.imageUrl} className="w-full h-full object-cover opacity-90" alt="End Frame" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600 text-xs">No End Frame</div>
                                            )
                                        )}
                                        {viewMode === 'both' && (
                                            <div className="w-full h-full flex">
                                                <div className="w-1/2 h-full border-r border-white/20 relative">
                                                    {activePanel.imageUrl ? (
                                                        <img src={activePanel.imageUrl} className="w-full h-full object-cover" alt="Start" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600 text-xs">No Start Frame</div>
                                                    )}
                                                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded">Start</span>
                                                </div>
                                                <div className="w-1/2 h-full relative">
                                                    {activePanel.lastFrameUrl ? (
                                                        <img src={activePanel.lastFrameUrl} className="w-full h-full object-cover" alt="End" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600 text-xs">No End Frame</div>
                                                    )}
                                                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 px-1 rounded">End</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activePanel.videoUrl && viewMode === 'start' && !isPlaying && (
                                    <button onClick={() => setIsPlaying(true)} className="absolute z-20 w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30 transition-all active:scale-95 inset-0 m-auto">
                                        <span className="text-2xl ml-1">▶</span>
                                    </button>
                                )}
                                
                                {activePanel.videoUrl && viewMode === 'start' && isPlaying && (
                                    <button onClick={() => setIsPlaying(false)} className="absolute z-20 w-16 h-16 bg-transparent flex items-center justify-center opacity-0 hover:opacity-100 transition-all inset-0 m-auto">
                                         <span className="text-4xl text-white drop-shadow-lg">❚❚</span>
                                    </button>
                                )}

                                {videoError && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                                        <span className="text-3xl mb-2">⚠️</span>
                                        <span className="text-red-500 font-bold uppercase tracking-wider text-xs">{videoError}</span>
                                        <button onClick={() => { setVideoError(null); if(videoRef.current) videoRef.current.load(); }} className="mt-4 px-4 py-2 bg-[#333] hover:bg-[#444] rounded text-xs text-white">Retry</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-gray-600">No Clip Selected</span>
                        )}
                    </div>
                </div>

                {/* 2. INSPECTOR (Right) */}
                <div className="w-80 bg-[#1e1e1e] border-l border-[#2a2a2a] flex flex-col overflow-y-auto">
                    <div className="p-4 border-b border-[#2a2a2a]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Properties</h3>
                        {activePanel ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Prompt</label>
                                    <div className="bg-[#121212] p-2 rounded text-xs text-gray-300 leading-relaxed max-h-24 overflow-y-auto border border-[#333]">
                                        {activePanel.prompt}
                                    </div>
                                </div>
                                
                                {/* View Mode Toggle */}
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Frame View Mode</label>
                                    <div className="flex bg-[#121212] p-1 rounded border border-[#333]">
                                        <button 
                                            onClick={() => setViewMode('start')}
                                            className={`flex-1 py-1 text-[10px] rounded transition-colors ${viewMode === 'start' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Start
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('end')}
                                            className={`flex-1 py-1 text-[10px] rounded transition-colors ${viewMode === 'end' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            End
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('both')}
                                            className={`flex-1 py-1 text-[10px] rounded transition-colors ${viewMode === 'both' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            Both
                                        </button>
                                    </div>
                                </div>

                                {/* End Frame Preview */}
                                {activePanel.lastFrameUrl && activePanel.lastFrameUrl.trim() !== '' && (
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">End Frame Asset</label>
                                        <div className="aspect-video w-full rounded border border-[#333] overflow-hidden">
                                            <img src={activePanel.lastFrameUrl} className="w-full h-full object-cover" alt="End Frame" />
                                        </div>
                                    </div>
                                )}

                                {/* Video Audio Toggle */}
                                {activePanel.videoUrl && (
                                    <div>
                                         <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Clip Audio</label>
                                         <button 
                                            onClick={() => onTogglePanelAudio(activePanel.faceId, activePanel.id)}
                                            className={`w-full py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${activePanel.videoVolume ? 'bg-green-900/30 border-green-600 text-green-400' : 'bg-red-900/10 border-red-900/30 text-gray-500'}`}
                                         >
                                             {activePanel.videoVolume ? '🔊 Video Sound: ON' : '🔇 Video Sound: OFF'}
                                         </button>
                                         <p className="text-[10px] text-gray-500 mt-1">Enable this to hear sound effects generated by Veo (if any).</p>
                                    </div>
                                )}

                                <div>
                                    {activePanel.videoStatus === 'done' && activePanel.videoUrl && (
                                        <button onClick={() => handleDownloadClip(activePanel.videoUrl!, activePanel.index)} className="w-full text-xs bg-[#333] px-2 py-3 rounded hover:bg-[#444] text-white border border-gray-600 transition-colors">
                                            ⬇ Open Video Link
                                        </button>
                                    )}
                                </div>
                                
                                {/* Custom Upload for replacing content */}
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Replace Media</label>
                                    <label className="w-full text-xs bg-[#222] px-2 py-3 rounded hover:bg-[#333] text-gray-300 border border-dashed border-[#444] transition-colors cursor-pointer flex items-center justify-center">
                                        <span>📁 Upload Custom File</span>
                                        <input type="file" className="hidden" accept="video/*,image/*" onChange={handleCustomUpload} />
                                    </label>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center text-gray-600 text-sm mt-10">Select a clip to edit</div>
                        )}
                    </div>
                    
                    {/* Global Music Controls */}
                    <div className="p-4 mt-auto border-t border-[#2a2a2a] bg-[#1a1a1a]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Suno Soundtrack</h3>
                        {audioTrack ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">🎵</div>
                                    <div className="overflow-hidden w-full">
                                        <div className="text-xs font-bold text-white truncate">{audioTrack.title}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={onGenerateMusic} className="flex-1 bg-[#333] hover:bg-[#444] text-[10px] py-2 rounded text-gray-200">
                                        Regenerate
                                    </button>
                                    {audioTrack.url && (
                                        <button onClick={() => handleDownloadClip(audioTrack.url, 0)} className="flex-1 bg-[#333] hover:bg-[#444] text-[10px] py-2 rounded text-gray-200">
                                            Open
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button onClick={onGenerateMusic} className="w-full border border-dashed border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white py-4 rounded text-xs font-bold transition-all">
                                + Generate Music
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TIMELINE (Bottom) --- */}
            <div className="h-64 bg-[#121212] border-t border-[#2a2a2a] flex flex-col">
                <div className="h-8 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-4 justify-between">
                     <span className="text-[10px] font-mono text-gray-500">Timeline</span>
                </div>
                
                <div className="flex-grow p-4 overflow-x-auto overflow-y-hidden custom-scrollbar">
                     <div className="flex flex-col gap-2 min-w-max">
                         
                         {/* Video Track */}
                         <div className="flex h-20 bg-[#1a1a1a] rounded-lg p-1 gap-1">
                             {allPanels.map((p, i) => (
                                 <div 
                                    key={p.id}
                                    onClick={() => setSelectedPanelId(p.id)}
                                    className={`relative flex-shrink-0 h-full aspect-video rounded cursor-pointer border-2 transition-all overflow-hidden group ${
                                        selectedPanelId === p.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                                 >
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-xs">No Image</div>
                                    )}
                                    <div className="absolute top-1 right-1 flex gap-1">
                                        {p.videoStatus === 'done' && (
                                            <div className={`w-2 h-2 bg-green-500 rounded-full shadow-lg border border-white ${isPlaying && selectedPanelId === p.id ? 'animate-pulse bg-green-400' : ''}`} />
                                        )}
                                        {p.videoStatus === 'generating' && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-bold text-yellow-500">{(p.videoProgress !== undefined) ? Math.round(p.videoProgress) + '%' : ''}</span>
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                                            </div>
                                        )}
                                        {p.videoStatus === 'error' && <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg border border-white" />}
                                    </div>
                                    <div className="absolute top-1 left-1">
                                         {p.videoStatus === 'done' && !p.videoVolume && (
                                             <div className="bg-black/50 rounded p-[1px]"><span className="text-[8px]">🔇</span></div>
                                         )}
                                    </div>
                                    {p.lastFrameUrl && (
                                        <div className="absolute top-1 right-4 bg-purple-600/80 rounded p-[1px] text-[8px] px-1" title="Has End Frame">🏁</div>
                                    )}
                                    <div className="absolute bottom-1 left-1 bg-black/50 px-1 rounded text-[8px] font-mono text-white">{i+1}</div>
                                 </div>
                             ))}
                         </div>

                         {/* Audio Track */}
                         <div className={`flex h-12 rounded-lg p-1 items-center justify-center relative overflow-hidden transition-all ${audioTrack ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-[#1a1a1a] border border-[#2a2a2a] border-dashed'}`}>
                            {audioTrack ? (
                                <div className="w-full flex items-center px-4 gap-4">
                                    <button 
                                        onClick={() => setAudioPlaying(!audioPlaying)}
                                        className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-white shadow-lg z-10"
                                    >
                                        {audioPlaying ? '⏸' : '▶'}
                                    </button>
                                    <span className="text-xs font-bold text-indigo-200 whitespace-nowrap">{audioTrack.title}</span>
                                    <div className="flex-grow h-6 flex items-center gap-0.5 opacity-50">
                                        {Array.from({length: 50}).map((_, i) => (
                                            <div key={i} className="w-1 bg-indigo-400 rounded-full" style={{height: `${20 + Math.random()*80}%`}} />
                                        ))}
                                    </div>
                                    <audio 
                                        ref={audioRef} 
                                        src={audioTrack.url} 
                                        className="hidden" 
                                        onEnded={() => setAudioPlaying(false)}
                                    />
                                </div>
                            ) : (
                                <span className="text-xs text-gray-600">No Audio Track</span>
                            )}
                         </div>

                     </div>
                </div>
            </div>
        </div>
    );
};
