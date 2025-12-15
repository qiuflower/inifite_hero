/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { GENRE_CATEGORIES, LANGUAGES, STYLE_CELEBS, STYLE_ART, STYLE_WORKS, PAGE_COUNTS, Persona, Item, Location, AspectRatio, UILanguage, UI_TRANSLATIONS, SavedConfig, VEO_MODELS } from './types';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    loadingAction: string | null;
    heroes: Persona[];
    supports: Persona[];
    items: Item[];
    locations: Location[];
    
    selectedGenre: string;
    
    selectedDirector: string;
    selectedArtStyle: string;
    selectedRefWork: string;

    selectedLanguage: string;
    selectedPageCount: number;
    selectedAspectRatio: AspectRatio;
    customPremise: string;
    richMode: boolean;
    customStylePrompt: string;
    uiLang: UILanguage;
    onSetUiLang: (lang: UILanguage) => void;
    onAddPersona: (type: 'hero' | 'support', file: File, name: string) => void;
    onRemovePersona: (type: 'hero' | 'support', id: string) => void;
    onUpdatePersonaName: (type: 'hero' | 'support', id: string, newName: string) => void;
    onAddItem: (file: File, name: string) => void;
    onRemoveItem: (id: string) => void;
    onAddLocation: (file: File, name: string) => void;
    onRemoveLocation: (id: string) => void;
    
    onGenreChange: (val: string) => void;
    onDirectorChange: (val: string) => void;
    onArtStyleChange: (val: string) => void;
    onRefWorkChange: (val: string) => void;

    onCustomStyleChange: (val: string) => void;
    onLanguageChange: (val: string) => void;
    onPageCountChange: (val: number) => void;
    onAspectRatioChange: (val: AspectRatio) => void;
    onPremiseChange: (val: string) => void;
    onRichModeChange: (val: boolean) => void;
    onVideoModelChange?: (val: string) => void;
    selectedVideoModel?: string;
    onLaunch: () => void;
    onLoadPreset?: (config: SavedConfig) => void;
    onSwitchApiKey?: () => void;
    // New Props for Inspiration/Recommendation
    onRecommendConfig?: () => Promise<void>;
    onInspireOptions?: (type: 'genre' | 'director' | 'art' | 'work') => Promise<string[]>;
    onInspirePremise?: () => Promise<void>;
    dynamicGenres?: string[];
    dynamicDirectors?: string[];
    dynamicArtStyles?: string[];
    dynamicWorks?: string[];
}

const AvatarSlot: React.FC<{ 
    label: string; 
    imgBase64?: string; 
    name?: string;
    onAdd: (f: File, name: string) => void; 
    onRemove: () => void; 
    onNameChange?: (name: string) => void;
    isHero?: boolean;
}> = ({ label, imgBase64, name, onAdd, onRemove, onNameChange, isHero }) => {
    return (
        <div className="flex flex-col items-center gap-2 group relative w-full">
            <div className={`relative w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 border border-[#333] shadow-lg ${imgBase64 ? 'ring-1 ring-offset-1 ring-offset-[#121212] ring-blue-600' : 'bg-[#1a1a1a] hover:bg-[#222] cursor-pointer hover:border-blue-500'}`}>
                {imgBase64 ? (
                    <>
                        <img src={`data:image/jpeg;base64,${imgBase64}`} alt="avatar" className="w-full h-full object-cover" />
                        <button onClick={onRemove} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs">
                            ✕
                        </button>
                    </>
                ) : (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                        <span className="text-xl text-gray-600 group-hover:text-blue-500 transition-colors">+</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            if (e.target.files?.[0]) {
                                const newName = prompt("Enter Name/Description:") || label;
                                onAdd(e.target.files[0], newName);
                            }
                        }} />
                    </label>
                )}
            </div>
            
            {imgBase64 && onNameChange ? (
                <input 
                    type="text"
                    value={name || ""}
                    onChange={(e) => onNameChange(e.target.value)}
                    className={`w-full bg-transparent text-center text-[10px] uppercase tracking-wider font-bold truncate outline-none border-b border-transparent hover:border-blue-500 focus:border-blue-500 transition-all ${isHero ? 'text-blue-400' : 'text-gray-500'}`}
                />
            ) : (
                <span className="text-[9px] text-gray-700 truncate w-full text-center">{name || label}</span>
            )}
        </div>
    );
};

