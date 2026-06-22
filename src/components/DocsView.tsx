import React, { useState, useEffect, useRef } from 'react';
import PdfThumbnail from './PdfThumbnail';

const NavItem = ({ id, label, activeSection, scrollTo }: { id: string, label: string, activeSection: string, scrollTo: (id: string) => void }) => {
  const isActive = activeSection === id;
  return (
    <li>
      <button 
        onClick={() => scrollTo(id)} 
        className={`transition-colors cursor-pointer text-left w-full flex items-center gap-2 ${isActive ? 'text-primary font-bold' : 'text-secondary hover:text-primary'}`}
      >
        {isActive && <span className="w-1.5 h-1.5 bg-primary rounded-sm inline-block"></span>}
        <span className={isActive ? '' : 'pl-3'}>{label}</span>
      </button>
    </li>
  );
};

export default function DocsView() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    const sections = document.querySelectorAll('main section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const touchTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef<boolean>(false);

  const handleDownload = (pdfUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpen = (pdfUrl: string) => {
    if (!longPressTriggered.current) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handleTouchStart = (pdfUrl: string, fileName: string) => {
    longPressTriggered.current = false;
    touchTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      handleDownload(pdfUrl, fileName);
    }, 800); // 800ms long press
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) {
      clearTimeout(touchTimer.current);
    }
  };

  return (
    <div className="flex flex-1 bg-surface text-on-surface w-full">
      {/* Sidebar */}
      <aside className="w-72 border-r border-outline-variant bg-surface-container-lowest overflow-y-auto hidden md:block sticky top-16 h-[calc(100vh-4rem)]">
        <nav className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-label-md text-xs font-bold text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> Browse docs
            </h3>
            <ul className="space-y-3 font-body-md text-sm ml-4">
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="introduction" label="Introduction" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="getting-started" label="Getting Started" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="support" label="Support" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="sponsoring" label="Sponsoring ResumeAI" />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-label-md text-xs font-bold text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> Setup
            </h3>
            <ul className="space-y-3 font-body-md text-sm ml-4">
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="installation" label="Installation" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="docker-installation" label="Docker Installation" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="docker-ollama" label="Docker + Ollama Setup" />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-label-md text-xs font-bold text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> Usage
            </h3>
            <ul className="space-y-3 font-body-md text-sm ml-4">
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="features" label="Features" />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-label-md text-xs font-bold text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> Community
            </h3>
            <ul className="space-y-3 font-body-md text-sm ml-4">
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="contributing" label="Contributing" />
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-label-md text-xs font-bold text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> Resources
            </h3>
            <ul className="space-y-3 font-body-md text-sm ml-4">
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="pdf-templates" label="PDF Templates" />
              <NavItem activeSection={activeSection} scrollTo={scrollTo} id="language-support" label="Language Support" />
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-surface px-6 py-8 md:p-16 relative w-full min-w-0">
        <div className="max-w-4xl mx-auto space-y-24 md:space-y-32 pb-32">
          
          {/* --- BROWSE DOCS --- */}
          
          <section id="introduction" className="scroll-mt-8">
            <p className="font-body-lg text-xl md:text-2xl text-secondary mb-12 max-w-2xl leading-relaxed">
              Learn how ResumeAI works and what you can do with it
            </p>
            
            <div className="mb-12 space-y-4">
              <h2 className="font-headline-md text-3xl font-bold text-primary border-b border-outline-variant pb-4">What is ResumeAI?</h2>
              <p className="font-body-md text-secondary leading-relaxed">
                ResumeAI is an AI-powered resume tailoring app. Start from a master resume, add a job description, generate a tailored version, then refine everything in the builder before you export.
              </p>
              <p className="font-body-md text-secondary leading-relaxed mt-4">
                It supports the full application workflow:
              </p>
              <ul className="list-disc list-inside font-body-md text-secondary space-y-2 ml-4">
                <li>Upload or build a master resume</li>
                <li>Tailor that resume for a specific job description</li>
                <li>Review JD Match with highlighted keywords and a match percentage</li>
                <li>Edit content in the Resume Builder</li>
                <li>Generate cover letters and outreach messages from the same job context</li>
                <li>Export polished PDFs</li>
              </ul>
            </div>

            <div className="mb-12 space-y-4">
              <h2 className="font-headline-md text-3xl font-bold text-primary border-b border-outline-variant pb-4">AI Providers and Privacy</h2>
              <p className="font-body-md text-secondary leading-relaxed">
                ResumeAI supports these providers:
              </p>
              <ul className="list-disc list-inside font-body-md text-secondary space-y-2 ml-4">
                <li>OpenAI</li>
                <li>Anthropic</li>
                <li>OpenRouter</li>
                <li>Google Gemini</li>
                <li>DeepSeek</li>
                <li>Ollama</li>
              </ul>
              <p className="font-body-md text-secondary leading-relaxed mt-4">
                You can use cloud models or keep everything local with Ollama. The Ollama path is the privacy-first option when you want resume data to stay on your machine.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo('installation')} className="bg-primary text-on-primary w-full sm:w-auto px-8 py-4 font-label-md font-bold tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center text-sm shadow-sm">
                Installation Guide
              </button>
              <a href="#" className="bg-surface-container text-primary border border-outline-variant w-full sm:w-auto px-8 py-4 font-label-md font-bold tracking-widest uppercase rounded-sm hover:bg-surface-container-low transition-colors flex items-center justify-center text-sm shadow-sm">
                View on Github
              </a>
            </div>
          </section>

          <section id="getting-started" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => scrollTo('installation')} className="block group text-left w-full">
                <div className="bg-surface-container border border-outline-variant p-8 h-full rounded-sm transition-all hover:bg-surface-container-low hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary">rocket_launch</span>
                  </div>
                  <h3 className="font-headline-sm text-2xl font-bold text-primary mb-3">Quick Start</h3>
                  <p className="font-body-md text-secondary mb-8">Jump right into ResumeAI and learn the basics of local AI processing.</p>
                  <div className="text-primary flex items-center gap-2 font-label-md font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">
                    Read more <span>→</span>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section id="support" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Support</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-4">
              If you run into issues while setting up ResumeAI, we recommend checking out the GitHub issues page. Since we rely on local LLM inferencing, most common issues revolve around Docker memory limits or Ollama driver configurations.
            </p>
          </section>

          <section id="sponsoring" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Sponsoring ResumeAI</h2>
            <div className="bg-surface-container border border-outline-variant p-8 rounded-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">favorite</span>
              </div>
              <p className="font-body-md text-secondary mb-6">
                ResumeAI is completely open-source. Sponsoring helps cover the domain, hosting for demo services, and dedicated developer time. Support the project and get visibility for your company!
              </p>
              <a href="mailto:rineeth.chandavarapu@gmail.com" className="inline-block bg-primary text-on-primary px-6 py-3 font-label-md font-bold tracking-wider rounded-sm hover:opacity-90">
                Become a Sponsor
              </a>
            </div>
          </section>

          {/* --- SETUP --- */}

          <section id="installation" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Installation</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-6">
              To run ResumeAI locally, you will need Node.js (v18+) and npm.
            </p>
            <pre className="bg-surface-container-high text-primary p-6 rounded-sm font-mono text-sm overflow-x-auto border border-outline-variant">
              <code>
                git clone https://github.com/your-username/ResumeAI.git{"\n"}
                cd ResumeAI{"\n"}
                npm install{"\n"}
                npm run dev
              </code>
            </pre>
          </section>

          <section id="docker-installation" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Docker Installation</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-6">
              We highly recommend using Docker to avoid environment-specific issues. Our provided `docker-compose.yml` spins up both the frontend and necessary backend services.
            </p>
            <pre className="bg-surface-container-high text-primary p-6 rounded-sm font-mono text-sm overflow-x-auto border border-outline-variant">
              <code>
                docker-compose up -d --build
              </code>
            </pre>
          </section>

          <section id="docker-ollama" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Docker + Ollama Setup</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-4">
              To enable 100% private, local AI resume analysis, ResumeAI integrates seamlessly with Ollama.
            </p>
            <ul className="list-disc list-inside font-body-md text-secondary space-y-2 mb-6">
              <li>Install Ollama on your host machine.</li>
              <li>Pull a model (e.g., `ollama run mistral`).</li>
              <li>Ensure the Docker container can reach your host machine&apos;s Ollama port (usually `http://host.docker.internal:11434`).</li>
            </ul>
          </section>

          {/* --- USAGE --- */}

          <section id="features" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">Deterministic Filtering</h4>
                <p className="font-body-md text-secondary text-sm">See exactly how Applicant Tracking Systems parse and rank your resume data.</p>
              </div>
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">Local AI Analysis</h4>
                <p className="font-body-md text-secondary text-sm">Analyze your resume entirely locally without sending data to third-party APIs.</p>
              </div>
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">PDF Exporting</h4>
                <p className="font-body-md text-secondary text-sm">Generate beautiful, ATS-optimized PDF resumes from your data instantly.</p>
              </div>
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">Keyword Optimization</h4>
                <p className="font-body-md text-secondary text-sm">Identify critical missing keywords based on the job description you are targeting.</p>
              </div>
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">Job Matcher</h4>
                <p className="font-body-md text-secondary text-sm">Compare your resume directly against job postings to get a compatibility score.</p>
              </div>
              <div className="p-6 border border-outline-variant rounded-sm hover:shadow-md transition-shadow bg-surface-container-lowest">
                <h4 className="font-bold text-primary mb-2">Open Source</h4>
                <p className="font-body-md text-secondary text-sm">100% open-source codebase built with modern tools like Next.js and Tailwind CSS.</p>
              </div>
            </div>
          </section>

          {/* --- COMMUNITY --- */}

          <section id="contributing" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Contributing</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-4">
              We welcome contributions! Whether it&apos;s improving the documentation, adding new templates, or optimizing the ATS parsing logic, please open a PR on our GitHub repository.
            </p>
          </section>

          {/* --- RESOURCES --- */}

          <section id="pdf-templates" className="scroll-mt-8 space-y-12">
            <div>
              <h2 className="font-headline-md text-3xl font-bold text-primary mb-2 border-b border-outline-variant pb-4">PDF Templates</h2>
              <p className="font-body-md text-secondary leading-relaxed mt-4">
                Resume templates and formatting options.
              </p>
            </div>

            <div>
              <h3 className="font-headline-md text-2xl font-bold text-primary mb-4">Available Templates</h3>
              <p className="font-body-md text-secondary leading-relaxed">
                ResumeAI includes four resume templates.
              </p>
            </div>

            {/* Template 1 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-primary text-xl">Swiss Single Column</h4>
                <p className="font-body-md text-secondary mt-1">The default template. Traditional single-column layout that works for most applications.</p>
              </div>
              <div 
                className="mt-6 border border-outline-variant rounded-sm overflow-hidden bg-surface-container shadow-sm aspect-[8.5/11] w-full max-w-2xl relative cursor-pointer group"
                onClick={() => handleOpen('/sbcyynmtpnyd.pdf')}
                onDoubleClick={() => handleDownload('/sbcyynmtpnyd.pdf', 'Swiss_Single_Column.pdf')}
                onTouchStart={() => handleTouchStart('/sbcyynmtpnyd.pdf', 'Swiss_Single_Column.pdf')}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors" title="Single tap to open, double tap (or long press on mobile) to download">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white font-label-md px-6 py-3 rounded-full transition-opacity backdrop-blur-sm pointer-events-none flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open
                  </div>
                </div>
                <PdfThumbnail url="/sbcyynmtpnyd.pdf" />
              </div>
            </div>

            {/* Template 2 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-primary text-xl">Swiss Two Column</h4>
                <p className="font-body-md text-secondary mt-1">A two-column layout that gives supporting details their own side column.</p>
              </div>
              <div 
                className="mt-6 border border-outline-variant rounded-sm overflow-hidden bg-surface-container shadow-sm aspect-[8.5/11] w-full max-w-2xl relative cursor-pointer group"
                onClick={() => handleOpen('/swiss2.pdf')}
                onDoubleClick={() => handleDownload('/swiss2.pdf', 'Swiss_Two_Column.pdf')}
                onTouchStart={() => handleTouchStart('/swiss2.pdf', 'Swiss_Two_Column.pdf')}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors" title="Single tap to open, double tap (or long press on mobile) to download">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white font-label-md px-6 py-3 rounded-full transition-opacity backdrop-blur-sm pointer-events-none flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open
                  </div>
                </div>
                <PdfThumbnail url="/swiss2.pdf" />
              </div>
            </div>

            {/* Template 3 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-primary text-xl">Modern</h4>
                <p className="font-body-md text-secondary mt-1">A contemporary single-column layout with a cleaner modern presentation.</p>
              </div>
              <div 
                className="mt-6 border border-outline-variant rounded-sm overflow-hidden bg-surface-container shadow-sm aspect-[210/297] w-full max-w-2xl relative cursor-pointer group"
                onClick={() => handleOpen('/pdf2.pdf')}
                onDoubleClick={() => handleDownload('/pdf2.pdf', 'Modern.pdf')}
                onTouchStart={() => handleTouchStart('/pdf2.pdf', 'Modern.pdf')}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors" title="Single tap to open, double tap (or long press on mobile) to download">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white font-label-md px-6 py-3 rounded-full transition-opacity backdrop-blur-sm pointer-events-none flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open
                  </div>
                </div>
                <PdfThumbnail url="/pdf2.pdf" />
              </div>
            </div>

            {/* Template 4 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-primary text-xl">Modern Two Column</h4>
                <p className="font-body-md text-secondary mt-1">A contemporary two-column layout for denser resumes that still need strong structure.</p>
              </div>
              <div 
                className="mt-6 border border-outline-variant rounded-sm overflow-hidden bg-surface-container shadow-sm aspect-[210/297] w-full max-w-2xl relative cursor-pointer group"
                onClick={() => handleOpen('/modern2.pdf')}
                onDoubleClick={() => handleDownload('/modern2.pdf', 'Modern_Two_Column.pdf')}
                onTouchStart={() => handleTouchStart('/modern2.pdf', 'Modern_Two_Column.pdf')}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors" title="Single tap to open, double tap (or long press on mobile) to download">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white font-label-md px-6 py-3 rounded-full transition-opacity backdrop-blur-sm pointer-events-none flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open
                  </div>
                </div>
                <PdfThumbnail url="/modern2.pdf" />
              </div>
            </div>

            <div>
              <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">Formatting Controls</h3>
              <p className="font-body-md text-secondary leading-relaxed mb-6">
                All template changes are previewed live in the builder before export.
              </p>
              <div className="overflow-x-auto border border-outline-variant rounded-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant">
                      <th className="p-4 font-bold text-primary">Control</th>
                      <th className="p-4 font-bold text-primary">What It Does</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant bg-white font-body-md text-secondary">
                    <tr><td className="p-4 font-medium text-on-surface">Page Size</td><td className="p-4">Choose A4 or US Letter</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Margins</td><td className="p-4">Adjust page margins</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Section Spacing</td><td className="p-4">Control space between major sections</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Item Spacing</td><td className="p-4">Control space between items inside sections</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Line Height</td><td className="p-4">Adjust readability and density</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Base Font Size</td><td className="p-4">Scale body copy</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Header Scale</td><td className="p-4">Scale section headers relative to body text</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Header Font Family</td><td className="p-4">Change heading typography</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Body Font Family</td><td className="p-4">Change body typography</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Compact Mode</td><td className="p-4">Reduce spacing for denser resumes</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Contact Icons</td><td className="p-4">Show or hide contact icons</td></tr>
                    <tr><td className="p-4 font-medium text-on-surface">Accent Colors</td><td className="p-4">Available on modern templates</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-headline-md text-2xl font-bold text-primary mb-2">PDF Export</h3>
              <p className="font-body-md text-secondary leading-relaxed">
                The exported PDF follows the live preview. Local PDF generation depends on Playwright and Chromium, so complete the Playwright install step from Installation before exporting locally.
              </p>
            </div>

            <div>
              <h3 className="font-headline-md text-2xl font-bold text-primary mb-6">Choosing a Template</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Use Swiss layouts when:</h4>
                  <ul className="list-disc list-inside font-body-md text-secondary space-y-1 ml-2">
                    <li>you want a more traditional resume presentation</li>
                    <li>you need a minimal, structured format</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Use modern layouts when:</h4>
                  <ul className="list-disc list-inside font-body-md text-secondary space-y-1 ml-2">
                    <li>you want a more contemporary look</li>
                    <li>you want template accent colors</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-primary text-lg mb-2">Use two-column layouts when:</h4>
                  <ul className="list-disc list-inside font-body-md text-secondary space-y-1 ml-2">
                    <li>you need more space for supporting information</li>
                    <li>you want skills, links, or metadata separated from the main experience column</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="language-support" className="scroll-mt-8">
            <h2 className="font-headline-md text-3xl font-bold text-primary mb-6 border-b border-outline-variant pb-4">Language Support</h2>
            <p className="font-body-md text-secondary leading-relaxed mb-4">
              ResumeAI supports both multilingual UI and multilingual generated content, including:
            </p>
            <ul className="list-disc list-inside font-body-md text-secondary space-y-2 ml-4 mb-6">
              <li>English</li>
              <li>Spanish</li>
              <li>Chinese</li>
              <li>Japanese</li>
              <li>Portuguese (Brazilian)</li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  );
}
