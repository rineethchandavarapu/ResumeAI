'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DocsView from '../components/DocsView';

// Types for Gemini Analysis Output
interface StrengthOrWeakness {
  category: string;
  description: string;
}

interface RewriteItem {
  original: string;
  optimized: string;
}

interface QuestionItem {
  question: string;
  difficulty: string;
}

interface AnalysisResult {
  ats_score: number;
  job_match_score: number;
  skills_match_percentage: number;
  keyword_coverage_score: number;
  extracted_metadata: {
    name: string;
    skills: string[];
    experience: string[];
    education: string[];
    projects: string[];
    certifications: string[];
  };
  feedback: {
    strengths: StrengthOrWeakness[];
    weaknesses: StrengthOrWeakness[];
    missing_skills: string[];
    missing_keywords: string[];
    improvement_suggestions: string[];
  };
  rewrites: {
    summary: RewriteItem;
    experience: RewriteItem[];
  };
  interview_prep: {
    technical: QuestionItem[];
    behavioral: QuestionItem[];
    project_based: QuestionItem[];
    hr: QuestionItem[];
  };
  career_roadmap: {
    current_level: string;
    target_level: string;
    missing_skills: string[];
    learning_path: string[];
    recommended_technologies: string[];
    suggested_certifications: string[];
    estimated_timeline: string;
  };
  linkedin_optimizer: {
    headline: string;
    about: string;
    project_descriptions: string[];
    featured_section: string;
  };
}

