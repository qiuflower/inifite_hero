/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ComicFace, ComicPanelData, UILanguage, UI_TRANSLATIONS } from './types';
import { Panel } from './Panel';

interface BookProps {
    comicFaces: ComicFace[];
    currentSheetIndex: number;
    isStarted: boolean;
    isSetupVisible: boolean;
    viewMode: 'book' | 'list';
    uiLang: UILanguage;
    onSheetClick: (index: number) => void;
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
    onRegeneratePanel: (faceId: string, panelId: string, newPrompt?: string) => void;
    onUpdatePanel?: (faceId: string, panelId: string, field: 'scene' | 'prompt' | 'lighting' | 'sound_fx' | 'camera', value: string) => void;
    onGenerateVideo?: (faceId: string, panelId: string) => void;
    onUpdateAnchor?: (faceId: string, type: 'costume' | 'env', file?: File) => void;
    onUpdateExtraAnchor?: (faceId: string, file: File) => void;
    onSaveProject?: () => void;
    onLoadProject?: (file: File) => void;
    onGenerateSceneImages?: (faceId: string) => void;
    onRewriteScene?: (faceId: string) => void;
    onReshootScene?: (faceId: string) => void;
    onDeleteScene?: (faceId: string) => void;
    onGenerateLastFrame?: (faceId: string, panelId: string) => void;
    onRegenerateLastFrame?: (faceId: string, panelId: string) => void;
    onAddScene?: (afterFaceId: string) => void;
    onAddShot?: (faceId: string, afterPanelId: string) => void;
    onRemoveShot?: (faceId: string, panelId: string) => void;
    onDeletePanelImage?: (faceId: string, panelId: string, type: 'start' | 'end') => void;
    onUpdateSceneMeta?: (faceId: string, field: string, val: string) => void;
    onRegenerateAnchor?: (faceId: string, type: 'costume' | 'env') => void;
    onOpenVideoEditor?: () => void;
    onOpenMusic?: () => void;
}

const AnchorDisplay: React.FC<{ 
    label: string, 
    imgUrl?: string, 
    onUpload?: (f: File) => void, 
    onPreview: (url: string) => void,
    onRegenerate?: () => void
}> = ({ label, imgUrl, onUpload, onPreview, onRegenerate }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="flex flex-col gap-1 items-center">
             <span className="text-[9px] font-bold text-gray-500 uppercase">{label}</span>
             <div 
                className="relative w-16 h-16 bg-[#0a0a0a] rounded border border-[#333] overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
             >
                 {imgUrl ? (
                     <img onClick={() => onPreview(imgUrl)} src={imgUrl} className="w-full h-full object-cover cursor-zoom-in" alt={label} />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">?</div>
                 )}
                 
                 {onUpload && (
                     <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-10">
                         <span className="text-[9px] text-white font-bold mb-1">{imgUrl ? 'REPLACE' : 'UPLOAD'}</span>
                         <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                             if(e.target.files?.[0]) onUpload(e.target.files[0]);
                         }}/>
                     </label>
                 )}

                 {onRegenerate && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                        className={`absolute bottom-0 right-0 p-1 bg-blue-600 hover:bg-blue-500 text-white z-20 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        title="Regenerate Reference with AI"
                     >
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                         </svg>
                     </button>
                 )}
             </div>
        </div>
    )
}

const Lightbox: React.FC<{ url: string, onClose: () => void }> = ({ url, onClose }) => (
    <div onClick={onClose} className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-10 cursor-zoom-out animate-in fade-in duration-200">
        <img src={url} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Lightbox" />
    </div>
);

export const Book: React.FC<BookProps> = (props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const t = UI_TRANSLATIONS[props.uiLang];

    if (!props.isStarted) return null;

    return (
        <div className="w-full h-screen overflow-y-auto bg-[#050505] custom-scrollbar pb-24">
            {previewUrl && <Lightbox url={previewUrl} onClose={() => setPreviewUrl(null)} />}

            {/* Dark Cinematic Header */}
            <div className="sticky top-0 z-50 px-8 py-4 bg-[#050505]/95 backdrop-blur-md border-b border-[#222] flex justify-between items-center">
                 <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-200 tracking-widest uppercase">{t.title_main} {t.title_sub}</h1>
                    <span className="text-[9px] text-gray-500">{t.subtitle}</span>
                 </div>
                 <div className="flex gap-4 items-center">
                     {props.onSaveProject && (
                        <button onClick={props.onSaveProject} className="cine-btn-secondary py-2 px-4 cursor-pointer text-blue-400 hover:text-white transition-colors">
                           {t.btn_save}
                        </button>
                     )}
                     {props.onLoadProject && (
                        <label className="cine-btn-secondary py-2 px-4 cursor-pointer text-blue-400 hover:text-white transition-colors">
                           {t.btn_open}
                           <input type="file" accept=".infinite,.json" className="hidden" onChange={(e) => {
                               if (e.target.files?.[0]) props.onLoadProject!(e.target.files[0]);
                           }} />
                        </label>
                     )}
                     <div className="w-[1px] bg-[#333] h-6"></div>
                     <button onClick={props.onReset} className="cine-btn-secondary py-2 px-4 cursor-pointer text-blue-400 hover:text-white transition-colors">
                        {t.btn_exit}
                     </button>
                     <button onClick={props.onDownload} className="cine-btn-secondary py-2 px-4 cursor-pointer text-blue-400 hover:text-white transition-colors border border-blue-900/50 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        {t.btn_export}
                     </button>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col gap-20 pb-40">
                {props.comicFaces.map((face, faceIdx) => {
                    if (face.panels.length === 0 && face.type !== 'story') return null;
                    const isCover = face.type === 'cover' || face.type === 'back_cover';
                    const showScriptEditor = !face.isVisualized && !face.isLoading && !isCover;

                    return (
                        <React.Fragment key={face.id}>
                            <div className="flex flex-col gap-6 relative">
                                {/* COVER / BACK COVER HEADER WITH REWRITE/RESHOOT */}
                                {isCover && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-black text-white uppercase">{face.type === 'cover' ? 'POSTER' : 'ENDING'}</h2>
                                        {props.onRewriteScene && (
                                            <button onClick={() => props.onRewriteScene!(face.id)} className="ml-4 text-[10px] bg-[#222] hover:bg-blue-600 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors">
                                                {t.btn_rewrite}
                                            </button>
                                        )}
                                        {props.onReshootScene && (
                                            <button onClick={() => props.onReshootScene!(face.id)} className="text-[10px] bg-[#222] hover:bg-purple-600 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors">
                                                {t.btn_reshoot}
                                            </button>
                                        )}
                                        {/* Allow visualizing Covers/Endings consistent with sceneData */}
                                        {!face.isVisualized && !face.isLoading && props.onGenerateSceneImages && (
                                            <button 
                                                onClick={() => props.onGenerateSceneImages!(face.id)}
                                                className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors uppercase font-bold ml-4 animate-pulse"
                                            >
                                                {t.label_visualize}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Scene Header */}
                                {!isCover && face.sceneData && (
                                    <div className="sticky top-20 z-30 bg-[#121212]/95 backdrop-blur border-l-4 border-blue-600 p-4 shadow-2xl rounded-r-lg mb-2 flex justify-between items-start gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-xl font-black text-white uppercase">{t.label_scene} {(face.pageIndex || 0).toString().padStart(2, '0')}</h2>
                                                {props.onRewriteScene && (
                                                    <button onClick={() => props.onRewriteScene!(face.id)} className="text-[10px] bg-[#0a0a0a] border border-[#333] hover:border-blue-500 text-gray-400 hover:text-white px-2 py-1 rounded transition-colors">
                                                        {t.btn_rewrite}
                                                    </button>
                                                )}
                                                {props.onReshootScene && (
                                                    <button onClick={() => props.onReshootScene!(face.id)} className="text-[10px] bg-[#0a0a0a] border border-[#333] hover:border-purple-500 text-gray-400 hover:text-white px-2 py-1 rounded transition-colors">
                                                        {t.btn_reshoot}
                                                    </button>
                                                )}
                                                {props.onDeleteScene && (
                                                    <button onClick={() => props.onDeleteScene!(face.id)} className="text-[10px] bg-[#0a0a0a] border border-[#333] hover:border-red-500 text-gray-400 hover:text-white px-2 py-1 rounded transition-colors">
                                                        {t.btn_delete}
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Editable Scene Description */}
                                            <textarea 
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-xs text-gray-300 font-mono mb-2 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                                rows={2}
                                                value={face.sceneData.setting}
                                                onChange={(e) => props.onUpdateSceneMeta && props.onUpdateSceneMeta(face.id, 'setting', e.target.value)}
                                                placeholder="Scene description / setting..."
                                            />
                                            
                                            {/* Editable Tags */}
                                            <div className="flex gap-2 flex-wrap">
                                                <div className="flex items-center gap-1 bg-[#0a0a0a] rounded px-2 py-1 border border-[#222]">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{t.label_mood}:</span>
                                                    <input 
                                                        className="bg-transparent border-none text-[9px] font-bold text-gray-300 uppercase focus:outline-none w-24"
                                                        value={face.sceneData.mood}
                                                        onChange={(e) => props.onUpdateSceneMeta && props.onUpdateSceneMeta(face.id, 'mood', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 bg-[#0a0a0a] rounded px-2 py-1 border border-[#222]">
                                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{t.label_costume}:</span>
                                                    <input 
                                                        className="bg-transparent border-none text-[9px] font-bold text-gray-300 uppercase focus:outline-none w-48"
                                                        value={face.sceneData.costume_rule}
                                                        onChange={(e) => props.onUpdateSceneMeta && props.onUpdateSceneMeta(face.id, 'costume_rule', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons & Anchors */}
                                        <div className="flex gap-4 items-center">
                                            {!face.isVisualized && !face.isLoading && props.onGenerateSceneImages && (
                                                <button 
                                                    onClick={() => props.onGenerateSceneImages!(face.id)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase px-6 py-4 rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all animate-pulse"
                                                >
                                                    {t.label_visualize}
                                                </button>
                                            )}
                                            
                                            {/* Anchors */}
                                            <div className="flex gap-4 bg-[#1a1a1a] p-2 rounded border border-[#333]">
                                                <div className="flex gap-4 border-r border-[#333] pr-4">
                                                    <AnchorDisplay 
                                                        label={t.label_costume}
                                                        imgUrl={face.sceneData.anchor_costume_url} 
                                                        onUpload={(f) => props.onUpdateAnchor && props.onUpdateAnchor(face.id, 'costume', f)}
                                                        onPreview={setPreviewUrl}
                                                        onRegenerate={() => props.onRegenerateAnchor && props.onRegenerateAnchor(face.id, 'costume')}
                                                    />
                                                    <AnchorDisplay 
                                                        label={t.locations_title.split(' ')[0]} 
                                                        imgUrl={face.sceneData.anchor_environment_url} 
                                                        onUpload={(f) => props.onUpdateAnchor && props.onUpdateAnchor(face.id, 'env', f)}
                                                        onPreview={setPreviewUrl}
                                                        onRegenerate={() => props.onRegenerateAnchor && props.onRegenerateAnchor(face.id, 'env')}
                                                    />
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    {face.sceneData.extra_anchors?.map((url, idx) => (
                                                        <div key={idx} className="w-16 h-16 bg-[#0a0a0a] rounded border border-[#333] overflow-hidden cursor-zoom-in">
                                                            <img src={url} className="w-full h-full object-cover" onClick={() => setPreviewUrl(url)} alt={`Extra ${idx}`} />
                                                        </div>
                                                    ))}
                                                    {(face.sceneData.extra_anchors?.length || 0) < 5 && (
                                                        <label className="w-16 h-16 bg-[#0a0a0a] rounded border border-[#333] border-dashed flex items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors">
                                                            <span className="text-xl text-gray-600 font-light">+</span>
                                                            <span className="text-[8px] text-gray-500 absolute bottom-1">REF</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                                if(e.target.files?.[0] && props.onUpdateExtraAnchor) props.onUpdateExtraAnchor(face.id, e.target.files[0]);
                                                            }}/>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT AREA */}
                                {showScriptEditor ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {face.panels.map((panel) => (
                                            <div key={panel.id} className="bg-[#121212] border border-[#2a2a2a] p-6 rounded-lg shadow-lg flex flex-col md:flex-row gap-6 relative group">
                                                <div className="w-16 flex flex-col items-center justify-center border-r border-[#222]">
                                                    <span className="text-2xl font-bold text-gray-700">#{panel.index + 1}</span>
                                                    {props.onRemoveShot && (
                                                        <button 
                                                            onClick={() => props.onRemoveShot!(face.id, panel.id)}
                                                            className="mt-4 text-gray-600 hover:text-red-500 transition-colors"
                                                            title="Delete Shot"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1">Visual Action</label>
                                                            <textarea 
                                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-sm text-gray-300 focus:border-blue-500 outline-none h-24 resize-none"
                                                                value={panel.scene}
                                                                onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'scene', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Dialogue</label>
                                                            <input 
                                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-sm text-gray-300 focus:border-blue-500 outline-none font-serif italic"
                                                                value={panel.dialogue || ''}
                                                                onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'prompt', e.target.value)} 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Camera</label>
                                                                <input className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-xs text-gray-400" value={panel.camera || ''} onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'camera', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Lighting</label>
                                                                <input className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-xs text-gray-400" value={panel.lighting || ''} onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'lighting', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Sound FX</label>
                                                            <input className="w-full bg-[#0a0a0a] border border-[#333] rounded p-2 text-xs text-gray-400" value={panel.sound_fx || ''} onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'sound_fx', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {props.onAddShot && (
                                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => props.onAddShot!(face.id, panel.id)} className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`grid gap-6 ${isCover ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                                        {face.panels.map((panel) => (
                                            <div key={panel.id} className="bg-[#121212] border border-[#222] rounded-xl overflow-hidden shadow-2xl flex flex-col group hover:border-blue-500/30 transition-all">
                                                <div className="aspect-video w-full bg-[#0a0a0a] relative">
                                                    <Panel 
                                                        face={{...face, panels: [panel], layout: 'single'}} 
                                                        allFaces={props.comicFaces} 
                                                        viewMode='list'
                                                        uiLang={props.uiLang}
                                                        onChoice={() => {}} 
                                                        onOpenBook={() => {}} 
                                                        onDownload={props.onDownload} 
                                                        onReset={props.onReset}
                                                        onRegenerate={props.onRegeneratePanel}
                                                        onRegenerateLastFrame={props.onRegenerateLastFrame}
                                                        onDeletePanelImage={props.onDeletePanelImage}
                                                    />
                                                </div>
                                                <div className="p-4 bg-[#0f0f0f] flex flex-col gap-3 border-t border-[#222]">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold bg-[#222] text-gray-400 px-2 py-1 rounded">{t.label_shot} {panel.index + 1}</span>
                                                            {props.onGenerateVideo && panel.imageUrl && (
                                                                <button 
                                                                    onClick={() => props.onGenerateVideo!(face.id, panel.id)}
                                                                    disabled={panel.videoStatus === 'generating'}
                                                                    className={`text-[9px] font-bold px-2 py-1 rounded transition-colors uppercase ${panel.videoStatus === 'generating' ? 'bg-yellow-900/50 text-yellow-500' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white'}`}
                                                                >
                                                                    {panel.videoStatus === 'generating' ? '...' : t.btn_action}
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {panel.isLoading && <span className="text-[9px] text-yellow-500 animate-pulse">RENDERING...</span>}
                                                        {panel.videoStatus === 'generating' && <span className="text-[9px] text-yellow-500 animate-pulse">VEO {(panel.videoProgress !== undefined) ? Math.round(panel.videoProgress) + '%' : '...'}</span>}
                                                        
                                                        <div className="flex gap-2">
                                                            {!panel.lastFrameUrl && panel.imageUrl && !panel.isLoading && props.onGenerateLastFrame && (
                                                                <button 
                                                                onClick={() => props.onGenerateLastFrame!(face.id, panel.id)}
                                                                className="text-[9px] font-bold text-purple-400 hover:text-white px-2 py-1 rounded hover:bg-purple-900/50 border border-transparent hover:border-purple-500 transition-colors uppercase"
                                                                >
                                                                    {t.btn_end_frame}
                                                                </button>
                                                            )}
                                                            {props.onAddShot && (
                                                                <button onClick={() => props.onAddShot!(face.id, panel.id)} className="text-[9px] font-bold text-green-400 hover:text-white px-2 py-1 rounded hover:bg-green-900/50 border border-transparent hover:border-green-500 transition-colors uppercase">
                                                                    {t.btn_insert}
                                                                </button>
                                                            )}
                                                            {props.onRemoveShot && (
                                                                <button onClick={() => props.onRemoveShot!(face.id, panel.id)} className="text-[9px] font-bold text-red-400 hover:text-white px-2 py-1 rounded hover:bg-red-900/50 border border-transparent hover:border-red-500 transition-colors uppercase">
                                                                    {t.btn_delete}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <textarea 
                                                            className="w-full bg-transparent text-xs text-gray-400 leading-relaxed resize-none outline-none border-b border-[#222] focus:border-blue-500 transition-colors h-12"
                                                            value={panel.scene}
                                                            onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'scene', e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <input className="flex-1 bg-transparent border-b border-[#222] text-[10px] text-gray-500" value={panel.camera} onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'camera', e.target.value)} />
                                                            <input className="flex-1 bg-transparent border-b border-[#222] text-[10px] text-gray-500" value={panel.sound_fx} onChange={(e) => props.onUpdatePanel && props.onUpdatePanel(face.id, panel.id, 'sound_fx', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isCover && faceIdx < props.comicFaces.length - 1 && props.onAddScene && (
                                <div className="relative py-8 flex items-center justify-center group cursor-pointer" onClick={() => props.onAddScene!(face.id)}>
                                    <div className="w-full h-[1px] bg-[#222] group-hover:bg-blue-900 transition-colors"></div>
                                    <div className="absolute bg-[#050505] px-4">
                                        <button className="text-gray-600 group-hover:text-blue-500 border border-[#333] group-hover:border-blue-500 rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-lg text-lg pb-1">
                                            +
                                        </button>
                                    </div>
                                    <div className="absolute top-12 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                                        {t.btn_add_scene}
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
                <div className="bg-[#121212]/90 backdrop-blur-xl border border-[#333] rounded-full p-2 flex items-center gap-2 shadow-2xl">
                    {props.onOpenVideoEditor && (
                        <button 
                            onClick={props.onOpenVideoEditor}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-6 py-3 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        >
                            <span className="text-lg">✂️</span> {t.btn_editor}
                        </button>
                    )}
                    
                    <div className="w-[1px] h-6 bg-[#333]"></div>

                    {props.onOpenMusic && (
                        <button 
                            onClick={props.onOpenMusic}
                            className="hover:bg-[#222] text-gray-300 hover:text-white font-bold text-xs uppercase px-4 py-3 rounded-full transition-all flex items-center gap-2"
                        >
                            <span className="text-lg">🎵</span> {t.btn_music}
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}