export const Setup: React.FC<SetupProps> = (props) => {
    const [presets, setPresets] = useState<SavedConfig[]>([]);
    const [showPresetSave, setShowPresetSave] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [activeTab, setActiveTab] = useState<'cast' | 'props' | 'loc'>('cast');
    
    // Internal state to track the active Category for the two-step dropdown
    const [activeCategory, setActiveCategory] = useState<string>(Object.keys(GENRE_CATEGORIES)[1]); // Default to second cat (Ads or Drama)

    // Update active category when selectedGenre changes externally (e.g. preset load)
    useEffect(() => {
        const foundCat = Object.keys(GENRE_CATEGORIES).find(cat => 
            GENRE_CATEGORIES[cat].includes(props.selectedGenre)
        );
        if (foundCat) setActiveCategory(foundCat);
    }, [props.selectedGenre]);

    // Load presets
    useEffect(() => {
        const saved = localStorage.getItem('infinite_presets');
        if (saved) setPresets(JSON.parse(saved));
    }, []);

    const savePreset = () => {
        if (!newPresetName.trim()) return;
        const newConfig: SavedConfig = {
            id: Date.now().toString(),
            name: newPresetName,
            genre: props.selectedGenre,
            style: `${props.selectedDirector} | ${props.selectedArtStyle} | ${props.selectedRefWork}`,
            customStyle: props.customStylePrompt,
            lang: props.selectedLanguage,
            pageCount: props.selectedPageCount,
            aspectRatio: props.selectedAspectRatio,
            premise: props.customPremise,
            richMode: props.richMode,
            heroes: props.heroes,
            supports: props.supports
        };
        const updated = [...presets, newConfig];
        setPresets(updated);
        localStorage.setItem('infinite_presets', JSON.stringify(updated));
        setShowPresetSave(false);
        setNewPresetName("");
    };

    const loadPreset = (p: SavedConfig) => {
        if(props.onLoadPreset) props.onLoadPreset(p);
    };

    const deletePreset = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('infinite_presets', JSON.stringify(updated));
    };

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        // Default to first item in new category
        const firstGenre = GENRE_CATEGORIES[cat][0];
        if (firstGenre) props.onGenreChange(firstGenre);
    };

    if (!props.show && !props.isTransitioning) return null;
    const t = UI_TRANSLATIONS[props.uiLang];
    const MAX_HEROES = 4;
    const MAX_SUPPORTS = 10;
    const MAX_ITEMS = 5;
    const MAX_LOCS = 10;
    
    // Determine available lists (Dynamic vs Static)
    const activeSubGenres = props.dynamicGenres && props.dynamicGenres.length > 0 ? props.dynamicGenres : GENRE_CATEGORIES[activeCategory] || [];
    
    const activeDirectors = props.dynamicDirectors && props.dynamicDirectors.length > 0 ? props.dynamicDirectors : STYLE_CELEBS;
    const activeArts = props.dynamicArtStyles && props.dynamicArtStyles.length > 0 ? props.dynamicArtStyles : STYLE_ART;
    const activeWorks = props.dynamicWorks && props.dynamicWorks.length > 0 ? props.dynamicWorks : STYLE_WORKS;

    return (
        <div className={`fixed inset-0 z-[200] flex bg-[#050505] text-gray-200 font-sans transition-opacity duration-500 ${props.isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* SIDEBAR: LIBRARY & PRESETS */}
            <div className="w-[300px] border-r border-[#2a2a2a] bg-[#0c0c0c] flex flex-col hidden md:flex shrink-0">
                <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                        {props.onSwitchApiKey && (
                            <button onClick={props.onSwitchApiKey} className="text-gray-500 hover:text-white transition-colors p-1" title="Switch API Key / Project">
                                🔑
                            </button>
                        )}
                        <div>
                            <h1 className="text-lg font-black tracking-tighter text-white">INFINITE <span className="text-blue-500">PRO</span></h1>
                            <p className="text-[9px] text-gray-500 tracking-[0.2em] uppercase">Director Studio 3.1</p>
                        </div>
                     </div>
                     <button onClick={() => props.onSetUiLang(props.uiLang === 'zh' ? 'en' : 'zh')} className="text-[10px] font-bold border border-[#333] px-2 py-1 rounded hover:bg-[#222] text-gray-400 hover:text-white transition-colors">
                        {props.uiLang.toUpperCase()}
                     </button>
                </div>
                
                {/* Auto Config Button */}
                <div className="p-4 pb-0">
                    {props.onRecommendConfig && (
                        <button 
                            onClick={props.onRecommendConfig}
                            disabled={props.loadingAction === 'recommend'}
                            className="w-full py-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-200 hover:text-white hover:border-purple-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.15)] disabled:opacity-50"
                        >
                            {props.loadingAction === 'recommend' ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <span>⚡</span>
                            )}
                             AI 推荐配置 (Auto Config)
                        </button>
                    )}
                </div>
                
                {/* Asset Tabs */}
                <div className="flex border-b border-[#2a2a2a] mt-4">
                    <button onClick={() => setActiveTab('cast')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'cast' ? 'text-white bg-[#1a1a1a] border-b-2 border-blue-500' : 'text-gray-600 hover:bg-[#111]'}`}>{t.cast_hero_title.split(' ')[0]}</button>
                    <button onClick={() => setActiveTab('props')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'props' ? 'text-white bg-[#1a1a1a] border-b-2 border-blue-500' : 'text-gray-600 hover:bg-[#111]'}`}>{t.props_title.split(' ')[0]}</button>
                    <button onClick={() => setActiveTab('loc')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'loc' ? 'text-white bg-[#1a1a1a] border-b-2 border-blue-500' : 'text-gray-600 hover:bg-[#111]'}`}>{t.locations_title.split(' ')[0]}</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {/* CAST TAB */}
                    {activeTab === 'cast' && (
                        <>
                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.cast_hero_title}</h3>
                                    <span className="text-[9px] text-gray-600">{props.heroes.length}/{MAX_HEROES}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     {Array.from({ length: Math.min(MAX_HEROES, props.heroes.length + 1) }).map((_, i) => (
                                        <AvatarSlot 
                                            key={`h-${i}`} 
                                            label={`Hero ${i+1}`} 
                                            imgBase64={props.heroes[i]?.base64}
                                            name={props.heroes[i]?.name}
                                            isHero 
                                            onAdd={(f, n) => props.onAddPersona('hero', f, n)} 
                                            onRemove={() => props.heroes[i] && props.onRemovePersona('hero', props.heroes[i].id)}
                                            onNameChange={(n) => props.heroes[i] && props.onUpdatePersonaName('hero', props.heroes[i].id, n)}
                                        />
                                     ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.cast_support_title}</h3>
                                    <span className="text-[9px] text-gray-600">{props.supports.length}/{MAX_SUPPORTS}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     {Array.from({ length: Math.min(MAX_SUPPORTS, props.supports.length + 1) }).map((_, i) => (
                                        <AvatarSlot 
                                            key={`s-${i}`} 
                                            label={`Sup ${i+1}`} 
                                            imgBase64={props.supports[i]?.base64}
                                            name={props.supports[i]?.name}
                                            onAdd={(f, n) => props.onAddPersona('support', f, n)} 
                                            onRemove={() => props.supports[i] && props.onRemovePersona('support', props.supports[i].id)} 
                                            onNameChange={(n) => props.supports[i] && props.onUpdatePersonaName('support', props.supports[i].id, n)}
                                        />
                                     ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* PROPS TAB */}
                    {activeTab === 'props' && (
                        <div>
                             <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.props_title}</h3>
                                <span className="text-[9px] text-gray-600">{props.items.length}/{MAX_ITEMS}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: Math.min(MAX_ITEMS, props.items.length + 1) }).map((_, i) => (
                                   <AvatarSlot 
                                       key={`item-${i}`} 
                                       label={`Item ${i+1}`} 
                                       imgBase64={props.items[i]?.base64}
                                       name={props.items[i]?.name}
                                       onAdd={(f, n) => props.onAddItem(f, n)} 
                                       onRemove={() => props.items[i] && props.onRemoveItem(props.items[i].id)} 
                                   />
                                ))}
                           </div>
                        </div>
                    )}

                    {/* LOCATIONS TAB */}
                    {activeTab === 'loc' && (
                        <div>
                             <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.locations_title}</h3>
                                <span className="text-[9px] text-gray-600">{props.locations.length}/{MAX_LOCS}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: Math.min(MAX_LOCS, props.locations.length + 1) }).map((_, i) => (
                                   <AvatarSlot 
                                       key={`loc-${i}`} 
                                       label={`Loc ${i+1}`} 
                                       imgBase64={props.locations[i]?.base64}
                                       name={props.locations[i]?.name}
                                       onAdd={(f, n) => props.onAddLocation(f, n)} 
                                       onRemove={() => props.locations[i] && props.onRemoveLocation(props.locations[i].id)} 
                                   />
                                ))}
                           </div>
                        </div>
                    )}

                    {/* PRESETS */}
                    <div className="pt-6 border-t border-[#2a2a2a]">
                         <div className="flex items-center justify-between mb-3 px-1">
                             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.presets_title}</h3>
                         </div>
                         <div className="space-y-2">
                             {presets.map(p => (
                                 <div key={p.id} onClick={() => loadPreset(p)} className="group flex items-center justify-between p-2.5 bg-[#121212] border border-[#222] rounded hover:border-blue-500/50 hover:bg-[#181818] cursor-pointer transition-all">
                                     <div className="overflow-hidden">
                                         <p className="text-xs font-bold text-gray-300 group-hover:text-blue-400 truncate">{p.name}</p>
                                         <p className="text-[9px] text-gray-600 truncate">{p.genre}</p>
                                     </div>
                                     <button onClick={(e) => deletePreset(p.id, e)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 px-1 transition-opacity">×</button>
                                 </div>
                             ))}
                             {presets.length === 0 && <p className="text-[10px] text-gray-700 italic text-center py-2">No presets saved</p>}
                         </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONFIGURATION */}
            <div className="flex-1 flex flex-col bg-[#050505] relative h-full">
                
                {/* TOP BAR */}
                <div className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6 md:px-10 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-20">
                     <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">{t.setting_title}</h2>
                     
                     <div className="flex items-center gap-4">
                         {/* SAVE PRESET */}
                         <div className="relative">
                             <button 
                                onClick={() => setShowPresetSave(!showPresetSave)} 
                                className="w-8 h-8 rounded hover:bg-[#222] flex items-center justify-center text-yellow-500/80 hover:text-yellow-400 transition-colors"
                                title={t.save_preset}
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                             </button>
                             {showPresetSave && (
                                 <div className="absolute top-10 right-0 w-64 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                     <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Name Preset</label>
                                     <div className="flex gap-2">
                                         <input 
                                            autoFocus
                                            value={newPresetName}
                                            onChange={e => setNewPresetName(e.target.value)}
                                            placeholder="My Epic Movie..."
                                            className="w-full bg-[#0f0f0f] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                         />
                                         <button onClick={savePreset} className="bg-blue-600 text-white px-3 rounded text-xs font-bold hover:bg-blue-500">Save</button>
                                     </div>
                                 </div>
                             )}
                         </div>
                         
                         {/* AGENT STATUS */}
                         <div className="hidden md:flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded border border-[#222]">
                             <span className={`w-1.5 h-1.5 rounded-full ${props.richMode ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                             <span className="text-[10px] font-bold text-gray-400">AGENT: {props.richMode ? 'ONLINE' : 'OFFLINE'}</span>
                         </div>
                     </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl mx-auto p-6 md:p-12 flex flex-col gap-10">
                        
                        {/* 1. SCRIPT / PREMISE (The Core) */}
                        <div className="flex flex-col gap-3">
                             <div className="flex justify-between items-end">
                                 <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{t.premise_label} <span className="text-gray-600 ml-1">// REQUIRED</span></label>
                                 {props.onInspirePremise && (
                                    <button 
                                        onClick={props.onInspirePremise}
                                        disabled={props.loadingAction === 'inspire_premise'}
                                        className="text-[10px] text-blue-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {props.loadingAction === 'inspire_premise' ? <span className="animate-spin text-xs">⏳</span> : '🎲 Inspire'}
                                    </button>
                                 )}
                             </div>
                             <textarea 
                                value={props.customPremise}
                                onChange={e => props.onPremiseChange(e.target.value)}
                                placeholder={t.premise_ph_custom}
                                className="w-full h-40 bg-[#121212] border border-[#333] rounded-xl p-5 text-base md:text-lg text-gray-200 placeholder-gray-600 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 outline-none transition-all resize-none shadow-inner font-light leading-relaxed"
                             />
                        </div>

                        {/* 2. CONFIGURATION GRID */}
                        <div className="grid grid-cols-1 gap-8">
                            
                            {/* SECTION A: GENRE & SPECS */}
                            <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 relative">
                                <span className="absolute -top-3 left-4 bg-[#050505] px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    I. Genre & Specifications
                                </span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Genre Selector */}
                                    <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{t.genre_label}</label>
                                        <div className="flex gap-2">
                                            <div className="flex-[0.6] min-w-0">
                                                <select 
                                                    value={activeCategory} 
                                                    onChange={(e) => handleCategoryChange(e.target.value)} 
                                                    className="cine-select"
                                                    style={{ maxWidth: '100%' }}
                                                >
                                                    {Object.keys(GENRE_CATEGORIES).map(cat => (
                                                        <option key={cat} value={cat} className="bg-black text-gray-200">{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <select 
                                                    value={props.selectedGenre} 
                                                    onChange={(e) => props.onGenreChange(e.target.value)}
                                                    className="cine-select font-bold border-blue-900/50"
                                                    style={{ maxWidth: '100%' }}
                                                >
                                                    {activeSubGenres.map(g => (
                                                        <option key={g} value={g} className="bg-black text-gray-200">{g.split(':')[1] || g}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {props.onInspireOptions && (
                                                <button 
                                                    onClick={() => props.onInspireOptions!('genre')}
                                                    disabled={props.loadingAction === 'inspire_genre'}
                                                    className="w-12 h-full flex-shrink-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/30 hover:to-purple-500/30 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                                                >
                                                    {props.loadingAction === 'inspire_genre' ? <span className="animate-spin text-xs">⏳</span> : '🎲'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Tech Specs */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{t.lang_label}</label>
                                            <select value={props.selectedLanguage} onChange={e => props.onLanguageChange(e.target.value)} className="cine-select" style={{ maxWidth: '100%' }}>
                                                {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-black text-gray-200">{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{t.pages_label}</label>
                                            <select value={props.selectedPageCount} onChange={e => props.onPageCountChange(Number(e.target.value))} className="cine-select" style={{ maxWidth: '100%' }}>
                                                {PAGE_COUNTS.map(c => <option key={c} value={c} className="bg-black text-gray-200">{c === 0 ? 'AI Auto' : `${c} Scenes`}</option>)}
                                            </select>
                                        </div>
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{t.mv_ratio_label}</label>
                                            <div className="flex bg-black p-1 rounded-lg border border-[#333] h-[42px]">
                                                <button onClick={() => props.onAspectRatioChange('16:9')} className={`flex-1 text-[10px] font-bold rounded transition-all ${props.selectedAspectRatio === '16:9' ? 'bg-[#333] text-white shadow' : 'text-gray-600 hover:text-gray-400'}`}>16:9</button>
                                                <button onClick={() => props.onAspectRatioChange('9:16')} className={`flex-1 text-[10px] font-bold rounded transition-all ${props.selectedAspectRatio === '9:16' ? 'bg-[#333] text-white shadow' : 'text-gray-600 hover:text-gray-400'}`}>9:16</button>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">{t.video_model_label || "VIDEO MODEL"}</label>
                                            <select 
                                                value={props.selectedVideoModel || "veo3.1-pro"} 
                                                onChange={e => props.onVideoModelChange && props.onVideoModelChange(e.target.value)} 
                                                className="cine-select" 
                                                style={{ maxWidth: '100%' }}
                                            >
                                                {VEO_MODELS.map(m => <option key={m.value} value={m.value} className="bg-black text-gray-200">{m.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION B: ARTISTIC DIRECTION */}
                            <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 relative">
                                <span className="absolute -top-3 left-4 bg-[#050505] px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    II. Artistic Direction (Mix & Match)
                                </span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    {/* 1. DIRECTOR */}
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Director</label>
                                            {props.onInspireOptions && (
                                                <button onClick={() => props.onInspireOptions!('director')} disabled={props.loadingAction === 'inspire_director'} className="text-[10px] text-blue-400 hover:text-white flex items-center gap-1 disabled:opacity-50">
                                                    {props.loadingAction === 'inspire_director' ? 'Loading...' : '🎲 Inspire'}
                                                </button>
                                            )}
                                        </div>
                                        <select 
                                            value={props.selectedDirector} 
                                            onChange={e => props.onDirectorChange(e.target.value)} 
                                            className="cine-select"
                                            style={{ maxWidth: '100%' }}
                                        >
                                            {activeDirectors.map(s => <option key={s} value={s} className="bg-black text-gray-200">{s}</option>)}
                                        </select>
                                    </div>

                                    {/* 2. ART STYLE */}
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Art Style</label>
                                            {props.onInspireOptions && (
                                                <button onClick={() => props.onInspireOptions!('art')} disabled={props.loadingAction === 'inspire_art'} className="text-[10px] text-purple-400 hover:text-white flex items-center gap-1 disabled:opacity-50">
                                                    {props.loadingAction === 'inspire_art' ? 'Loading...' : '🎲 Inspire'}
                                                </button>
                                            )}
                                        </div>
                                        <select 
                                            value={props.selectedArtStyle} 
                                            onChange={e => props.onArtStyleChange(e.target.value)} 
                                            className="cine-select"
                                            style={{ maxWidth: '100%' }}
                                        >
                                            {activeArts.map(s => <option key={s} value={s} className="bg-black text-gray-200">{s}</option>)}
                                        </select>
                                    </div>

                                    {/* 3. REF WORK */}
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Ref Work</label>
                                            {props.onInspireOptions && (
                                                <button onClick={() => props.onInspireOptions!('work')} disabled={props.loadingAction === 'inspire_work'} className="text-[10px] text-green-400 hover:text-white flex items-center gap-1 disabled:opacity-50">
                                                    {props.loadingAction === 'inspire_work' ? 'Loading...' : '🎲 Inspire'}
                                                </button>
                                            )}
                                        </div>
                                        <select 
                                            value={props.selectedRefWork} 
                                            onChange={e => props.onRefWorkChange(e.target.value)} 
                                            className="cine-select"
                                            style={{ maxWidth: '100%' }}
                                        >
                                            {activeWorks.map(s => <option key={s} value={s} className="bg-black text-gray-200">{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <input 
                                        type="text" 
                                        value={props.customStylePrompt} 
                                        onChange={e => props.onCustomStyleChange(e.target.value)} 
                                        placeholder={t.style_custom_ph} 
                                        className="w-full bg-transparent border-b border-dashed border-[#444] text-xs py-2 px-1 text-blue-300 placeholder-gray-600 outline-none focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LAUNCH BUTTON */}
                        <div className="pt-4">
                            <button 
                                onClick={props.onLaunch} 
                                disabled={props.heroes.length === 0 || props.isTransitioning}
                                className="w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
                            >
                                {props.isTransitioning ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        {t.launch_btn_loading}
                                    </>
                                ) : (
                                    <>
                                        <span>🎬</span> {t.launch_btn}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-600 mt-3 font-mono">
                                Powered by Gemini 3.0 Pro Agent & Veo 3.1
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}