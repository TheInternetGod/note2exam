

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, FileText, Settings, User, X, ShieldAlert, ArrowLeft, AlertCircle } from 'lucide-react';
import { Difficulty, ExamConfig } from '../types';

const MotionDiv = motion.div as any;

const INAPPROPRIATE_KEYWORDS = [
    'naughty', 'dirty', 'sexual', 'porn', 'hate', 'kill', 'suicide', 'abuse', 'slur',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'nigger', 'cunt'
];

interface DashboardProps {
  onGenerate: (text: string, image: string | null, pdf: string | null, config: ExamConfig) => void;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerate, onBack }) => {
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [config, setConfig] = useState<ExamConfig>({
    difficulty: Difficulty.MEDIUM,
    durationMinutes: 30,
    questionCount: 10,
    candidateName: ''
  });

  const containsInappropriateContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 10MB Limit Check (10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        setSafetyError("File size exceeds 10MB limit. Please upload a smaller file for optimal performance.");
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        return;
      }

      setSafetyError(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (file.type === 'application/pdf') {
          setPdfFile(reader.result as string);
          setImageFile(null);
        } else {
          setImageFile(reader.result as string);
          setPdfFile(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFiles = () => {
    setImageFile(null);
    setPdfFile(null);
    setFileName(null);
    setSafetyError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = () => {
    setSafetyError(null);
    
    const isNameMissing = !config.candidateName.trim();
    const isContentMissing = !textInput && !imageFile && !pdfFile;

    if (isNameMissing && isContentMissing) {
        setModalMessage("Please enter study material and your name to proceed.");
        setShowErrorModal(true);
        return;
    }
    
    if (isNameMissing) {
        setModalMessage("Please enter your name to proceed.");
        setShowErrorModal(true);
        return;
    }

    if (isContentMissing) {
        setModalMessage("Please enter study material to proceed.");
        setShowErrorModal(true);
        return;
    }
    
    if (containsInappropriateContent(textInput) || (fileName && containsInappropriateContent(fileName))) {
        setSafetyError("Your input contains prohibited language. Please use academic content only.");
        return;
    }

    onGenerate(textInput, imageFile, pdfFile, config);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 flex flex-col items-center relative">
      <div className="max-w-6xl w-full flex flex-col flex-1 justify-center py-6">
        {/* Back Button Container */}
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all hover:shadow active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MotionDiv initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-4xl font-black font-manrope mb-2 text-slate-900 tracking-tight">Upload Material</h2>
              <p className="text-slate-500">Paste notes or upload study files. Professional content only.</p>
            </div>

            <div className="space-y-4">
              {safetyError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      {safetyError}
                  </div>
              )}
              <div className="glass-panel rounded-xl p-1 bg-white">
                <textarea
                  value={textInput}
                  onChange={(e) => { setTextInput(e.target.value); setSafetyError(null); }}
                  placeholder="Enter Topic, Images, PDF or Paste Your Notes Here..."
                  className="w-full h-48 bg-transparent border-none p-4 text-slate-700 placeholder-slate-400 focus:ring-0 focus:outline-none resize-none custom-scrollbar"
                />
              </div>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-yellow-400 transition-all group bg-white">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {fileName ? (
                      <div className="flex items-center gap-3 text-yellow-600 bg-yellow-50 py-2 px-4 rounded-lg border border-yellow-200">
                        {pdfFile ? <FileText className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                        <p className="text-sm font-bold truncate max-w-[200px]">{fileName}</p>
                        <X className="w-4 h-4 text-yellow-400 hover:text-red-500 ml-2" onClick={(e) => { e.preventDefault(); clearFiles(); }} />
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                        <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload study material</span></p>
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-xs text-slate-400">PDF, PNG, JPG</p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Max Size: 10 MB</span>
                        </div>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-8 flex flex-col justify-between h-full bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <Settings className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Exam Settings</h2>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Candidate Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                        <input 
                          type="text"
                          value={config.candidateName}
                          onChange={(e) => setConfig({...config, candidateName: e.target.value})}
                          placeholder="Enter full name"
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-yellow-400 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
                    {Object.values(Difficulty).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setConfig({ ...config, difficulty: diff })}
                        className={`py-2 rounded-md text-sm font-medium transition-all ${config.difficulty === diff ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                      <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                          <span className="text-sm font-bold text-yellow-600">{config.durationMinutes} mins</span>
                      </div>
                      <input type="range" min="5" max="90" step="5" value={config.durationMinutes} onChange={(e) => setConfig({...config, durationMinutes: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                  </div>
                  <div>
                      <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Count</label>
                          <span className="text-sm font-bold text-yellow-600">{config.questionCount} Questions</span>
                      </div>
                      <input type="range" min="5" max="60" step="5" value={config.questionCount} onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleStart} className="w-full mt-8 py-4 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-slate-900 font-bold text-lg shadow-lg shadow-yellow-400/20 transition-all active:scale-[0.98]">
              Start Exam
            </button>
          </MotionDiv>
        </div>
      </div>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowErrorModal(false)}
                    className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity"
                />
                
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                    className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-slate-200 ring-4 ring-slate-50 z-10"
                >
                    <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-5 mx-auto border border-yellow-100 shadow-sm">
                        <AlertCircle className="w-7 h-7 text-yellow-600" /> 
                    </div>
                    <h3 className="text-lg font-black text-slate-900 text-center mb-2 uppercase tracking-tight">Action Required</h3>
                    <p className="text-slate-500 text-center mb-8 text-sm font-medium leading-relaxed px-2">{modalMessage}</p>
                    <button
                        onClick={() => setShowErrorModal(false)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                    >
                        Okay, I understand
                    </button>
                </MotionDiv>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
