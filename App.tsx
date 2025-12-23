import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';
import ExamInterface from './components/ExamInterface';
import ResultsPage from './components/ResultsPage';
import ApiKeyPage from './components/ApiKeyPage';
import AboutPage from './components/AboutPage';
import QuotaErrorModal from './components/QuotaErrorModal';
import { AppView, ExamConfig, GeneratedExam, ExamResult } from './types';
import { generateExamContent, hasUserApiKey } from './services/geminiService';

const APP_STATE_KEY = 'note2exam_app_state';
const PROGRESS_KEY = 'note2exam_exam_progress';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [activeConfig, setActiveConfig] = useState<ExamConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Quota Error State
  const [isQuotaErrorOpen, setIsQuotaErrorOpen] = useState(false);
  const [isUserQuotaError, setIsUserQuotaError] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      try {
        const { currentView: savedView, generatedExam: savedExam, examResult: savedResult } = JSON.parse(savedState);
        setCurrentView(savedView);
        setGeneratedExam(savedExam);
        setExamResult(savedResult);
      } catch (e) {
        console.error("Failed to restore state:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify({
        currentView,
        generatedExam,
        examResult
      }));
    }
  }, [currentView, generatedExam, examResult, isInitialized]);

  const startApp = () => {
    setCurrentView(AppView.DASHBOARD);
  };

  const openSettings = () => {
    setCurrentView(AppView.API_SETTINGS);
  };

  const openAbout = () => {
    setCurrentView(AppView.ABOUT);
  };

  const handleGenerateExam = async (text: string, image: string | null, pdf: string | null, config: ExamConfig) => {
    setActiveConfig(config);
    localStorage.removeItem(PROGRESS_KEY);
    setCurrentView(AppView.LOADING);
    setIsUserQuotaError(false);

    try {
      const exam = await generateExamContent(text, image, pdf, config);
      setGeneratedExam(exam);
      setCurrentView(AppView.EXAM);
    } catch (error: any) {
      console.error(error);
      
      const errorMsg = error.message || '';
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('503') || errorMsg.includes('quota') || errorMsg.includes('exhausted');

      if (isRateLimit) {
        // Check if the user is using their own key or the system key
        if (hasUserApiKey()) {
          setIsUserQuotaError(true);
        } else {
          setIsUserQuotaError(false);
        }
        setIsQuotaErrorOpen(true);
      } else {
        alert("Failed to generate exam. Please check your inputs and try again.");
      }
      
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleExamComplete = (result: ExamResult) => {
    setExamResult(result);
    setCurrentView(AppView.RESULTS);
    localStorage.removeItem(PROGRESS_KEY);
  };

  const handleRestart = () => {
    setGeneratedExam(null);
    setExamResult(null);
    setActiveConfig(null);
    setCurrentView(AppView.DASHBOARD);
    localStorage.removeItem(APP_STATE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  };

  if (!isInitialized) return null;

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100">
      {currentView === AppView.LANDING && (
        <LandingPage 
          onStart={startApp} 
          onOpenSettings={openSettings}
          onOpenAbout={openAbout}
        />
      )}
      
      {currentView === AppView.ABOUT && (
        <AboutPage onBack={() => setCurrentView(AppView.LANDING)} />
      )}

      {currentView === AppView.API_SETTINGS && (
        <ApiKeyPage onBack={() => setCurrentView(AppView.LANDING)} />
      )}
      
      {currentView === AppView.DASHBOARD && (
        <Dashboard 
          onGenerate={handleGenerateExam} 
          onBack={() => setCurrentView(AppView.LANDING)}
        />
      )}
      
      {currentView === AppView.LOADING && <LoadingScreen config={activeConfig} />}
      
      {currentView === AppView.EXAM && generatedExam && (
        <ExamInterface 
          exam={generatedExam} 
          onComplete={handleExamComplete} 
        />
      )}
      
      {currentView === AppView.RESULTS && generatedExam && examResult && (
        <ResultsPage exam={generatedExam} result={examResult} onRestart={handleRestart} />
      )}

      {/* Specific Quota Error Popup */}
      <QuotaErrorModal 
        isOpen={isQuotaErrorOpen}
        onClose={() => setIsQuotaErrorOpen(false)}
        onGoToSettings={openSettings}
        isUserQuota={isUserQuotaError}
      />
    </div>
  );
};

export default App;
