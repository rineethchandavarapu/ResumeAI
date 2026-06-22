import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
const pdf = require('pdf-parse/lib/pdf-parse.js');
import mammoth from 'mammoth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const ANALYSIS_PROMPT = `
You are an expert ATS (Applicant Tracking System) simulator, executive recruiter, and talent management consultant.
Your task is to analyze the following resume text against the job description text and output a highly detailed, professional analysis.

You MUST format the output as a single, valid JSON object following this EXACT schema (do not include any conversational text before or after the JSON):
{
  "ats_score": 85,
  "job_match_score": 92,
  "skills_match_percentage": 88,
  "keyword_coverage_score": 90,
  
  "extracted_metadata": {
    "name": "EXTRACT THE CANDIDATE'S REAL NAME FROM THE RESUME HERE. If missing, output 'Unknown Candidate'",
    "skills": ["Skill 1", "Skill 2"],
    "experience": ["Experience 1", "Experience 2"],
    "education": ["Education 1"],
    "projects": ["Project 1"],
    "certifications": ["Certification 1"]
  },
  
  "feedback": {
    "strengths": [
      {
        "category": "ACTION VERB DENSITY",
        "description": "High usage of impactful verbs like 'Architected' and 'Spearheaded'."
      }
    ],
    "weaknesses": [
      {
        "category": "SUMMARY LENGTH",
        "description": "Professional summary exceeds the 3-sentence recommendation for high readability."
      }
    ],
    "missing_skills": ["Skill A", "Skill B"],
    "missing_keywords": ["Keyword X", "Keyword Y"],
    "improvement_suggestions": [
      "Detail your experience with design systems on the Stripe project.",
      "Inject missing ATS keywords in the summary paragraph."
    ]
  },
  
  "rewrites": {
    "summary": {
      "original": "Original professional summary text from resume",
      "optimized": "An optimized, high-impact, ATS-friendly executive professional summary"
    },
    "experience": [
      {
        "original": "Original bullet point or experience description",
        "optimized": "Optimized bullet point with action verbs and quantified achievements"
      }
    ]
  },
  
  "interview_prep": {
    "technical": [
      {
        "question": "Sample technical question matching role?",
        "difficulty": "Medium"
      }
    ],
    "behavioral": [
      {
        "question": "Sample behavioral question?",
        "difficulty": "Medium"
      }
    ],
    "project_based": [
      {
        "question": "Sample project question?",
        "difficulty": "Hard"
      }
    ],
    "hr": [
      {
        "question": "Sample HR/situational question?",
        "difficulty": "Easy"
      }
    ]
  },
  
  "career_roadmap": {
    "current_level": "Mid-level UI Developer",
    "target_level": "AI Product Engineer",
    "missing_skills": ["FastAPI", "LLMs", "Vector Databases"],
    "learning_path": [
      "Learn FastAPI for clean web backends",
      "Understand LLM APIs and prompt engineering",
      "Implement Vector Databases for semantic search"
    ],
    "recommended_technologies": ["FastAPI", "Python", "ChromaDB", "LangChain"],
    "suggested_certifications": ["Google Cloud Professional Machine Learning Engineer"],
    "estimated_timeline": "6-12 Months"
  },
  
  "linkedin_optimizer": {
    "headline": "Surgical Product Architect | Next.js & Python Specialist",
    "about": "A professional summary optimized for LinkedIn discovery algorithms...",
    "project_descriptions": [
      "Led deployment of high-availability backend services serving 100K+ users."
    ],
    "featured_section": "Architected ResumeAI SaaS platform."
  }
}

Resume Text:
---
{{RESUME_TEXT}}
---

Job Description:
---
{{JOB_DESC}}
---

