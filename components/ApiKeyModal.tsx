import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, CheckCircle, X, ExternalLink, ShieldCheck, AlertOctagon, ArrowRight, Loader2 } from 'lucide-react';
import { saveUserApiKey, getUserApiKey, removeUserApiKey, validateApiKey } from '../services/geminiService';

const MotionDiv = motion.div as any;

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isErrorTriggered?: boolean;
  isUserQuotaExceeded?: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, isErrorTriggered, isUserQuotaExceeded }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getUserApiKey();
      if (existing) {
        setApiKey(existing);
        setIsSaved(true);
      } else {
        setApiKey('');
        setIsSaved(false);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Multi-key validation
    const keys = apiKey.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keys.length === 0) {
        alert("Please enter at least one API Key.");
        return;
    }

    const allValidFormat = keys.every(k => k.startsWith('AIza'));

    if (!allValidFormat) {
      alert("Invalid API Key format. All keys should start with 'AIza'.");
      return;
    }

    setIsVerifying(true);
    const isValid = await validateApiKey(apiKey);
    setIsVerifying(false);

    if (isValid) {
      saveUserApiKey(apiKey);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      alert("Verification Failed: One or more provided keys are invalid. Please check for typos and try again.");
    }
  };

  const handleClear = () => {
    removeUserApiKey();
    setApiKey('');
    setIsSaved(false);
  };

  const getTitle = () => {
    if (isUserQuotaExceeded) return 'Quota Exceeded';
    if (isErrorTriggered) return 'System Overloaded';
    return 'API Settings';
  };

  const getSubtitle = () => {
    if (isUserQuotaExceeded) return 'Daily Limit Reached';
    if (isErrorTriggered) return 'Rate Limit Reached';
    return 'Add Key(s) to Continue';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
          />

          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className={`p-6 border-b border-slate-100 ${isErrorTriggered ? 'bg-red-50' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-sm ${isErrorTriggered ? 'bg-white text-red-600' : 'bg-white text-yellow-500'}`}>
                    {isErrorTriggered ? <AlertOctagon className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${isErrorTriggered ? 'text-red-900' : 'text-slate-900'} tracking-tight`}>
                      {getTitle()}
                    </h3>
                    <p className={`text-xs font-bold ${isErrorTriggered ? 'text-red-500' : 'text-slate-400'} uppercase tracking-wide`}>
                      {getSubtitle()}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {isErrorTriggered && (
                <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="font-bold mb-1 text-slate-900">Why am I seeing this?</p>
                  {isUserQuotaExceeded 
                    ? "Your current key(s) have reached their daily limit. To continue, please add a new key below."
                    : "The system key is busy. Add your own keys (separated by commas) to bypass the queue immediately."
                  }
                </div>
              )}

              {/* Input Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Paste Gemini API Key(s)
                  </label>
                  {isSaved && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-md"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wide">Active & Secured</span>
                    </motion.div>
                  )}
                </div>
                
                <div className="relative group">
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setIsSaved(false); }}
                    placeholder="AIzaSy...Key1, AIzaSy...Key2"
                    className={`w-full pl-4 pr-10 py-4 bg-slate-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all font-mono text-sm tracking-wide ${
                      isSaved 
                      ? 'border-green-200 focus:border-green-400 text-green-700' 
                      : 'border-slate-100 focus:border-yellow-400 text-slate-900 placeholder-slate-300'
                    }`}
                  />
                  {isSaved && <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-500" />}
                </div>
                
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium px-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your keys are stored locally. Use commas to add multiple keys for rotation.
                </p>
              </div>

              {/* Enhanced Guide Section */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"/> Quick Guide
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4 group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 group-hover:border-yellow-400 group-hover:text-yellow-600 transition-colors">1</span>
                    <p className="text-xs text-slate-600 font-medium leading-6">
                      Get key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5 mx-1">Google AI Studio <ExternalLink className="w-2.5 h-2.5" /></a>
                    </p>
                  </div>
                  <div className="flex gap-4 group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400 group-hover:border-yellow-400 group-hover:text-yellow-600 transition-colors">2</span>
                    <p className="text-xs text-slate-600 font-medium leading-6">
                      Paste multiple keys separated by commas (<code>,</code>) to enable automatic switching if one key hits a limit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {isSaved && (
                  <button 
                    onClick={handleClear}
                    className="flex-1 py-3.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Remove Keys
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={!apiKey || isVerifying}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isSaved 
                    ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600 ring-2 ring-offset-2 ring-green-500' 
                    : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                  }`}
                >
                  {isVerifying ? (
                    <>Verifying... <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : isSaved ? 'Settings Saved' : (
                    <>
                      Save API Key(s) <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeyModal;
