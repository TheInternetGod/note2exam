
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ArrowRight, X } from 'lucide-react';

const MotionDiv = motion.div as any;

interface QuotaErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings: () => void;
  isUserQuota: boolean;
}

const QuotaErrorModal: React.FC<QuotaErrorModalProps> = ({ isOpen, onClose, onGoToSettings, isUserQuota }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
          />

          <MotionDiv 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
          >
            <div className="bg-red-50 p-6 flex justify-center border-b border-red-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500">
                    <AlertOctagon className="w-8 h-8" />
                </div>
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 text-center space-y-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        {isUserQuota ? "Quota Exceeded" : "System Overloaded"}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {isUserQuota 
                            ? "Your personal API key has reached its limit for today. To continue immediately, please switch to a new key from a different Google account."
                            : "The free system key is currently busy due to high traffic. To continue immediately, please add your own free Gemini API in the API settings."
                        }
                    </p>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => { onClose(); onGoToSettings(); }}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Go to API settings <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotaErrorModal;