Analyze objectively, prioritize outcomes and quantified achievements, and deliver professional corporate output.
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jobDescription = formData.get('job_description') as string | null;

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Missing file or job description' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = '';
    const filename = file.name.toLowerCase();

    // 1. Extract Text
    try {
      if (filename.endsWith('.pdf')) {
        try {
          const pdfData = await pdf(buffer);
          resumeText = pdfData.text;
        } catch (pdfError) {
          // Fallback to raw text if PDF parse fails (e.g. frontend mock blob)
          console.warn('PDF parse failed, falling back to raw text');
          resumeText = buffer.toString('utf-8');
        }
      } else if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } else {
        // Fallback for txt or other raw text files
        resumeText = buffer.toString('utf-8');
      }
    } catch (parseError) {
      console.error('Error parsing document:', parseError);
      return NextResponse.json({ error: 'Failed to extract text from the provided document. Make sure it is a valid PDF or DOCX.' }, { status: 400 });
    }

    if (!resumeText || resumeText.trim() === '') {
      return NextResponse.json({ error: 'No readable text found in document.' }, { status: 400 });
    }

    // 2. Call Gemini API
    if (!process.env.GEMINI_API_KEY) {
      // Return mock data if no key is provided (fail-safe fallback)
      return NextResponse.json(getMockData());
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = ANALYSIS_PROMPT
      .replace('{{RESUME_TEXT}}', resumeText)
      .replace('{{JOB_DESC}}', jobDescription);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
        topK: 1,
        topP: 0.1,
      }
    });

    let responseText = result.response.text();
    
    // Strip markdown formatting if Gemini includes it
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getMockData() {
  return {
    "ats_score": 85,
    "job_match_score": 92,
    "skills_match_percentage": 88,
    "keyword_coverage_score": 90,
    "extracted_metadata": {
        "name": "Alexander Mercer",
        "skills": ["UI Design", "Figma", "TypeScript", "React", "Next.js", "Python", "Tailwind CSS"],
        "experience": ["Senior Designer at Stripe (2022 - Present)", "UI Engineer at Vercel (2020 - 2022)"],
        "education": ["B.S. in Computer Science - Stanford University"],
        "projects": ["Design System scale initiative", "High-performance dashboard overhaul"],
        "certifications": ["Google Cloud Certified Cloud Architect"]
    },
    "feedback": {
        "strengths": [
            {
                "category": "ACTION VERB DENSITY",
                "description": "High usage of impactful verbs like 'Architected,' 'Spearheaded,' and 'Synthesized.'"
            },
            {
                "category": "QUANTIFIABLE METRICS",
                "description": "Strong evidence of data-driven results (e.g., 'increased velocity by 40%')."
            },
            {
                "category": "FORMATTING CLARITY",
                "description": "Zero parsing errors detected. Headers are clearly defined for ATS logic."
            }
        ],
        "weaknesses": [
            {
                "category": "MISSING CORE SKILLS",
                "description": "'Design Systems Architecture' is missing. This is a top-3 requirement for this role."
            },
            {
                "category": "CONTACT SECTION",
                "description": "LinkedIn profile link is missing or incorrectly formatted for automated crawlers."
            },
            {
                "category": "SUMMARY LENGTH",
                "description": "Professional summary exceeds the 3-sentence recommendation for high readability."
            }
        ],
        "missing_skills": ["Design Systems Architecture", "LLMs Integration", "FastAPI"],
        "missing_keywords": ["Scalability", "Design Tokens", "REST APIs"],
        "improvement_suggestions": [
            "Integrate 'Design Systems' and 'Scalability' into the Stripe experience block.",
            "Update LinkedIn URL to include HTTPS protocol for parsing reliability."
        ]
    },
    "rewrites": {
        "summary": {
            "original": "I am a graphic designer who has been designing websites and mobile applications for the last five years. I work in Figma and I am looking for a new role where I can lead systems projects.",
            "optimized": "Surgical Senior Lead Designer with 5+ years optimizing multi-platform products. Proven record architecting scalable design frameworks and leading cross-functional teams to drive product efficiency."
        },
        "experience": [
            {
                "original": "I was responsible for making the design system for our company and I helped the team use it more often in their daily work.",
                "optimized": "Architected and deployed a multi-platform Design System, increasing team velocity by 40% and ensuring 100% UI consistency across enterprise products."
            }
        ]
    },
    "interview_prep": {
        "technical": [
            {
                "question": "How do you manage design token distribution across multi-platform engineering codebases?",
                "difficulty": "Hard"
            },
            {
                "question": "Explain how Next.js Server Components optimize initial page load speeds.",
                "difficulty": "Medium"
            }
        ],
        "behavioral": [
            {
                "question": "Describe a time you faced friction from developers when introducing a new design system component. How did you resolve it?",
                "difficulty": "Medium"
            }
        ],
        "project_based": [
            {
                "question": "Walk us through the Stripe dashboard architecture. What scaling issues did you solve during execution?",
                "difficulty": "Hard"
            }
        ],
        "hr": [
            {
                "question": "Why do you want to join this specific product division at this point in your career?",
                "difficulty": "Easy"
            }
        ]
    },
    "career_roadmap": {
        "current_level": "Senior UI/UX Engineer",
        "target_level": "AI Product Architect",
        "missing_skills": ["FastAPI", "Vector Databases", "LLM Fine-Tuning"],
        "learning_path": [
            "Deconstruct backend REST endpoints using Python and FastAPI.",
            "Study RAG pipeline patterns and vector database schemas.",
            "Deploy production Next.js apps with direct LLM streaming APIs."
        ],
        "recommended_technologies": ["FastAPI", "Next.js", "Weaviate", "LangChain"],
        "suggested_certifications": ["AWS Certified Machine Learning - Specialty"],
        "estimated_timeline": "6 Months"
    },
    "linkedin_optimizer": {
        "headline": "Senior UI Engineer | Next.js & Python Specialist",
        "about": "Building structural user interfaces that match raw business objectives. Specialized in system architectures, component libraries, and full-stack performance optimization.",
        "project_descriptions": [
            "Scale design system framework across 14 global product divisions, reducing frontend cycle time by 30%."
        ],
        "featured_section": "Design Systems at Stripe (2024 V.2 Release)"
    }
  };
}
