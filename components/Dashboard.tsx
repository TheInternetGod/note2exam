import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, FileText, Settings, User, X, ShieldAlert, ArrowLeft, AlertCircle, Layers, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Difficulty, ExamConfig } from '../types';

const MotionDiv = motion.div as any;

const INAPPROPRIATE_KEYWORDS = [
    'naughty', 'dirty', 'sexual', 'porn', 'hate', 'kill', 'suicide', 'abuse', 'slur',
    'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'nigger', 'cunt'
];

interface DashboardProps {
  onGenerate: (text: string, images: string[], pdf: string | null, config: ExamConfig) => void;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerate, onBack }) => {
  const [textInput, setTextInput] = useState('');
  const [imageFiles, setImageFiles] = useState<string[]>([]); 
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state for loading animation
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSafetyError(null);
    setIsProcessing(true); // Start loading animation

    // Artificial delay to allow the "Uploading" animation to be seen and feel professional
    await new Promise(resolve => setTimeout(resolve, 1200));

    const fileList: File[] = Array.from(files);

    // Check for PDF (Single PDF priority)
    const pdf = fileList.find(f => f.type === 'application/pdf');
    
    if (pdf) {
        if (pdf.size > 10 * 1024 * 1024) {
            setSafetyError("PDF size exceeds 10MB limit.");
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setPdfFile(reader.result as string);
            setImageFiles([]);
            setFileName(pdf.name);
            setIsProcessing(false); // Stop loading
        };
        reader.readAsDataURL(pdf);
        return;
    }

    // Handle Multiple Images
    const images = fileList.filter(f => f.type.startsWith('image/'));
    if (images.length > 0) {
        // Size validation
        const oversized = images.find(f => f.size > 10 * 1024 * 1024);
        if (oversized) {
            setSafetyError(`File ${oversized.name} exceeds 10MB limit.`);
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const promises = images.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            const results = await Promise.all(promises);
            setImageFiles(results);
            setPdfFile(null);
            setFileName(images.length === 1 ? images[0].name : `${images.length} Images Selected`);
            setIsProcessing(false); // Stop loading
        } catch (err) {
            setSafetyError("Failed to process images. Please try again.");
            setIsProcessing(false);
        }
    } else {
        setIsProcessing(false);
    }
  };

  const clearFiles = () => {
    setImageFiles([]);
    setPdfFile(null);
    setFileName(null);
    setSafetyError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStart = () => {
    setSafetyError(null);
    
    const isNameMissing = !config.candidateName.trim();
    const isContentMissing = !textInput && imageFiles.length === 0 && !pdfFile;

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

    onGenerate(textInput, imageFiles, pdfFile, config);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 flex flex-col items-center relative">
      <div className="max-w-6xl w-full flex flex-col flex-1 justify-center py-6">
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
              <p className="text-slate-500">Paste notes or upload study files (PDF or Multiple Images).</p>
            </div>

            <div className="space-y-4">
              {safetyError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      {safetyError}
                  </div>
              )}
              <div className="glass-panel rounded-xl p-1 bg-white transition-all duration-200 focus-within:ring-1 focus-within:ring-yellow-400 focus-within:border-yellow-400">
                <textarea
                  value={textInput}
                  onChange={(e) => { setTextInput(e.target.value); setSafetyError(null); }}
                  placeholder="Enter Topic, Text Content, or Paste Your Notes Here..."
                  className="w-full h-48 bg-transparent border-none p-4 text-slate-700 placeholder-slate-400 focus:ring-0 focus:outline-none resize-none custom-scrollbar"
                />
              </div>
              
              {/* Professional File Dropzone */}
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all relative overflow-hidden group ${
                    fileName 
                    ? 'border-green-300 bg-green-50/30' 
                    : isProcessing 
                        ? 'border-blue-300 bg-blue-50/30'
                        : 'border-slate-300 hover:bg-slate-50 hover:border-yellow-400 bg-white'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full h-full">
                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <MotionDiv 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-blue-600">Processing Files...</p>
                                    <p className="text-xs text-blue-400">Optimizing content for analysis</p>
                                </div>
                            </MotionDiv>
                        ) : fileName ? (
                             <MotionDiv 
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center gap-3 w-full px-4"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-sm font-bold text-slate-800 mb-1">Upload Successful</p>
                                    <div className="flex items-center justify-center gap-2 text-slate-500 bg-white/60 py-1 px-3 rounded-full border border-green-200/50 mx-auto w-fit max-w-[90%]">
                                        {pdfFile ? <FileText className="w-3.5 h-3.5 shrink-0" /> : (imageFiles.length > 1 ? <Layers className="w-3.5 h-3.5 shrink-0" /> : <ImageIcon className="w-3.5 h-3.5 shrink-0" />)}
                                        <p className="text-xs font-medium truncate">{fileName}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearFiles(); }}
                                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Remove file"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </MotionDiv>
                        ) : (
                            <MotionDiv 
                                key="upload"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md">
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-yellow-500 transition-colors" />
                                </div>
                                <p className="mb-2 text-sm text-slate-500"><span className="font-bold text-slate-700">Click to upload</span> or drag and drop</p>
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-xs text-slate-400 font-medium">PDF or Multiple Images</p>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Max 10MB/File</span>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf" 
                    multiple 
                    onChange={handleFileChange} 
                    disabled={isProcessing}
                  />
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
