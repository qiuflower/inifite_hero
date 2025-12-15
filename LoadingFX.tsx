
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface LoadingFXProps {
    status?: string;
    progress?: number; 
    inline?: boolean;
}

export const LoadingFX: React.FC<LoadingFXProps> = ({ status = "Processing...", progress, inline = false }) => {
    return (
        <div className={`${inline ? 'absolute inset-0 bg-[#121212] z-10' : 'fixed inset-0 z-[999] bg-[#050505]'} flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500`}>
            {/* Cinematic Loader */}
            <div className={`relative ${inline ? 'w-12 h-12' : 'w-24 h-24'}`}>
                <div className="absolute inset-0 rounded-full border-2 border-[#1a1a1a]"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin"></div>
                <div className="absolute inset-4 rounded-full border-t-2 border-purple-600 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${inline ? 'text-[8px]' : 'text-xs'} font-mono text-blue-500 animate-pulse`}>{progress ? `${Math.round(progress)}%` : 'AI'}</span>
                </div>
            </div>
            
            {!inline && (
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-[0.2em] uppercase glow-text">Production In Progress</h3>
                    <p className="text-xs font-mono text-gray-500">{status}</p>
                </div>
            )}

            {/* Progress Bar */}
            {!inline && progress !== undefined && (
                <div className="w-64 h-1 bg-[#1a1a1a] rounded-full overflow-hidden mt-4">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" 
                        style={{width: `${progress}%`}}
                    ></div>
                </div>
            )}
        </div>
    );
};