export default function ResumeAISaaS() {
  const [activePage, setActivePage] = useState<'landing' | 'workspace' | 'dashboard' | 'about' | 'docs'>('landing');
  const [inApp, setInApp] = useState<boolean>(false);

  // Animated Hero Text State
  const roles = ['Software Engineers', 'Product Managers', 'Data Scientists', 'Executives'];
  const [roleIndex, setRoleIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedPage = localStorage.getItem('resumeai_activePage');
      const savedInApp = localStorage.getItem('resumeai_inApp');
      const savedResult = localStorage.getItem('resumeai_result');

      if (savedPage) setActivePage(savedPage as any);
      if (savedInApp) setInApp(savedInApp === 'true');
      if (savedResult) setAnalysisResult(JSON.parse(savedResult));
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeai_activePage', activePage);
    localStorage.setItem('resumeai_inApp', inApp.toString());
  }, [activePage, inApp]);

  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('resumeai_result', JSON.stringify(analysisResult));
    } else {
      localStorage.removeItem('resumeai_result');
    }
  }, [analysisResult]);

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing analysis engines...');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Interactive UI states
  const [rewriterTab, setRewriterTab] = useState<'experience' | 'summary'>('experience');
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Trigger ATS circle animation when dashboard is loaded
  const [animatedAtsScore, setAnimatedAtsScore] = useState<number>(0);
  useEffect(() => {
    if (activePage === 'dashboard' && analysisResult) {
      setAnimatedAtsScore(0);
      const timer = setTimeout(() => {
        setAnimatedAtsScore(analysisResult.ats_score);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activePage, analysisResult]);

  const validateFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/x-tex'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type)) {
      setApiError("Invalid file type. Please upload PDF, DOCX, TXT, or TEX.");
      return false;
    }
    if (selectedFile.size > maxSize) {
      setApiError("File too large. Max size is 10MB.");
      return false;
    }
    setApiError(null);
    return true;
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRunAnalysis = async () => {
    // Input Validation
    if (!file && !jobDescription) {
      setApiError("Please upload a resume and paste a job description.");
      return;
    } else if (!file) {
      setApiError("Please upload a resume.");
      return;
    } else if (!jobDescription) {
      setApiError("Please paste a job description.");
      return;
    }
    
    setApiError(null);

    setLoading(true);
    setLoadingProgress(10);
    setLoadingStep('Ingesting document structure...');

    // Progress bar simulation
    const progressTimer1 = setTimeout(() => {
      setLoadingProgress(40);
      setLoadingStep('Cross-referencing 50,000+ industry placements...');
    }, 800);

    const progressTimer2 = setTimeout(() => {
      setLoadingProgress(70);
      setLoadingStep('Evaluating semantic gaps & ATS keywords...');
    }, 1600);

    const progressTimer3 = setTimeout(() => {
      setLoadingProgress(90);
      setLoadingStep('Compiling AI career roadmaps...');
    }, 2400);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_description', jobDescription || 'General Software Engineering / Product Design Role');

      // Call Next.js API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis request failed.');
      }

      const data = await response.json();

      // Complete loading animation
      setTimeout(() => {
        setLoadingProgress(100);
        setAnalysisResult(data);
        setLoading(false);
        setActivePage('dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Error contacting backend API:', error);

      setLoadingStep('Analysis Failed');
      setLoadingProgress(100);

      setTimeout(() => {
        setLoading(false);
        setApiError('Backend Error: ' + error.message);
      }, 500);
    }
  };

  // Copy optimize text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface overflow-x-clip">

      {/* Header Navigation */}
      <header className="w-full h-16 border-b border-outline-variant bg-surface sticky top-0 z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop print:hidden">
        <div onClick={() => { setInApp(false); setActivePage('landing'); }} className="flex items-center gap-3 cursor-pointer select-none group">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 sm:w-10 sm:h-10 rounded-sm group-hover:opacity-80 transition-opacity">
                      <rect width="100" height="100" fill="#000000" rx="12" />
                      <text x="50" y="52" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38" fill="#ffffff" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">RAI</text>
                    </svg>
                    <span className="font-headline-lg text-headline-lg font-black tracking-tighter text-primary">ResumeAI</span>
        </div>

        <nav className="hidden md:flex items-center gap-gutter">
          <button onClick={() => { setInApp(false); setActivePage('landing'); }} className={`text-label-md py-2 px-4 rounded-sm transition-colors ${activePage === 'landing' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:text-primary'}`}>
            Home
          </button>
          <button onClick={() => { setInApp(false); setActivePage('about'); }} className={`text-label-md py-2 px-4 rounded-sm transition-colors ${activePage === 'about' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:text-primary'}`}>
            About
          </button>
          <button onClick={() => { setInApp(false); setActivePage('docs'); }} className={`text-label-md py-2 px-4 rounded-sm transition-colors ${activePage === 'docs' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:text-primary'}`}>
            Docs
          </button>

          {!inApp ? (
            <button onClick={() => { setInApp(true); setActivePage('workspace'); }} className="bg-primary text-on-primary px-stack-md py-2 text-label-md font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all">
              Lets Start
            </button>
          ) : (
            <button onClick={() => setActivePage('workspace')} className={`text-label-md py-2 px-4 rounded-sm transition-colors ${activePage === 'workspace' || activePage === 'dashboard' ? 'text-primary font-bold bg-surface-container-low' : 'text-secondary hover:text-primary'}`}>
              Workspace
            </button>
          )}
        </nav>

        <div className="md:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(true)} className="material-symbols-outlined text-primary">
            menu
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full flex flex-col">

        {activePage === 'docs' && (
          <DocsView />
        )}

        {/* 1. LANDING PAGE VIEW */}
        {/* 1. LANDING PAGE VIEW */}
        {activePage === 'landing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col w-full"
          >
            {/* Hero Section */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="px-margin-mobile md:px-margin-desktop py-20 md:py-32 w-full max-w-7xl mx-auto text-center space-y-stack-lg">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <span className="font-mono-sm text-[10px] uppercase tracking-[0.2em] text-primary bg-surface-container-low px-4 py-2 border border-outline-variant rounded-full inline-block mb-8">
                  Next-Generation Career Intelligence
                </span>
                <h1 className="font-display-lg text-[32px] sm:text-[48px] md:text-[80px] leading-[1.05] tracking-tighter text-primary">
                  The ultimate AI advantage for
                  <br className="hidden md:block" />
                  <div className="h-[50px] sm:h-[60px] md:h-[90px] mt-2 md:mt-4 overflow-hidden relative w-full flex justify-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={roleIndex}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                        className="absolute text-secondary underline decoration-primary decoration-4 underline-offset-8 whitespace-nowrap"
                      >
                        {roles[roleIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </h1>
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-body-md text-secondary text-lg max-w-2xl text-center mx-auto">
                Upload your resume. Paste the job description. Our proprietary RAI engine reverse-engineers the ATS algorithm to score your fit and rewrite your bullets for maximum impact.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <button
                  onClick={() => { setInApp(true); setActivePage('workspace'); }}
                  className="bg-primary text-on-primary font-label-md px-12 py-5 uppercase tracking-widest hover:opacity-90 transition-all border-2 border-primary text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                >
                  Start Analysis Free
                </button>
              </motion.div>
            </motion.section>

            {/* Social Proof / Stats */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="w-full py-12 border-y border-outline-variant bg-surface-container-lowest">
              <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
                <div className="flex flex-col items-center">
                  <span className="font-headline-lg text-[40px] font-black text-primary tracking-tighter">10,000+</span>
                  <span className="font-mono-sm text-secondary uppercase text-[11px] tracking-widest mt-1">Resumes Analyzed</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-lg text-[40px] font-black text-primary tracking-tighter">95%</span>
                  <span className="font-mono-sm text-secondary uppercase text-[11px] tracking-widest mt-1">ATS Accuracy</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-lg text-[40px] font-black text-primary tracking-tighter">500+</span>
                  <span className="font-mono-sm text-secondary uppercase text-[11px] tracking-widest mt-1">Career Paths</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-lg text-[40px] font-black text-primary tracking-tighter">2.5x</span>
                  <span className="font-mono-sm text-secondary uppercase text-[11px] tracking-widest mt-1">Interview Rate</span>
                </div>
              </div>
            </motion.section>

            {/* Features Showcase */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} id="features-section" className="w-full py-24 px-margin-mobile md:px-margin-desktop bg-surface">
              <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="font-headline-lg text-[40px] font-black text-primary tracking-tighter mb-4">Surgical Analysis Tools</h2>
                  <p className="font-body-lg text-secondary">Stop guessing what hiring managers want. Our tools provide deterministic, data-driven feedback on exactly how to pivot your career narrative.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <motion.div whileHover={{ y: -5 }} className="p-8 border border-outline-variant bg-white transition-all hover:border-primary shadow-sm space-y-4 flex flex-col items-start text-left">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center rounded-sm mb-2">
                      <span className="material-symbols-outlined text-2xl">radar</span>
                    </div>
                    <h3 className="font-headline-md text-[24px] font-bold tracking-tight text-primary">ATS Score Simulation</h3>
                    <p className="font-body-md text-secondary">We simulate enterprise Applicant Tracking Systems (like Workday and Greenhouse) to ensure your formatting, fonts, and hierarchies pass the initial robot screen.</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="p-8 border border-outline-variant bg-white transition-all hover:border-primary shadow-sm space-y-4 flex flex-col items-start text-left">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center rounded-sm mb-2">
                      <span className="material-symbols-outlined text-2xl">join_inner</span>
                    </div>
                    <h3 className="font-headline-md text-[24px] font-bold tracking-tight text-primary">Semantic Job Matching</h3>
                    <p className="font-body-md text-secondary">Paste your target job description. The AI engine cross-references every bullet point to calculate a deterministic fit score based on contextual meaning, not just exact keywords.</p>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="p-8 border border-outline-variant bg-white transition-all hover:border-primary shadow-sm space-y-4 flex flex-col items-start text-left">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center rounded-sm mb-2">
                      <span className="material-symbols-outlined text-2xl">edit_square</span>
                    </div>
                    <h3 className="font-headline-md text-[24px] font-bold tracking-tight text-primary">Metrics-Driven Rewriter</h3>
                    <p className="font-body-md text-secondary">Weak verbs and passive descriptions are instantly re-authored. The engine forces a metrics-first methodology (e.g., transforming "helped build" into "architected X yielding Y% growth").</p>
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Advanced Features Showcase */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="w-full py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="font-headline-lg text-[40px] font-black text-primary tracking-tighter">Beyond the Resume</h2>
                  <p className="font-body-lg text-secondary">Our intelligence engine doesn't just grade your past; it architects your future. Access a full suite of career tools generated exclusively from your uploaded data.</p>
                  <ul className="space-y-4 pt-4">
                    <li className="flex gap-4 items-start">
                      <span className="material-symbols-outlined text-primary mt-1">route</span>
                      <div>
                        <h4 className="font-label-md uppercase font-bold text-primary">AI Career Roadmap</h4>
                        <p className="font-body-md text-secondary">A step-by-step progression plan mapping the skills you need to reach the next tier in your industry.</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="material-symbols-outlined text-primary mt-1">record_voice_over</span>
                      <div>
                        <h4 className="font-label-md uppercase font-bold text-primary">Targeted Interview Prep</h4>
                        <p className="font-body-md text-secondary">Behavioral and technical questions reverse-engineered from your exact project experiences and the target job description.</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="material-symbols-outlined text-primary mt-1">account_circle</span>
                      <div>
                        <h4 className="font-label-md uppercase font-bold text-primary">LinkedIn Optimizer</h4>
                        <p className="font-body-md text-secondary">An algorithmic rewrite of your professional headline and "About" summary optimized for recruiter search indexing.</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="bg-surface-container border border-outline-variant p-8 shadow-xl flex items-center justify-center min-h-[400px]">
                   <div className="space-y-4 w-full">
                     <span className="font-mono-sm text-xs text-primary uppercase tracking-widest block mb-4">Generated Roadmap Preview</span>
                     
                     <div className="bg-white border-l-4 border-primary p-4 shadow-sm text-left transition-transform hover:-translate-y-1">
                        <span className="font-label-md text-primary uppercase tracking-wider text-[10px]">Month 1-3</span>
                        <h4 className="font-headline-md text-sm font-bold text-on-surface mt-1">Master Cloud Architecture</h4>
                        <p className="font-body-md text-secondary text-xs mt-1">Deploy ML pipelines using AWS SageMaker or GCP Vertex AI to validate model scalability.</p>
                     </div>
                     
                     <div className="bg-white border-l-4 border-primary p-4 shadow-sm text-left transition-transform hover:-translate-y-1">
                        <span className="font-label-md text-primary uppercase tracking-wider text-[10px]">Month 3-6</span>
                        <h4 className="font-headline-md text-sm font-bold text-on-surface mt-1">Open Source Reputation</h4>
                        <p className="font-body-md text-secondary text-xs mt-1">Build public engineering reputation by contributing to LangChain, LlamaIndex, or HuggingFace.</p>
                     </div>
                     
                     <div className="bg-white border-l-4 border-primary p-4 shadow-sm text-left opacity-60 transition-transform hover:-translate-y-1">
                        <span className="font-label-md text-primary uppercase tracking-wider text-[10px]">Month 6-12</span>
                        <h4 className="font-headline-md text-sm font-bold text-on-surface mt-1">Senior Transition</h4>
                        <p className="font-body-md text-secondary text-xs mt-1">Lead an end-to-end MLOps initiative at current role emphasizing cost-reduction ROI metrics.</p>
                     </div>
                   </div>
                </div>
              </div>
            </motion.section>

            {/* Pipeline Step-by-Step */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="w-full py-24 px-margin-mobile md:px-margin-desktop bg-surface border-t border-outline-variant">
              <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="font-headline-lg text-[40px] font-black text-primary tracking-tighter mb-4">The RAI Pipeline</h2>
                  <p className="font-body-lg text-secondary">A transparent look at how our deterministic engine processes your credentials.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-outline-variant z-0"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-surface-container border-4 border-surface flex items-center justify-center rounded-full text-primary font-display-lg text-3xl shadow-md">1</div>
                    <h3 className="font-headline-md text-xl font-bold">Ingest</h3>
                    <p className="font-body-md text-secondary px-4">Upload your PDF, DOCX, or TEX. The ATS parser strips formatting to extract raw entity data.</p>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-primary text-on-primary border-4 border-surface flex items-center justify-center rounded-full font-display-lg text-3xl shadow-md">2</div>
                    <h3 className="font-headline-md text-xl font-bold">Analyze</h3>
                    <p className="font-body-md text-secondary px-4">The AI cross-references your skills against the target job description to compute a deterministic fit threshold.</p>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-surface-container border-4 border-surface flex items-center justify-center rounded-full text-primary font-display-lg text-3xl shadow-md">3</div>
                    <h3 className="font-headline-md text-xl font-bold">Optimize</h3>
                    <p className="font-body-md text-secondary px-4">Weak bullets are rewritten into high-impact, metrics-driven statements ready for submission.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* FAQ Section */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="w-full py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant">
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                  <h2 className="font-headline-lg text-[40px] font-black text-primary tracking-tighter mb-4">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">Is my data private?</h3>
                    <p className="font-body-md text-secondary">Yes. Your resume data is temporarily processed in memory during the AI analysis phase and is never permanently stored on our servers. All active sessions are maintained locally in your browser.</p>
                  </div>
   
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">What file formats are supported?</h3>
                    <p className="font-body-md text-secondary">We support PDF, DOCX, TXT, and raw TEX files. Our internal parser is designed to mimic the exact ingestion techniques used by modern enterprise ATS systems.</p>
                  </div>
   
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">How is the score calculated?</h3>
                    <p className="font-body-md text-secondary">The Keyword Coverage Index is calculated by extracting required capabilities from the target Job Description and executing a semantic (meaning-based) match against your extracted profile. It penalizes missing core skills while rewarding quantifiable metrics.</p>
                  </div>
     
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">How long does the analysis take?</h3>
                    <p className="font-body-md text-secondary">The analysis typically completes within a few seconds for standard resumes and job descriptions. Complex documents may take up to a minute.</p>
                  </div>
     
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">Can I save my results?</h3>
                    <p className="font-body-md text-secondary">Results are stored locally in your browser. You can copy the report or download it as a PDF using the &quot;Download Report&quot; button.</p>
                  </div>
     
                  <div className="bg-white border border-outline-variant p-6 rounded-sm">
                    <h3 className="font-label-md uppercase font-bold text-primary mb-2">Are there any limits on the analysis?</h3>
                    <p className="font-body-md text-secondary">We support resumes up to 10 MB and job descriptions up to 5 KB. Larger files will be rejected with an error message.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Try It Now CTA */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="w-full py-24 px-margin-mobile md:px-margin-desktop bg-primary text-on-primary text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="font-display-lg text-[48px] md:text-[64px] font-black tracking-tighter">Ready to dominate the market?</h2>
                <p className="font-body-lg text-lg opacity-90 max-w-2xl mx-auto">No credit card required. Instantly generate a full diagnostic report for your current resume against any job description in the world.</p>
                <div className="pt-8">
                  <button
                    onClick={() => { setInApp(true); setActivePage('workspace'); }}
                    className="bg-white text-primary font-label-md px-12 py-5 uppercase tracking-widest hover:bg-neutral-100 transition-all text-sm font-bold shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                  >
                    Enter Workspace
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}

        {/* 2. WORKSPACE / UPLOAD VIEW */}
        {activePage === 'workspace' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-stack-lg"
          >
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="border-b border-outline-variant pb-stack-md">
              <h2 className="font-headline-md text-3xl font-medium tracking-tight mb-stack-sm">Initiate Analysis</h2>
              <p className="font-body-md text-body-md text-secondary max-w-2xl">Upload your credentials and paste the target job description to generate a high-fidelity competitive analysis using RAI intelligence.</p>
            </motion.section>

            <div className="bento-grid">
              {/* Left Column: Form Inputs */}
              <div className="col-span-12 md:col-span-8 space-y-stack-lg">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="bg-surface-container-lowest p-stack-lg border border-outline-variant flex flex-col items-center justify-center min-h-[320px] upload-dashed transition-all hover:bg-surface-container-low group cursor-pointer rounded-sm"
                >
                  <input
                    type="file"
                    id="file-input"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.tex"
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 bg-primary text-on-primary flex items-center justify-center mb-stack-md group-active:scale-95 duration-100">
                    <span className="material-symbols-outlined text-3xl">
                      {file ? 'check_circle' : 'upload_file'}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-unit">
                    {file ? 'Document Ingested' : 'Upload Resume'}
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mb-4">
                    {file ? file.name : 'PDF, DOCX, TXT or TEX (Max 10MB)'}
                  </p>

                  {file && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs font-mono-sm uppercase border border-primary px-3 py-1.5 hover:bg-surface-container transition-colors"
                    >
                      Clear File
                    </button>
                  )}
                </div>

                {/* Job Description Textbox */}
                <div className="space-y-stack-sm">
                  <label className="font-label-md text-label-md text-primary uppercase tracking-wider block">Target Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full h-64 p-stack-md bg-surface-container-lowest border border-primary focus:ring-0 focus:border-[2px] outline-none font-body-md text-body-md placeholder:text-outline rounded-sm resize-none"
                    placeholder="Paste the full target job requirements, responsibilities, and specifications here to evaluate gap thresholds..."
                  />
                </div>

                {/* Analyze Trigger */}
                <div className="flex flex-col items-center justify-center gap-stack-md pt-stack-md border-t border-outline-variant">
                  <button
                    onClick={handleRunAnalysis}
                    className="w-full sm:w-auto px-16 py-4 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest active:scale-95 transition-all border-2 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    Analyze
                  </button>
                  <div className="flex items-center gap-stack-sm text-secondary">
                    <span className="material-symbols-outlined text-sm"></span>
                    <span className="font-mono-sm text-mono-sm uppercase">Analysis utilizes advanced RAI parameters</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Informational Sidebar */}
              <div className="col-span-12 md:col-span-4 space-y-gutter">

                <div className="p-gutter border border-outline-variant bg-surface-container-low rounded-sm">
                  <h3 className="font-label-md text-label-md text-primary mb-stack-sm uppercase tracking-wider">Diagnostic Steps</h3>
                  <ul className="space-y-stack-sm">
                    <li className="flex items-start gap-stack-sm">
                      <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                      <span className="font-body-md text-body-md">ATS compatibility parsing score</span>
                    </li>
                    <li className="flex items-start gap-stack-sm">
                      <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                      <span className="font-body-md text-body-md">Extraction of education, projects, skills</span>
                    </li>
                    <li className="flex items-start gap-stack-sm">
                      <span className="material-symbols-outlined text-sm mt-1">check_circle</span>
                      <span className="font-body-md text-body-md">Interview preparation roadmap engine</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. ACTIVE DIAGNOSTIC RUNNING OVERLAY */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center"
            >
              <div className="bg-white p-8 max-w-md w-full border-2 border-black rounded-sm mx-4 text-center">
                {/* Brutalist Scanning Animation */}
                <div className="flex gap-2 mb-8 h-16 items-end">
                  <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="w-4 bg-primary"></motion.div>
                  <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-4 bg-primary"></motion.div>
                  <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-4 bg-primary"></motion.div>
                  <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="w-4 bg-primary"></motion.div>
                  <motion.div animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="w-4 bg-primary"></motion.div>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2 uppercase tracking-wide">Scanning Documents</h3>
                <p className="font-mono-sm text-mono-sm text-secondary uppercase mb-6">{loadingStep}</p>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 h-1.5 mb-2 relative overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono-sm text-mono-sm text-secondary">
                  <span>STATUS: RUNNING</span>
                  <span>{loadingProgress}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. RESULTS DASHBOARD VIEW */}
        {activePage === 'dashboard' && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-stack-lg"
          >
            {/* Results Title Block */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md print:hidden">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary uppercase tracking-tight">Analysis Results</h1>
                <p className="font-body-md text-body-md text-secondary mt-unit" id="dashboard-target-role">
                  {analysisResult.extracted_metadata.name ? `${analysisResult.extracted_metadata.name} • ` : ''} Candidate Assessment
                </p>
              </div>
              <div className="flex flex-wrap gap-stack-sm w-full md:w-auto select-none">
                <button
                  onClick={() => window.print()}
                  className="flex-grow md:flex-grow-0 bg-surface border border-primary px-stack-md py-2 text-primary font-label-md text-label-md hover:bg-surface-container transition-all active:scale-95"
                >
                  EXPORT REPORT PDF
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setJobDescription('');
                    setAnalysisResult(null);
                    localStorage.removeItem('resumeai_result');
                    setActivePage('workspace');
                  }}
                  className="flex-grow md:flex-grow-0 bg-primary text-on-primary px-stack-md py-2 font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 border border-primary"
                >
                  RE-SCAN RESUME
                </button>
              </div>
            </motion.section>

            {/* Score Grid Block */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Primary Circular Score Card */}
              <div className="md:col-span-4 bg-white border border-primary p-stack-lg flex flex-col items-center justify-center space-y-stack-md rounded-sm">
                <span className="font-label-md text-label-md uppercase tracking-widest text-secondary text-center">ATS Optimization Score</span>
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                    {/* Circle perimeter = 2 * PI * r = 2 * 3.14159 * 88 = 552.92 */}
                    <circle
                      className="text-primary transition-all duration-1000"
                      cx="96"
                      cy="96"
                      fill="transparent"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray="552.92"
                      style={{ strokeDashoffset: 552.92 * (1 - animatedAtsScore / 100) }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display-lg text-display-lg">{analysisResult.ats_score}</span>
                    <span className="font-mono-sm text-mono-sm -mt-2">PERC%</span>
                  </div>
                </div>
                <div className="w-full pt-stack-md border-t border-surface-container flex justify-between">
                  <div className="text-center px-4 flex-grow">
                    <p className="font-mono-sm text-mono-sm text-secondary">MATCH SCORE</p>
                    <p className="font-headline-md text-headline-md">{analysisResult.job_match_score}%</p>
                  </div>
                  <div className="text-center px-4 border-l border-surface-container flex-grow">
                    <p className="font-mono-sm text-mono-sm text-secondary">SKILLS MATCH</p>
                    <p className="font-headline-md text-headline-md">{analysisResult.skills_match_percentage}%</p>
                  </div>
                </div>
              </div>

              {/* Metadata and Radar Chart Column */}
              <div className="md:col-span-8 bg-white border border-outline-variant p-stack-lg grid grid-cols-1 md:grid-cols-2 gap-stack-lg rounded-sm">
                <div className="space-y-stack-md">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-secondary block">Extracted Profile Metadata</span>
                  <div className="space-y-3 font-body-md text-sm">
                    {analysisResult.extracted_metadata.name && (
                      <p><span className="font-bold uppercase font-mono-sm text-secondary block text-xs">Name</span> {analysisResult.extracted_metadata.name}</p>
                    )}
                    <p>
                      <span className="font-bold uppercase font-mono-sm text-secondary block text-xs">Skills Detected</span>
                      <span className="flex flex-wrap gap-1.5 mt-1">
                        {analysisResult.extracted_metadata.skills.map((s, idx) => (
                          <span key={idx} className="bg-surface-container px-2 py-0.5 rounded-sm font-mono-sm text-xs text-primary">{s}</span>
                        ))}
                      </span>
                    </p>
                    {analysisResult.extracted_metadata.experience.length > 0 && (
                      <p>
                        <span className="font-bold uppercase font-mono-sm text-secondary block text-xs">Roles &amp; Experience</span>
                        <span className="block text-xs mt-1 text-secondary list-disc pl-4">
                          {analysisResult.extracted_metadata.experience.map((e, idx) => (
                            <span key={idx} className="block">• {e}</span>
                          ))}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Visualizer Radar Mock */}
                <div className="flex flex-col items-center justify-center min-h-[220px]">
                  <span className="font-mono-sm text-[10px] text-secondary uppercase mb-2">Keyword Coverage Index ({analysisResult.keyword_coverage_score}%)</span>
                  <svg className="w-full max-w-[200px]" viewBox="0 0 200 200">
                    <circle className="radar-grid" cx="100" cy="100" r="80"></circle>
                    <circle className="radar-grid" cx="100" cy="100" r="60"></circle>
                    <circle className="radar-grid" cx="100" cy="100" r="40"></circle>
                    <circle className="radar-grid" cx="100" cy="100" r="20"></circle>
                    <line className="radar-axis" x1="100" x2="100" y1="20" y2="180"></line>
                    <line className="radar-axis" x1="20" x2="180" y1="100" y2="100"></line>
                    <polygon className="radar-area transition-all duration-1000 ease-out" points={`100,${100 - (analysisResult.keyword_coverage_score * 0.8)} ${100 + (analysisResult.skills_match_percentage * 0.8)},100 100,${100 + (analysisResult.job_match_score * 0.8)} ${100 - (analysisResult.ats_score * 0.8)},100`}></polygon>
                    <text className="font-mono-sm text-[8px] fill-secondary" textAnchor="middle" x="100" y="15">KEYWORDS</text>
                    <text className="font-mono-sm text-[8px] fill-secondary" textAnchor="start" x="182" y="103">SKILLS</text>
                    <text className="font-mono-sm text-[8px] fill-secondary" textAnchor="middle" x="100" y="192">EXPERIENCE</text>
                    <text className="font-mono-sm text-[8px] fill-secondary" textAnchor="end" x="15" y="103">FORMAT</text>
                  </svg>
                </div>
              </div>
            </motion.section>

            {/* Strengths & Weaknesses Feedback */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bg-surface-container-low border border-outline-variant p-stack-lg rounded-sm">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <h3 className="font-headline-md text-headline-md uppercase tracking-tight">Critical Strengths</h3>
                </div>
                <ul className="space-y-stack-md">
                  {analysisResult.feedback.strengths.map((s, idx) => (
                    <li key={idx} className="border-l-2 border-primary pl-stack-md">
                      <p className="font-label-md text-label-md">{s.category}</p>
                      <p className="font-body-md text-body-md text-secondary text-sm">{s.description}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-outline-variant p-stack-lg rounded-sm">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                  <span className="material-symbols-outlined text-error-custom">warning</span>
                  <h3 className="font-headline-md text-headline-md uppercase tracking-tight">Optimization Gaps</h3>
                </div>
                <ul className="space-y-stack-md">
                  {analysisResult.feedback.weaknesses.map((w, idx) => (
                    <li key={idx} className="border-l-2 border-error-custom pl-stack-md">
                      <p className="font-label-md text-label-md text-error-custom">{w.category}</p>
                      <p className="font-body-md text-body-md text-secondary text-sm">{w.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* AI Resume Rewriter module */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="bg-primary text-on-primary p-stack-lg rounded-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-stack-sm">
                <div>
                  <h2 className="font-headline-lg text-headline-lg uppercase tracking-tight">AI Content Optimizer</h2>
                  <p className="font-body-md text-body-md opacity-80">Rewrite detected weaknesses into high-impact ATS content.</p>
                </div>
                <div className="flex bg-white p-1 rounded-none select-none text-xs">
                  <button
                    onClick={() => setRewriterTab('experience')}
                    className={`px-stack-md py-1.5 font-label-md transition-colors ${rewriterTab === 'experience' ? 'bg-primary text-on-primary' : 'text-primary hover:bg-surface-container'}`}
                  >
                    EXPERIENCE
                  </button>
                  <button
                    onClick={() => setRewriterTab('summary')}
                    className={`px-stack-md py-1.5 font-label-md transition-colors ${rewriterTab === 'summary' ? 'bg-primary text-on-primary' : 'text-primary hover:bg-surface-container'}`}
                  >
                    SUMMARY
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-stack-sm">
                  <span className="font-mono-sm text-mono-sm opacity-60 block uppercase">Original Text</span>
                  <div className="bg-neutral-900 border border-neutral-800 p-stack-md font-body-md text-body-md italic opacity-85 min-h-[120px] rounded-sm text-sm break-words break-all">
                    {rewriterTab === 'experience'
                      ? (analysisResult.rewrites.experience[0]?.original || "No experience text extracted.")
                      : analysisResult.rewrites.summary.original
                    }
                  </div>
                </div>

                <div className="space-y-stack-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-mono-sm text-mono-sm uppercase">Optimized Suggestion</span>
                    <button
                      onClick={() => handleCopyText(
                        rewriterTab === 'experience'
                          ? (analysisResult.rewrites.experience[0]?.optimized || '')
                          : analysisResult.rewrites.summary.optimized
                      )}
                      className="flex items-center gap-1 font-mono-sm text-xs hover:underline cursor-pointer select-none"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {copyStatus ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <div className="bg-white text-primary p-stack-md font-body-md text-body-md font-medium min-h-[120px] rounded-sm text-sm break-words break-all">
                    {rewriterTab === 'experience'
                      ? (analysisResult.rewrites.experience[0]?.optimized || '')
                      : analysisResult.rewrites.summary.optimized
                    }
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Career Roadmap module */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="bg-white border border-outline-variant p-stack-lg rounded-sm">
              <h3 className="font-headline-md text-headline-md uppercase tracking-tight mb-stack-lg border-b pb-2">AI Career Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="space-y-3">
                  <p><span className="font-mono-sm text-secondary uppercase block text-xs">Current Tier</span> {analysisResult.career_roadmap.current_level}</p>
                  <p><span className="font-mono-sm text-secondary uppercase block text-xs">Target Role</span> {analysisResult.career_roadmap.target_level}</p>
                  <p><span className="font-mono-sm text-secondary uppercase block text-xs">Estimated Timeline</span> {analysisResult.career_roadmap.estimated_timeline}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="font-mono-sm text-secondary uppercase block text-xs mb-1">Recommended Learning Path</span>
                    <ul className="list-disc pl-5 font-body-md text-sm text-secondary space-y-1">
                      {analysisResult.career_roadmap.learning_path.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-mono-sm text-secondary uppercase block text-xs mb-1">Suggested Certifications</span>
                    <span className="flex flex-wrap gap-1.5 mt-1">
                      {analysisResult.career_roadmap.suggested_certifications.map((c, idx) => (
                        <span key={idx} className="bg-surface-container px-2 py-0.5 rounded-sm font-mono-sm text-xs text-primary">{c}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Interview Prep Questions Module */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="bg-surface-container-low border border-outline-variant p-stack-lg rounded-sm space-y-4">
              <h3 className="font-headline-md text-headline-md uppercase tracking-tight border-b pb-2">Interview Preparation Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div>
                  <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-3">Technical Diagnostics</h4>
                  <ul className="space-y-3">
                    {analysisResult.interview_prep.technical.map((q, idx) => (
                      <li key={idx} className="bg-white p-3 border border-outline-variant rounded-sm text-sm space-y-1">
                        <p className="font-bold">{q.question}</p>
                        <span className="inline-block text-[10px] font-mono-sm px-1.5 bg-primary text-on-primary uppercase">{q.difficulty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-3">Behavioral &amp; HR Questions</h4>
                  <ul className="space-y-3">
                    {analysisResult.interview_prep.behavioral.map((q, idx) => (
                      <li key={idx} className="bg-white p-3 border border-outline-variant rounded-sm text-sm space-y-1">
                        <p className="font-bold">{q.question}</p>
                        <span className="inline-block text-[10px] font-mono-sm px-1.5 bg-surface-container text-primary uppercase border border-outline-variant">{q.difficulty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* LinkedIn profile optimizer */}
            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="bg-white border border-outline-variant p-stack-lg rounded-sm space-y-4">
              <h3 className="font-headline-md text-headline-md uppercase tracking-tight border-b pb-2">LinkedIn Optimizer</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-mono-sm text-secondary uppercase block text-xs">Professional Headline</span>
                  <p className="font-body-md text-sm font-medium mt-1">{analysisResult.linkedin_optimizer.headline}</p>
                </div>
                <div>
                  <span className="font-mono-sm text-secondary uppercase block text-xs">Optimized 'About' Summary</span>
                  <p className="font-body-md text-sm text-secondary mt-1 italic">"{analysisResult.linkedin_optimizer.about}"</p>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
        {/* 5. ABOUT VIEW */}
        {activePage === 'about' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-20 space-y-24">

            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="text-center space-y-8 max-w-3xl mx-auto">
              <span className="font-mono-sm text-[10px] uppercase tracking-[0.2em] text-primary bg-surface-container-low px-4 py-2 border border-outline-variant rounded-full inline-block">
                About
              </span>
              <h1 className="font-display-lg text-[48px] md:text-[64px] leading-[1.05] tracking-tighter text-primary">
                Stop the manual grind.
              </h1>
              <p className="font-body-lg text-[20px] text-secondary">
                Automate the tedious tailoring process. Generate perfectly tailored, ATS-optimized resumes in seconds so you can focus on acing the interview.
              </p>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="font-mono-sm text-sm uppercase tracking-widest text-secondary block">Our Mission</span>
                <h2 className="font-headline-lg text-[32px] tracking-tight text-primary">Leveling the Playing Field</h2>
                <p className="font-body-md text-secondary">
                  The time we spent on tailoring resumes manually could have been spent on preparing for interviews. So, that's why I built ResumeAI.
                </p>
                <p className="font-body-md text-secondary">
                  And made it open source, so that anyone can contribute, audit, and improve the system. And stop paying for resume services. Invest that money in a course and up-skill yourself.
                </p>
              </div>
              <div className="bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden h-[300px] md:h-[400px]">
                <img src="/deterministic_filtering_diagram.png" alt="ResumeAI Mission" className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="border-t border-outline-variant pt-32 pb-16 max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
              <span className="font-mono-sm text-xs uppercase tracking-[0.3em] text-secondary mb-8">
                Designed & Developed By
              </span>
              
              <h3 className="text-[40px] md:text-[56px] text-primary mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '-0.02em' }}>
                Rineeth Chandavarapu
              </h3>
              
              <div className="w-12 h-[1px] bg-outline-variant mb-8"></div>
              
              <a href="https://www.linkedin.com/in/rineethchandavarapu/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 font-mono-sm text-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                <span>LinkedIn</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7 }} className="bg-primary text-on-primary text-center py-16 px-8 mt-12 rounded-sm shadow-xl">
              <h2 className="font-headline-lg text-[32px] tracking-tight mb-6">Stop guessing. Start optimizing.</h2>
              <button
                onClick={() => { setInApp(true); setActivePage('workspace'); }}
                className="bg-white text-primary font-label-md px-10 py-4 uppercase tracking-widest hover:bg-neutral-100 transition-all text-sm font-bold shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Access The Workspace
              </button>
            </motion.section>

          </motion.div>
        )}



      </main>

      {/* Error Toast Notification */}
      <AnimatePresence>
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-[#ba1a1a] text-white p-6 rounded-sm shadow-2xl z-50 max-w-md border-l-4 border-black print:hidden"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">error</span>
                <h4 className="font-label-md uppercase tracking-wider font-bold">Diagnostics Failed</h4>
              </div>
              <button onClick={() => setApiError(null)} className="opacity-80 hover:opacity-100">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p className="font-body-md text-sm opacity-90">{apiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant pt-16 pb-8 px-margin-mobile md:px-margin-desktop print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
                <svg viewBox="0 0 100 100" className="w-6 h-6 rounded-sm">
                  <rect width="100" height="100" fill="#000000" rx="12" />
                  <text x="50" y="52" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38" fill="#ffffff" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">RAI</text>
                </svg>
                <span className="font-headline-md text-headline-md font-bold text-primary tracking-tighter">ResumeAI</span>
            </div>
            <p className="font-body-md text-secondary max-w-sm">
              Bridging the gap between talented professionals and algorithmic hiring systems using deterministic AI engines.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-md uppercase tracking-widest text-xs font-bold">Product</span>
            <button onClick={() => { setInApp(true); setActivePage('workspace'); }} className="text-left text-secondary hover:text-primary transition-colors text-sm">Workspace</button>
            <button onClick={() => { setInApp(false); setActivePage('docs'); }} className="text-left text-secondary hover:text-primary transition-colors text-sm">Documentation</button>

          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-md uppercase tracking-widest text-xs font-bold">Company</span>
            <button onClick={() => { setInApp(false); setActivePage('about'); }} className="text-left text-secondary hover:text-primary transition-colors text-sm">About Us</button>
            <a href="#" className="text-left text-secondary hover:text-primary transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-left text-secondary hover:text-primary transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex justify-between items-center border-t border-outline-variant pt-8">
          <p className="font-mono-sm text-mono-sm text-secondary text-[10px] tracking-wider uppercase">© 2026 RAI GLOBAL. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex md:hidden justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-surface w-full h-full p-6 flex flex-col justify-between border-l border-black shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-sm hover:opacity-80 transition-opacity">
                      <rect width="100" height="100" fill="#000000" rx="12" />
                      <text x="50" y="52" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38" fill="#ffffff" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">RAI</text>
                    </svg>
                    <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">ResumeAI</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 hover:opacity-70 transition-opacity text-primary font-label-md uppercase tracking-wider text-sm">
                    <span>Close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-4 font-label-md">
                  <button onClick={() => { setInApp(false); setActivePage('landing'); setMobileMenuOpen(false); }} className="py-3 text-left border-b border-outline-variant hover:text-primary transition-colors text-secondary text-lg">Home</button>
                  <button onClick={() => { setInApp(false); setActivePage('about'); setMobileMenuOpen(false); }} className="py-3 text-left border-b border-outline-variant hover:text-primary transition-colors text-secondary text-lg">About</button>
                  <button onClick={() => { setInApp(false); setActivePage('docs'); setMobileMenuOpen(false); }} className="py-3 text-left border-b border-outline-variant hover:text-primary transition-colors text-secondary text-lg">Docs</button>
                  {inApp && (
                    <button onClick={() => { setActivePage('workspace'); setMobileMenuOpen(false); }} className="py-3 text-left border-b border-outline-variant hover:text-primary transition-colors text-secondary text-lg">Workspace</button>
                  )}
                </div>
              </div>
              <div className="mt-8">
                {!inApp && (
                  <button onClick={() => { setInApp(true); setActivePage('workspace'); setMobileMenuOpen(false); }} className="w-full bg-primary text-on-primary py-4 font-label-md uppercase tracking-widest text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm rounded-sm">
                    Get Started
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Fallback high-fidelity mock data structure generator
function getFallbackMockData(jobDesc: string): AnalysisResult {
  return {
    ats_score: 85,
    job_match_score: 92,
    skills_match_percentage: 88,
    keyword_coverage_score: 90,
    extracted_metadata: {
      name: "Alexander Mercer",
      skills: ["UI Design", "Figma", "TypeScript", "React", "Next.js", "Python", "Tailwind CSS"],
      experience: ["Senior Designer at Stripe (2022 - Present)", "UI Engineer at Vercel (2020 - 2022)"],
      education: ["B.S. in Computer Science - Stanford University"],
      projects: ["Design System scale initiative", "High-performance dashboard overhaul"],
      certifications: ["Google Cloud Certified Cloud Architect"]
    },
    feedback: {
      strengths: [
        {
          category: "ACTION VERB DENSITY",
          description: "High usage of impactful verbs like 'Architected,' 'Spearheaded,' and 'Synthesized.'"
        },
        {
          category: "QUANTIFIABLE METRICS",
          description: "Strong evidence of data-driven results (e.g., 'increased velocity by 40%')."
        },
        {
          category: "FORMATTING CLARITY",
          description: "Zero parsing errors detected. Headers are clearly defined for ATS logic."
        }
      ],
      weaknesses: [
        {
          category: "MISSING CORE SKILLS",
          description: "'Design Systems Architecture' is missing. This is a top-3 requirement for this role."
        },
        {
          category: "CONTACT SECTION",
          description: "LinkedIn profile link is missing or incorrectly formatted for automated crawlers."
        },
        {
          category: "SUMMARY LENGTH",
          description: "Professional summary exceeds the 3-sentence recommendation for high readability."
        }
      ],
      missing_skills: ["Design Systems Architecture", "LLMs Integration", "FastAPI"],
      missing_keywords: ["Scalability", "Design Tokens", "REST APIs"],
      improvement_suggestions: [
        "Integrate 'Design Systems' and 'Scalability' into the Stripe experience block.",
        "Update LinkedIn URL to include HTTPS protocol for parsing reliability."
      ]
    },
    rewrites: {
      summary: {
        original: "I am a graphic designer who has been designing websites and mobile applications for the last five years. I work in Figma and I am looking for a new role where I can lead systems projects.",
        optimized: "Surgical Senior Lead Designer with 5+ years optimizing multi-platform products. Proven record architecting scalable design frameworks and leading cross-functional teams to drive product efficiency."
      },
      experience: [
        {
          original: "I was responsible for making the design system for our company and I helped the team use it more often in their daily work.",
          optimized: "Architected and deployed a multi-platform Design System, increasing team velocity by 40% and ensuring 100% UI consistency across enterprise products."
        }
      ]
    },
    interview_prep: {
      technical: [
        {
          question: "How do you manage design token distribution across multi-platform engineering codebases?",
          difficulty: "Hard"
        },
        {
          question: "Explain how Next.js Server Components optimize initial page load speeds.",
          difficulty: "Medium"
        }
      ],
      behavioral: [
        {
          question: "Describe a time you faced friction from developers when introducing a new design system component. How did you resolve it?",
          difficulty: "Medium"
        }
      ],
      project_based: [
        {
          question: "Walk us through the Stripe dashboard architecture. What scaling issues did you solve during execution?",
          difficulty: "Hard"
        }
      ],
      hr: [
        {
          question: "Why do you want to join this specific product division at this point in your career?",
          difficulty: "Easy"
        }
      ]
    },
    career_roadmap: {
      current_level: "Senior UI/UX Engineer",
      target_level: "AI Product Architect",
      missing_skills: ["FastAPI", "Vector Databases", "LLM Fine-Tuning"],
      learning_path: [
        "Deconstruct backend REST endpoints using Python and FastAPI.",
        "Study RAG pipeline patterns and vector database schemas.",
        "Deploy production Next.js apps with direct LLM streaming APIs."
      ],
      recommended_technologies: ["FastAPI", "Next.js", "Weaviate", "LangChain"],
      suggested_certifications: ["AWS Certified Machine Learning - Specialty"],
      estimated_timeline: "6 Months"
    },
    linkedin_optimizer: {
      headline: "Senior UI Engineer | Next.js & Python Specialist",
      about: "Building structural user interfaces that match raw business objectives. Specialized in system architectures, component libraries, and full-stack performance optimization.",
      project_descriptions: [
        "Scale design system framework across 14 global product divisions, reducing frontend cycle time by 30%."
      ],
      featured_section: "Design Systems at Stripe (2024 V.2 Release)"
    }
  };
}
