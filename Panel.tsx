/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ComicFace, ComicPanelData, UILanguage, UI_TRANSLATIONS } from './types';
import { LoadingFX } from './LoadingFX';

interface PanelProps {
    face?: ComicFace;
    allFaces: ComicFace[]; 
    viewMode: 'book' | 'list';
    uiLang: UILanguage;
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
    onRegenerate: (faceId: string, panelId: string, newPrompt?: string) => void;
    onRegenerateLastFrame?: (faceId: string, panelId: string) => void;
    onGenerateVideo?: (faceId: string, panelId: string) => void;
    onDeletePanelImage?: (faceId: string, panelId: string, type: 'start' | 'end') => void;
}

const SubPanel: React.FC<{ 
    panel: ComicPanelData; 
    faceId: string;
    uiLang: UILanguage;
    onRegenerate: (faceId: string, panelId: string, newPrompt?: string) => void;
    onRegenerateLastFrame?: (faceId: string, panelId: string) => void;
    onDeletePanelImage?: (faceId: string, panelId: string, type: 'start' | 'end') => void;
}> = ({ panel, faceId, uiLang, onRegenerate, onRegenerateLastFrame, onDeletePanelImage }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [lastFrameHovered, setLastFrameHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const t = UI_TRANSLATIONS[uiLang];
    
    // Determine layout: Split if lastFrame exists, otherwise single
    const isSplit = !!panel.lastFrameUrl;

    // Handle video play on hover
    useEffect(() => {
        if (panel.videoUrl && videoRef.current) {
            if (isHovered) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => { /* Ignore auto-play errors */ });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isHovered, panel.videoUrl]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#1a1a1a] flex">
             
             {/* LEFT SIDE (First Frame) - Full width if no last frame */}
             <div className={`relative h-full ${isSplit ? 'w-1/2 border-r border-[#333]' : 'w-full'} group`}
                  onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                 
                 {panel.imageUrl ? (
                     <>
                        <img 
                            src={panel.imageUrl} 
                            alt={panel.scene} 
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${panel.videoUrl && isHovered ? 'opacity-0' : 'opacity-90 group-hover:opacity-100'}`} 
                        />
                        
                        {panel.videoUrl && (
                            <video
                                ref={videoRef}
                                src={panel.videoUrl}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                muted
                                loop
                                playsInline
                            />
                        )}
                     </>
                 ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#151515]">
                        {panel.isLoading ? <LoadingFX inline={true} /> : (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-gray-700 text-xs font-mono uppercase">{t.label_pending}</span>
                                {/* REGENERATE BUTTON IF IMAGE MISSING & NOT LOADING */}
                                <button 
                                    onClick={() => onRegenerate(faceId, panel.id)}
                                    className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded text-[10px] font-bold hover:bg-red-900/50 uppercase"
                                >
                                    ↻ {t.btn_regenerate}
                                </button>
                            </div>
                        )}
                     </div>
                 )}
                 
                 {/* Veo Badge */}
                 {panel.videoUrl && (
                     <div className="absolute top-4 right-4 bg-blue-600/20 backdrop-blur border border-blue-500/50 text-blue-200 text-[9px] font-bold px-3 py-1 rounded-sm tracking-widest z-10 pointer-events-none">
                         VEO 3.1
                     </div>
                 )}

                 {/* Hover Controls (Glass) */}
                 {!panel.isLoading && panel.imageUrl && (
                     <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center gap-4 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          <button onClick={() => onRegenerate(faceId, panel.id)} className="w-9 h-9 rounded bg-[#333] flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors border border-gray-600" title="Regenerate Image">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                          </button>
                          {onDeletePanelImage && (
                              <button onClick={() => onDeletePanelImage(faceId, panel.id, 'start')} className="w-9 h-9 rounded bg-[#333] flex items-center justify-center hover:bg-red-600 hover:text-white text-gray-300 transition-colors border border-gray-600" title="Delete Frame">
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              </button>
                          )}
                     </div>
                 )}
                 
                 {isSplit && <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-[8px] font-bold text-gray-300 rounded pointer-events-none">START</div>}
             </div>

             {/* RIGHT SIDE (Last Frame) - Only if exists */}
             {isSplit && (
                 <div className="relative w-1/2 h-full group"
                      onMouseEnter={() => setLastFrameHovered(true)} onMouseLeave={() => setLastFrameHovered(false)}>
                     
                     <img 
                        src={panel.lastFrameUrl} 
                        alt="End Frame" 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     />
                     <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-[8px] font-bold text-gray-300 rounded pointer-events-none">END</div>

                     {/* Last Frame Hover Controls */}
                     <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center gap-4 ${lastFrameHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          {onRegenerateLastFrame && (
                              <button onClick={() => onRegenerateLastFrame(faceId, panel.id)} className="w-9 h-9 rounded bg-[#333] flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors border border-gray-600" title="Regenerate Last Frame">
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                              </button>
                          )}
                          {onDeletePanelImage && (
                              <button onClick={() => onDeletePanelImage(faceId, panel.id, 'end')} className="w-9 h-9 rounded bg-[#333] flex items-center justify-center hover:bg-red-600 hover:text-white text-gray-300 transition-colors border border-gray-600" title="Delete Frame">
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              </button>
                          )}
                     </div>
                 </div>
             )}

             {/* Text Overlay (Dark Gradient) - Spans full width */}
             {(panel.caption || panel.dialogue) && panel.imageUrl && (
                 <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-12 pointer-events-none z-20">
                     {panel.caption && (
                         <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">{panel.caption}</p>
                     )}
                     {panel.dialogue && (
                         <p className="text-white text-lg font-medium leading-snug font-serif italic">"{panel.dialogue}"</p>
                     )}
                 </div>
             )}
        </div>
    );
};

export const Panel: React.FC<PanelProps> = ({ face, viewMode, uiLang, onRegenerate, onRegenerateLastFrame, onDeletePanelImage }) => {
    if (!face) return null;
    
    // Cover Logic handled in Book.tsx, here just render content
    if (face.layout === 'single') {
        const p = face.panels[0];
        if (!p) return null;
        return <div className="w-full h-full"><SubPanel panel={p} faceId={face.id} uiLang={uiLang} onRegenerate={onRegenerate} onRegenerateLastFrame={onRegenerateLastFrame} onDeletePanelImage={onDeletePanelImage} /></div>;
    }
    
    return (
         <div className="w-full h-full grid grid-rows-2 grid-cols-2 gap-[1px] bg-[#111]">
             {face.panels.map(p => <SubPanel key={p.id} panel={p} faceId={face.id} uiLang={uiLang} onRegenerate={onRegenerate} onRegenerateLastFrame={onRegenerateLastFrame} onDeletePanelImage={onDeletePanelImage} />)}
         </div>
    );
}