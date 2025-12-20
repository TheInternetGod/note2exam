import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileSearch, PenTool } from 'lucide-react';

// Fix for framer-motion type mismatches
const MotionDiv = motion.div as any;

const LoadingScreen: React.FC = () => {
  const [loadingText, setLoadingText] = useState("Analyzing text content...");
  
  useEffect(() => {
    const messages = [
        "Analyzing text content...",
        "Structuring questions...",
        "Drafting explanations...",
        "Finalizing exam pattern..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingText(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s'}} />
        </div>

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-8">
            <MotionDiv 
                className="absolute inset-0 border-4 border-slate-200 rounded-full"
            />
            <MotionDiv 
                className="absolute inset-0 border-4 border-t-yellow-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-10 h-10 text-slate-700" />
            </div>
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-4">Generating Exam</h2>
        
        <div className="h-8 relative w-64 mx-auto flex justify-center">
            <AnimatePresence mode="wait">
                <MotionDiv 
                    key={loadingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-slate-500 font-medium"
                >
                    {loadingText}
                </MotionDiv>
            </AnimatePresence>
        </div>
      </MotionDiv>

        {/* Floating Icons Animation */}
      <MotionDiv 
        className="absolute top-20 left-20 text-slate-300 opacity-50"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
          <FileSearch className="w-16 h-16" />
      </MotionDiv>
      <MotionDiv 
        className="absolute bottom-20 right-20 text-slate-300 opacity-50"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
          <PenTool className="w-16 h-16" />
      </MotionDiv>
    </div>
  );
};

export default LoadingScreen;