import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileSearch, PenTool, Lightbulb, Clock, Zap } from 'lucide-react';
import { ExamConfig, Difficulty } from '../types';

// Fix for framer-motion type mismatches
const MotionDiv = motion.div as any;

interface LoadingScreenProps {
  config: ExamConfig | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ config }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Status Message Logic
  const getStatusMessage = () => {
    if (elapsedSeconds < 10) return "Analyzing text content...";
    if (elapsedSeconds < 25) return "Structuring key concepts...";
    if (elapsedSeconds < 45) return "Drafting exam questions...";
    return "Refining distractors & explanations...";
  };

  // Check if we need to show the "Heavy Load" warning
  // Trigger if > 45s AND (Hard difficulty OR Question Count > 30)
  const showDeepReasoningWarning = elapsedSeconds > 45 && config && (
    config.difficulty === Difficulty.HARD || 
    config.difficulty === Difficulty.MEDIUM || 
    config.questionCount > 30
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden font-inter">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s'}} />
        </div>

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 text-center max-w-md w-full mb-12"
      >
        <div className="relative w-32 h-32 mx-auto mb-10">
            {/* Outer Static Ring */}
            <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full" />
            
            {/* Spinning Ring */}
            <MotionDiv 
                className="absolute inset-0 border-[6px] border-t-yellow-400 border-r-yellow-400/50 border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Icon Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
                <MotionDiv
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Brain className="w-14 h-14 text-slate-900" />
                </MotionDiv>
            </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Generating Exam</h2>
        
        {/* Smart Status Message */}
        <div className="h-8 mb-8 relative w-full flex justify-center overflow-hidden">
            <AnimatePresence mode="wait">
                <MotionDiv 
                    key={getStatusMessage()}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="text-slate-400 font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2"
                >
                   {getStatusMessage()}
                </MotionDiv>
            </AnimatePresence>
        </div>

        {/* Deep Reasoning Warning - Premium Card Style */}
        <AnimatePresence>
            {showDeepReasoningWarning && (
                <MotionDiv
                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                    className="mb-8 overflow-hidden"
                >
                    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start gap-4 text-left shadow-lg shadow-amber-500/10 ring-1 ring-amber-100 max-w-sm mx-auto">
                        <div className="bg-amber-100 p-2 rounded-xl shrink-0">
                            <Clock className="w-5 h-5 text-amber-600 animate-[spin_4s_linear_infinite]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-amber-600" />
                                {config?.difficulty === Difficulty.HARD ? "High Complexity Mode" : "Deep Analysis"}
                            </p>
                            <p className="text-xs font-semibold leading-relaxed">
                                Generating complex logical chains requires extra processing time. Please hold on...
                            </p>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

      </MotionDiv>

        {/* Floating Background Icons */}
      <MotionDiv 
        className="absolute top-20 left-10 md:left-32 text-slate-200"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
          <FileSearch className="w-16 h-16 opacity-40" />
      </MotionDiv>
      <MotionDiv 
        className="absolute bottom-32 right-10 md:right-32 text-slate-200"
        animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
          <PenTool className="w-16 h-16 opacity-40" />
      </MotionDiv>
       <MotionDiv 
        className="absolute top-1/3 right-10 md:right-40 text-slate-200"
        animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
          <Lightbulb className="w-12 h-12 opacity-30" />
      </MotionDiv>
    </div>
  );
};

export default LoadingScreen;
