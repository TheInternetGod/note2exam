
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Zap, ArrowRight, CheckCircle, ShieldCheck, Key, Menu, X, Info, Heart, Globe, Mail } from 'lucide-react';

// Define Motion components to avoid TypeScript/Runtime type issues
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// Module-level variable to track popup state across component remounts.
// This resets on page refresh (browser reload), but persists when navigating views in the SPA.
let hasShownPopupSession = false;

interface LandingPageProps {
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenSettings, onOpenAbout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLovePopup, setShowLovePopup] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Only trigger popup if it hasn't been shown in this session
    if (!hasShownPopupSession) {
        const timer = setTimeout(() => {
            setShowLovePopup(true);
            hasShownPopupSession = true;
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] overflow-hidden relative text-slate-900 font-inter">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-200/60 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-30 px-6 md:px-8 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        {/* Logo Section - Left */}
        <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2.5 rounded-xl shadow-lg shadow-yellow-200">
                <Brain className="w-7 h-7 text-slate-900" />
            </div>
            <span className="text-2xl font-black font-manrope tracking-tight text-slate-900 uppercase hidden sm:block">Note2Exam</span>
        </div>

        {/* Professional Three Dash Navigation - Right */}
        <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 -mr-2.5 text-slate-700 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all border border-transparent hover:border-slate-200 active:scale-95 group"
            aria-label="Menu"
        >
            <Menu className="w-7 h-7 stroke-[2.5] group-hover:scale-110 transition-transform" />
        </button>
      </nav>

      {/* Side Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <MotionDiv
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            {/* Drawer - Sliding from Right */}
            <MotionDiv
              key="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col border-l border-slate-100"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-lg font-black font-manrope uppercase text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    Menu
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <button 
                    onClick={() => { setIsMenuOpen(false); onOpenSettings(); }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all group"
                >
                    <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-yellow-100 group-hover:text-yellow-700 transition-colors">
                        <Key className="w-5 h-5" />
                    </div>
                    API Settings
                </button>

                <button 
                    onClick={() => { setIsMenuOpen(false); onOpenAbout(); }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold transition-all group"
                >
                    <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        <Info className="w-5 h-5" />
                    </div>
                    About Note2Exam
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium text-center">
                    Note2Exam v1.0.0
                </p>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-grow flex flex-col justify-center items-center text-center px-4 md:px-6">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-black mb-10 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Safe & Academic Verified
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-manrope text-slate-900 leading-[1.1] mb-8 tracking-tighter">
            Turn your notes into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
              Exam-Ready Tests
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Note2Exam uses advanced AI to instantly convert study materials into professional mock tests. Precise, secure, and built for students.
          </p>

          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="px-10 py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-[2rem] font-black text-xl shadow-2xl shadow-yellow-400/30 flex items-center gap-3 group transition-all"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </MotionButton>
          </div>
        </MotionDiv>

        <MotionDiv 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full"
        >
          {[
            { icon: BookOpen, title: "Smart Analysis", desc: "Our AI processes your PDFs, text, and images with 99% accuracy." },
            { icon: Zap, title: "Exam Simulator", desc: "Timed CBT interface that mimics professional certification environments." },
            { icon: CheckCircle, title: "Detailed Insights", desc: "Detailed rationales for every question to boost your understanding." }
          ].map((feature, idx) => (
            <div key={idx} className="glass-panel p-10 rounded-[2.5rem] text-left hover:bg-white transition-all cursor-default bg-white/60 group hover:-translate-y-2">
              <div className="bg-yellow-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-yellow-400 transition-colors">
                <feature.icon className="w-8 h-8 text-yellow-600 group-hover:text-slate-900" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-base font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </MotionDiv>
      </main>
      
      <footer className="relative z-10 py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          <p className="text-slate-400 text-sm font-bold">&copy; {new Date().getFullYear()} Note2Exam. Professional Academic Excellence.</p>
          
          <div className="px-6 py-3 rounded-2xl bg-slate-100/50 border border-slate-200/60 backdrop-blur-sm">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
              <span className="font-bold text-slate-700">Disclaimer:</span> Note2Exam uses AI for educational assistance. Always verify facts with your primary textbooks. Inappropriate content is strictly prohibited.
            </p>
          </div>
        </div>
      </footer>

      {/* MODERN "MADE WITH LOVE" POPUP - OPTIMIZED */}
      <AnimatePresence>
        {showLovePopup && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop - Reduced blur for better performance */}
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setShowLovePopup(false)}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                />

                {/* Main Card - Reduced size and optimized spring physics */}
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full max-w-[320px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Decorative Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] left-[20%] w-[80%] h-[60%] bg-red-50/80 rounded-full blur-[40px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-yellow-50/80 rounded-full blur-[40px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center p-8 text-center">
                        {/* Close Button */}
                        <button 
                            onClick={() => setShowLovePopup(false)}
                            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white text-slate-400 hover:text-slate-900 rounded-full transition-all backdrop-blur-sm border border-transparent hover:border-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Heart Animation Container */}
                        <div className="relative mb-6 mt-2">
                            <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-40 animate-pulse" />
                            <div className="w-20 h-20 bg-gradient-to-tr from-white to-red-50 rounded-full flex items-center justify-center shadow-lg shadow-red-100/50 border border-white relative ring-4 ring-white">
                                <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">
                            Note2Exam
                        </h3>
                        
                        <div className="space-y-0.5 mb-6">
                            <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
                                Made with Love
                            </h2>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 leading-none tracking-tight pb-1">
                                For Students.
                            </h2>
                        </div>

                        <p className="text-slate-500 font-medium mb-6 leading-relaxed max-w-[240px] text-xs">
                          We built this to help you ace your exams without the stress. Happy studying!
                        </p>

                        <button 
                            onClick={() => setShowLovePopup(false)}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            Let's Start 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-yellow-400" />
                        </button>
                    </div>
                </MotionDiv>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
