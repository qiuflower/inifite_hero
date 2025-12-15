
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="relative max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 flex flex-col items-center text-center animate-pulse-apple">
        
        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">
           🔑
        </div>

        <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">
          API Key Required
        </h2>
        
        <p className="text-sm text-[#86868b] leading-relaxed mb-6">
          To access the infinite multiverse and generate content, a valid paid API key for Gemini 3 Pro is required.
        </p>

        <div className="bg-[#F5F5F7] rounded-xl p-4 mb-6 w-full text-left">
             <p className="text-xs text-[#1d1d1f] font-medium mb-1">Billing Required</p>
             <p className="text-xs text-[#86868b]">
                Gemini 3 Pro Image Preview requires a project with billing enabled.
                <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline">View documentation &rarr;</a>
             </p>
        </div>

        <button 
          onClick={onContinue}
          className="w-full bg-[#0071e3] text-white font-medium text-base py-3 rounded-xl hover:bg-[#0077ed] active:scale-[0.98] transition-all"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};
