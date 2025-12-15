
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { LYRIC_LANGUAGES } from './types';

interface SunoDialogProps {
    onConfirm: (key: string, baseUrl: string, params: { title: string, tags: string, lyrics: string, instrumental: boolean }) => void;
    onCancel: () => void;
    onGetInspiration: (language: string) => Promise<{ title: string, tags: string, lyrics: string }>;
}

export const SunoDialog: React.FC<SunoDialogProps> = ({ onConfirm, onCancel, onGetInspiration }) => {
    // Default Key from user request
    const DEFAULT_KEY = "sk-pjW8vUsxWkei5pCC2BaXxhhAstsho4bv7zIZDtFSClhozSqt"; 
    
    // Updated default URL as requested
    const [key, setKey] = useState(DEFAULT_KEY);
    //const [baseUrl, setBaseUrl] = useState('https://api.sunoapi.org'); 
    const [baseUrl, setBaseUrl] = useState('https://ai.t8star.cn'); 
    
    // Music Params
    const [title, setTitle] = useState('');
    const [style, setStyle] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [isInstrumental, setIsInstrumental] = useState(false);
    const [isBrainstorming, setIsBrainstorming] = useState(false);
    const [lyricLang, setLyricLang] = useState('zh');

    useEffect(() => {
        const storedKey = localStorage.getItem('suno_api_key');
        const storedUrl = localStorage.getItem('suno_base_url');
        
        if (storedKey) setKey(storedKey);
        else setKey(DEFAULT_KEY);
        
        if (storedUrl) setBaseUrl(storedUrl);
    }, []);

    const handleBrainstorm = async () => {
        setIsBrainstorming(true);
        try {
            const inspiration = await onGetInspiration(lyricLang);
            setTitle(inspiration.title);
            setStyle(inspiration.tags);
            setLyrics(inspiration.lyrics);
            // If AI generates lyrics, assume we don't want instrumental by default
            if (inspiration.lyrics && inspiration.lyrics.length > 50) {
                setIsInstrumental(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsBrainstorming(false);
        }
    };

    const handleConfirm = () => {
        localStorage.setItem('suno_api_key', key);
        localStorage.setItem('suno_base_url', baseUrl);
        onConfirm(key, baseUrl, {
            title,
            tags: style,
            lyrics: isInstrumental ? "" : lyrics, // Clear lyrics if instrumental selected to avoid API conflict
            instrumental: isInstrumental
        });
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-sans text-gray-200">
            <div className="max-w-lg w-full bg-[#121212] border border-[#333] rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-[#222] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(124,58,237,0.5)]">🎵</div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Music Generator</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="text-xs text-gray-500">V5 Support (Active)</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-2xl">×</button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                    
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                         <span className="text-sm font-bold text-gray-300">自定义模式 (Custom Mode)</span>
                         <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                         </div>
                    </div>

                    {/* API Settings (Collapsible or mini) */}
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                        <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-purple-400 font-bold mb-1">🔌 API Configuration (Server)</summary>
                            <div className="mt-2 space-y-3 pl-1">
                                <div>
                                    <label className="block mb-1">API Key</label>
                                    <input type="text" value={key} onChange={e => setKey(e.target.value)} className="w-full bg-[#0f0f0f] border border-[#333] rounded px-2 py-1 text-gray-300 focus:outline-none" placeholder="API Key" />
                                </div>
                                <div>
                                    <label className="block mb-1">Base URL</label>
                                    <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="w-full bg-[#0f0f0f] border border-[#333] rounded px-2 py-1 text-gray-300 focus:outline-none" placeholder="https://..." />
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Brainstorming Section */}
                    <div className="bg-[#1a1a1a] p-3 rounded border border-[#333] flex flex-col gap-3">
                        <label className="text-xs font-bold text-gray-500">AI 创意助手 (Brainstorm)</label>
                        <div className="flex gap-2">
                            <select 
                                value={lyricLang} 
                                onChange={(e) => setLyricLang(e.target.value)}
                                className="bg-[#0f0f0f] border border-[#333] text-gray-300 text-xs rounded px-2 focus:outline-none"
                            >
                                {LYRIC_LANGUAGES.map(l => (
                                    <option key={l.code} value={l.code}>{l.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleBrainstorm}
                                disabled={isBrainstorming}
                                className="flex-grow py-2 text-xs font-bold text-purple-400 hover:text-purple-300 bg-[#0f0f0f] rounded border border-[#333] flex items-center justify-center gap-2 hover:bg-[#222] transition-all"
                            >
                                {isBrainstorming ? <span className="animate-spin">✨</span> : '✨'} 
                                {isBrainstorming ? 'Composing...' : '生成大师级歌词 (Generate Lyrics)'}
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">标题 (Title)</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter song title..."
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-sm"
                        />
                    </div>

                    {/* Style */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">音乐风格 (Style)</label>
                        <textarea 
                            value={style}
                            onChange={e => setStyle(e.target.value)}
                            placeholder="e.g. Pop, Upbeat, Female Vocals, 120bpm..."
                            className="w-full h-20 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-sm resize-none"
                        />
                        <div className="text-right text-[10px] text-gray-600 mt-1">{style.length}/1000</div>
                    </div>

                    {/* Instrumental Toggle */}
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-bold text-gray-400">纯音乐 (Instrumental)</label>
                         <button 
                            onClick={() => setIsInstrumental(!isInstrumental)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${isInstrumental ? 'bg-purple-600' : 'bg-[#333]'}`}
                         >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isInstrumental ? 'left-7' : 'left-1'}`}></div>
                         </button>
                    </div>

                    {/* Lyrics */}
                    {!isInstrumental && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-500">歌词 (Lyrics)</label>
                                <span className="text-[10px] text-gray-600">{lyrics.length}/5000</span>
                            </div>
                            <textarea 
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                                placeholder="[Verse]&#10;Input your lyrics here..."
                                className="w-full h-48 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-sm resize-none font-mono custom-scrollbar"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#222] bg-[#0f0f0f] rounded-b-2xl">
                    <button 
                        onClick={handleConfirm} 
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98] text-lg tracking-wide"
                    >
                        生成音乐 (Generate Music - V5)
                    </button>
                </div>

            </div>
        </div>
    );
}
