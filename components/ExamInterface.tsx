
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, X, LayoutGrid, CheckCircle, User, Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';
import { GeneratedExam, ExamResult } from '../types';

const PROGRESS_KEY = 'note2exam_exam_progress';
const MotionDiv = motion.div as any;

interface ExamInterfaceProps {
  exam: GeneratedExam;
  onComplete: (result: ExamResult) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ exam, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.examTitle === exam.title ? (parsed.currentQuestionIndex || 0) : 0;
    }
    return 0;
  });

  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.examTitle === exam.title ? (parsed.answers || {}) : {};
    }
    return {};
  });

  const [flagged, setFlagged] = useState<number[]>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.examTitle === exam.title ? (parsed.flagged || []) : [];
    }
    return [];
  });

  const [visited, setVisited] = useState<number[]>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.examTitle === exam.title ? (parsed.visited || [exam.questions[0].id]) : [exam.questions[0].id];
    }
    return [exam.questions[0].id];
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.examTitle === exam.title ? (parsed.timeLeft || exam.config.durationMinutes * 60) : exam.config.durationMinutes * 60;
    }
    return exam.config.durationMinutes * 60;
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  useEffect(() => {
    if (!visited.includes(currentQuestion.id)) {
      setVisited(prev => [...prev, currentQuestion.id]);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      examTitle: exam.title,
      currentQuestionIndex,
      answers,
      flagged,
      timeLeft,
      visited
    }));
  }, [currentQuestionIndex, answers, flagged, timeLeft, visited, exam.title]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) handleOptionSelect(parseInt(e.key) - 1);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'Enter') handleNext();
      if (e.key.toLowerCase() === 'm') handleMarkForReview();
      if (e.key.toLowerCase() === 'c') clearResponse();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, answers]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleOptionSelect = (idx: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: idx });
  };

  const clearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleMarkForReview = () => {
    if (!flagged.includes(currentQuestion.id)) {
      setFlagged([...flagged, currentQuestion.id]);
    }
    handleNext();
  };

  const handleSubmit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    localStorage.removeItem(PROGRESS_KEY);
    let correct = 0, wrong = 0, skipped = 0;
    exam.questions.forEach(q => {
      const ans = answers[q.id];
      if (ans === undefined) skipped++;
      else if (ans === q.correctAnswerIndex) correct++;
      else wrong++;
    });
    onComplete({
      score: correct - (wrong * 0.25),
      totalQuestions: exam.questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skippedAnswers: skipped,
      timeTakenSeconds: (exam.config.durationMinutes * 60) - timeLeft,
      answers
    });
  };

  const stats = (function getStats() {
    let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;
    exam.questions.forEach(q => {
      const hasAns = answers[q.id] !== undefined;
      const isFlag = flagged.includes(q.id);
      const isVisited = visited.includes(q.id);
      if (hasAns) answered++;
      else if (isFlag) marked++;
      else if (isVisited) notAnswered++;
      else notVisited++;
    });
    return { answered, notAnswered, marked, notVisited };
  })();

  const paletteDrawerContent = (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-300 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center border border-slate-300">
            <User className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Candidate</p>
            <p className="text-sm font-bold text-slate-800 leading-none">{exam.config.candidateName || "User"}</p>
          </div>
        </div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Question Palette</h3>
        <div className="grid grid-cols-2 gap-y-2 gap-x-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-300 rounded" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-600 rounded" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Marked</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {exam.questions.map((q, idx) => {
            const isAns = answers[q.id] !== undefined;
            const isFlag = flagged.includes(q.id);
            const isVis = visited.includes(q.id);
            const isCurr = idx === currentQuestionIndex;

            let cls = "";
            if (isFlag) cls = "bg-violet-600 text-white border-violet-800";
            else if (isAns) cls = "bg-green-500 text-white border-green-700";
            else if (isVis) cls = "bg-red-500 text-white border-red-700";
            else cls = "bg-slate-200 text-slate-400 border-slate-300";
            
            if (isCurr) cls += " ring-2 ring-blue-500 ring-offset-1";

            return (
              <button 
                key={q.id} 
                onClick={() => { setCurrentQuestionIndex(idx); setIsPaletteOpen(false); }}
                className={`h-9 w-full rounded font-bold text-xs transition-all flex items-center justify-center border-b-2 ${cls}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-300 bg-white">
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded transition-all shadow-md"
        >
          Submit Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#f1f5f9] flex flex-col overflow-hidden select-none font-sans text-slate-900">
      {/* CBT Banking Header */}
      <header className="h-14 bg-white border-b border-slate-300 flex justify-between items-center px-4 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPaletteOpen(true)}
            className="lg:hidden p-1.5 text-slate-600 border border-slate-200 rounded hover:bg-slate-50 active:bg-slate-100"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 text-xs md:text-sm truncate max-w-[140px] md:max-w-none uppercase tracking-wider">{exam.title}</span>
          </div>
        </div>

        {/* Real Banking Exam Timer Style */}
        <div className="flex items-center border border-slate-300 rounded overflow-hidden shadow-sm h-8 md:h-10">
          <div className="bg-slate-100 px-2 md:px-3 flex items-center justify-center border-r border-slate-300 h-full">
            <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-tighter">Time Left</span>
          </div>
          <div className="bg-white px-2 md:px-4 flex items-center justify-center h-full min-w-[70px] md:min-w-[100px]">
            <span className={`font-mono font-bold text-base md:text-xl ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleFullScreen} className="p-2 text-slate-400 hover:text-slate-600 hidden sm:block">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="h-10 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Section: {currentQuestion.topic || 'General Knowledge'}
            </span>
          </div>

          {/* Question and MCQ Area with dedicated scrolling */}
          <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-10">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex gap-4 mb-8 shrink-0">
                <span className="font-black text-xl text-slate-400">Q{currentQuestionIndex + 1}.</span>
                <h2 className="text-base md:text-xl font-medium text-slate-800 leading-relaxed">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Scrollable Options Container */}
              <div className="space-y-4 md:ml-12 flex-1 min-h-0 overflow-auto custom-scrollbar pr-3">
                {currentQuestion.options.map((option, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-5 rounded border flex items-center gap-5 transition-all group ${
                      answers[currentQuestion.id] === idx 
                      ? "bg-blue-50 border-blue-400 shadow-sm" 
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      answers[currentQuestion.id] === idx ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-slate-400'
                    }`}>
                      {answers[currentQuestion.id] === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm md:text-base font-medium text-slate-700">({String.fromCharCode(65+idx)}) {option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Bar (Banking Style) */}
          <div className="h-20 md:h-16 bg-white border-t border-slate-200 flex flex-col md:flex-row items-center px-4 justify-between shrink-0 py-2 md:py-0 gap-2">
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleMarkForReview}
                className="flex-1 md:flex-none px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 rounded transition-all active:scale-[0.98]"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={clearResponse}
                className="flex-1 md:flex-none px-4 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-all active:scale-[0.98]"
              >
                Clear Response
              </button>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0}
                className="flex-1 md:flex-none px-6 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded disabled:opacity-40 transition-all active:scale-[0.98]"
              >
                Back
              </button>
              
              {/* Responsive Next/Submit Logic: 
                  Mobile: Shows 'Submit' on last question.
                  Desktop: Shows 'Save & Next' (disabled) on last question, relies on sidebar for Submit. 
              */}
              
              {isLastQuestion && (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="lg:hidden flex-1 md:flex-none px-10 py-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white bg-slate-800 hover:bg-slate-900 rounded shadow-md transition-all active:scale-[0.98]"
                >
                  Submit Test
                </button>
              )}

              <button 
                onClick={handleNext}
                disabled={isLastQuestion}
                className={`flex-1 md:flex-none px-10 py-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white rounded transition-all active:scale-[0.98] ${
                  isLastQuestion 
                    ? 'hidden lg:block bg-blue-600 opacity-50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-80 h-full flex-col bg-slate-100 border-l border-slate-300 overflow-hidden shrink-0">
          {paletteDrawerContent}
        </aside>
      </div>

      {/* Mobile Palette Drawer */}
      <AnimatePresence>
        {isPaletteOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaletteOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-white z-[60] shadow-2xl border-r border-slate-200"
            >
              <div className="flex flex-col h-full relative">
                <button 
                  onClick={() => setIsPaletteOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
                {paletteDrawerContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <MotionDiv 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white w-full max-w-sm rounded-lg border border-slate-200 shadow-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                You have answered <b>{stats.answered}</b> questions. Once submitted, you cannot change your responses.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSubmitModal(false)} 
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold text-xs uppercase tracking-widest"
                >
                  No, Resume
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs uppercase tracking-widest shadow-md active:scale-[0.98]"
                >
                  Yes, Submit
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamInterface;