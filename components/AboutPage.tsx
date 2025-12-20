
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, ShieldCheck, Zap, Heart, Globe, Mail, CheckCircle, BookOpen, UserCheck, Monitor } from 'lucide-react';

const MotionDiv = motion.div as any;

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-8 flex flex-col items-center relative font-inter">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-yellow-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl w-full flex flex-col flex-1 relative z-10">
        {/* Header with Back Button */}
        <div className="mb-8 pt-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all hover:shadow active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12 pb-16"
        >
            {/* Hero Section */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 mb-4">
                    <Brain className="w-12 h-12 text-yellow-500" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-manrope text-slate-900 tracking-tight">
                    Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">Govt Exams</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Note2Exam is the ultimate simulator for aspirants preparing for competitive exams. Convert your study material into realistic Computer Based Tests (CBT) powered by advanced Gemini models.
                </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                        <p className="text-slate-600 leading-relaxed text-base">
                            Success in exams like Banking, SSC, Railways, and UPSC requires more than just reading—it requires familiarity with the testing environment. 
                        </p>
                        <p className="text-slate-600 leading-relaxed text-base">
                            <span className="font-bold text-slate-900">Note2Exam</span> bridges this gap. By leveraging advanced <span className="font-bold text-yellow-600">Gemini models</span>, we parse your notes, PDFs, and syllabus to generate rigorous, exam-style questions with detailed rationales, simulating the actual pressure of a government exam hall.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Real CBT Interface</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Instant Analysis</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                        <ul className="space-y-4">
                            {[
                                { icon: Monitor, title: "Exam Simulator", desc: "Mirrors the exact UI of major online government exams." },
                                { icon: BookOpen, title: "Syllabus Aware", desc: "Generates questions strictly relevant to your uploaded topics." },
                                { icon: UserCheck, title: "Adaptive Difficulty", desc: "Test yourself from Prelims to Mains level complexity." }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-600 shrink-0">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm text-center group hover:translate-y-[-4px] transition-transform duration-300">
                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Privacy First</h3>
                    <p className="text-sm text-slate-500">
                        We prioritize your data privacy. Uploaded documents are processed in memory for the duration of the exam generation and never stored permanently.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm text-center group hover:translate-y-[-4px] transition-transform duration-300">
                    <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Speed & Precision</h3>
                    <p className="text-sm text-slate-500">
                        Powered by <strong>Gemini models</strong>, creating a full-length mock test takes seconds, ensuring you spend more time practicing and less time planning.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm text-center group hover:translate-y-[-4px] transition-transform duration-300">
                    <div className="w-12 h-12 mx-auto bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Aspirant Centric</h3>
                    <p className="text-sm text-slate-500">
                        Built specifically for serious aspirants. We continuously refine our system to match the evolving patterns of competitive examinations.
                    </p>
                </div>
            </div>

            {/* Footer / Contact */}
            <div className="pt-10 border-t border-slate-200 flex flex-col items-center gap-6">
                <p className="text-slate-400 text-sm font-medium">Get in touch with the team</p>
                <div className="flex gap-4">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                    >
                        <Globe className="w-4 h-4" /> Visit Website
                    </button>
                    <a 
                        href="mailto:kd357611@gmail.com"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        <Mail className="w-4 h-4" /> Contact Support
                    </a>
                </div>
                <p className="text-xs text-slate-400 mt-4">&copy; {new Date().getFullYear()} Note2Exam. All rights reserved.</p>
            </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default AboutPage;
