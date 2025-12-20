
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, CheckCircle, ShieldCheck, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { saveUserApiKey, getUserApiKey, removeUserApiKey } from '../services/geminiService';

const MotionDiv = motion.div as any;

interface ApiKeyPageProps {
  onBack: () => void;
}

const ApiKeyPage: React.FC<ApiKeyPageProps> = ({ onBack }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const existing = getUserApiKey();
    if (existing) {
      setApiKey(existing);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    // Multi-key validation: Split by comma, check if at least one is valid and all provided are valid format
    const keys = apiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keys.length === 0) {
        alert("Please enter at least one API Key.");
        return;
    }

    const allValid = keys.every(k => k.startsWith('AIza'));
    
    if (allValid) {
      saveUserApiKey(apiKey); // Save the raw comma-separated string
      setIsSaved(true);
    } else {
      alert("Invalid API Key format. All keys should start with 'AIza'.");
    }
  };

  const handleClear = () => {
    removeUserApiKey();
    setApiKey('');
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 flex flex-col items-center relative font-inter">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-green-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl w-full flex flex-col flex-1 relative z-10">
        {/* Header with Back Button */}
        <div className="mb-8 pt-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all hover:shadow active:scale-95"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 pb-16"
        >
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-2">
                    <Key className="w-10 h-10 text-slate-900" />
                </div>
                <h1 className="text-4xl font-black font-manrope text-slate-900 tracking-tight">
                    API Settings
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Manage your Gemini API keys. You can add multiple keys to bypass rate limits and ensure uninterrupted study sessions.
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/40">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Paste Your Gemini API Key(s)
                        </label>
                        {isSaved && (
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-wide">Active</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={apiKey}
                            onChange={(e) => { setApiKey(e.target.value); setIsSaved(false); }}
                            placeholder="AIzaSy...Key1, AIzaSy...Key2"
                            className={`w-full pl-5 pr-12 py-5 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:bg-white transition-all font-mono text-sm md:text-base tracking-wide ${
                            isSaved 
                            ? 'border-green-200 focus:border-green-400 text-green-700' 
                            : 'border-slate-100 focus:border-yellow-400 text-slate-900 placeholder-slate-300'
                            }`}
                        />
                        {isSaved && <CheckCircle className="absolute right-5 top-5 w-6 h-6 text-green-500" />}
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3">
                         <div className="flex-1 flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Keys are stored securely in your browser's local storage.
                            </p>
                        </div>
                        <div className="flex-1 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                             <Layers className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                             <p className="text-xs text-blue-600 font-medium leading-relaxed">
                                <strong>Pro Tip:</strong> Separate multiple keys with commas to enable auto-rotation if one limit is reached.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        {isSaved && (
                        <button 
                            onClick={handleClear}
                            className="px-6 py-4 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                        >
                            Remove Keys
                        </button>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={!apiKey}
                            className={`flex-1 py-4 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                                isSaved 
                                ? 'bg-green-600 text-white shadow-green-200 hover:bg-green-700' 
                                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                            }`}
                        >
                        {isSaved ? 'Update Keys' : (
                            <>
                            Save API Key(s) <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Guide Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                         How to get free keys
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3 items-start">
                             <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">1</span>
                             <p className="text-sm text-slate-600">
                                Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center">Google AI Studio <ExternalLink className="w-3 h-3 ml-1" /></a>
                             </p>
                        </li>
                        <li className="flex gap-3 items-start">
                             <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">2</span>
                             <p className="text-sm text-slate-600">Click “Get API key” and generate a key (if you don’t already have one).</p>
                        </li>
                        <li className="flex gap-3 items-start">
                             <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">3</span>
                             <p className="text-sm text-slate-600">Copy the API key, paste it here, and click Save.</p>
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Why use multiple keys?</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        Gemini's free tier has daily usage limits. By adding multiple keys (from different Google accounts), Note2Exam can automatically switch to the next key if the first one runs out.
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-bold">
                        Result: Zero downtime during your study marathons.
                    </p>
                </div>
            </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default ApiKeyPage;
