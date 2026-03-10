import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, Send, Loader2, AlertCircle, Sparkles, 
  MessageSquare, UserCheck, Brain, Info, 
  CheckCircle2, Zap, Shield, HandMetal, Flame, Heart,
  History, PlayCircle, ChevronRight, ArrowRight, RotateCcw
} from 'lucide-react';
import { personalityTypes } from '../data/personalityTypes';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from 'html2canvas';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisResult {
  primaryType: string;
  confidence: number;
  secondaryType: string | null;
  reasoning: string;
  indicators: string[];
  recommendedNextSteps: string[];
  whatToAvoid: string[];
  relationshipAdvice: {
    vision: string;
    investment: string;
    potential: string;
  };
  freakDynamics: {
    kink: string;
    threesomes: string;
    worship: string;
  };
  darkMindBreakdown: string;
  behavioralBlueprint: string;
}

interface AnalysisHistory extends AnalysisResult {
  id: string;
  date: string;
  scenarioSummary: string;
}

const practiceScenarios = [
  {
    id: 1,
    text: "She's wearing a modest but elegant dress. When you talk to her, she's polite but keeps her answers short and looks around the room a lot. She doesn't seem impressed when you compliment her outfit.",
    correctType: "TDI",
    explanation: "Modest dress and looking around (Observer) points to Denier. Unaffected by compliments and short attention span points to Tester. The elegant/modest combo often aligns with Idealist."
  },
  {
    id: 2,
    text: "She's the life of the party, talking to everyone. She has a visible tattoo and playfully punches your arm when you tease her. She gets bored quickly if the conversation gets too deep.",
    correctType: "TJI",
    explanation: "High energy, short attention span (Tester). Tattoos and aggressive touch (Justifier). Focus on fun over deep connection (Idealist)."
  },
  {
    id: 3,
    text: "She asks you a lot of questions about your career and goals. She's dressed very practically and insists on splitting the bill. She seems a bit guarded when you try to flirt.",
    correctType: "NDR",
    explanation: "Focus on goals/career and splitting bill (Realist). Guarded about flirting (Denier). Asking deep questions and focusing on you (Investor)."
  }
];

export default function CalibrationPage() {
  const [mode, setMode] = React.useState<'ai' | 'manual' | 'history' | 'practice'>('ai');
  
  // AI Oracle State
  const [structuredInput, setStructuredInput] = React.useState({
    eyeContact: '',
    conversationTopic: '',
    bodyLanguage: '',
    clothingStyle: '',
    additionalNotes: ''
  });

  const clearForm = () => {
    setStructuredInput({
      eyeContact: '',
      conversationTopic: '',
      bodyLanguage: '',
      clothingStyle: '',
      additionalNotes: ''
    });
    setAnalysis(null);
    setError(null);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const analysisRef = React.useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (!analysisRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(analysisRef.current, {
        backgroundColor: '#0a0508',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `epimetheus-analysis-${analysis?.primaryType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    } finally {
      setIsCapturing(false);
    }
  };
  
  // History State
  const [history, setHistory] = React.useState<AnalysisHistory[]>(() => {
    const saved = localStorage.getItem('oracleHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Practice State
  const [currentScenarioIdx, setCurrentScenarioIdx] = React.useState(0);
  const [selectedType, setSelectedType] = React.useState('');
  const [showPracticeResult, setShowPracticeResult] = React.useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = React.useState(false);
  const [dynamicScenario, setDynamicScenario] = React.useState<{text: string, correctType: string, explanation: string} | null>(null);

  const generateDynamicScenario = async () => {
    setIsGeneratingScenario(true);
    setShowPracticeResult(false);
    setSelectedType('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model: model,
        contents: "Generate a realistic social scenario for a woman that fits one of the 8 EPIMETHEUS types (TDI, TJI, TDR, TJR, NDI, NJI, NDR, NJR). Provide the scenario text, the correct type, and a brief explanation of why it fits that type based on the 3 axes (Time, Sex, Relationship).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              correctType: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["text", "correctType", "explanation"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      setDynamicScenario(result);
    } catch (err) {
      console.error("Failed to generate scenario:", err);
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  React.useEffect(() => {
    localStorage.setItem('oracleHistory', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    const hasInput = Object.values(structuredInput).some(val => typeof val === 'string' && val.trim() !== '');
    if (!hasInput) {
      setError("Please provide at least some details about the scenario.");
      return;
    }
    
    setIsLoading(true);
    setIsScanning(true);
    setError(null);

    const fullScenario = `
      Eye Contact: ${structuredInput.eyeContact || 'Not specified'}
      Conversation Topic: ${structuredInput.conversationTopic || 'Not specified'}
      Body Language: ${structuredInput.bodyLanguage || 'Not specified'}
      Clothing Style: ${structuredInput.clothingStyle || 'Not specified'}
      Additional Notes: ${structuredInput.additionalNotes || 'None'}
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3.1-pro-preview";

      const response = await ai.models.generateContent({
        model: model,
        contents: `Scenario Details:
        ${fullScenario}`,
        config: {
          systemInstruction: `Analyze the following structured social scenario using the EPIMETHEUS personality profiling system by Yame Coaching.
        
        The system uses 3 axes to define 8 personality types:
        1. Time Line: Tester (T) vs Investor (N). Testers are harder to get, Investors are easier to get but harder to keep.
        2. Sex Line: Denier (D) vs Justifier (J). Deniers need a reason for sex, Justifiers need a reason NOT to have sex.
        3. Relationship Line: Realist (R) vs Idealist (I). Realists are logical and career-focused, Idealists are romantic and imaginative.

        Each type has a specific Emotional Trigger Sequence (ETS) that must be followed:
        - TDI: Intrigue -> Arousal -> Comfort -> Devotion
        - TJI: Intrigue -> Arousal -> Devotion -> Comfort
        - TDR: Devotion -> Comfort -> Arousal -> Intrigue
        - TJR: Intrigue -> Arousal -> Devotion -> Comfort
        - NDI: Arousal -> Intrigue -> Comfort -> Devotion
        - NJI: Arousal -> Intrigue -> Devotion -> Comfort
        - NDR: Intrigue -> Comfort -> Arousal -> Devotion
        - NJR: Comfort -> Arousal -> Intrigue -> Devotion

        The 8 Types are:
        - TDI: The Playette (Tester, Denier, Idealist)
        - TJI: The Social Butterfly (Tester, Justifier, Idealist)
        - TDR: The Private Dancer (Tester, Denier, Realist)
        - TJR: The Seductress (Tester, Justifier, Realist)
        - NDI: The Hopeful Romantic (Investor, Denier, Idealist)
        - NJI: The Cinderella (Investor, Justifier, Idealist)
        - NDR: The Connoisseur (Investor, Denier, Realist)
        - NJR: The Modern Woman (Investor, Justifier, Realist)

        Provide a detailed analysis in JSON format. 
        CRITICAL: The tone must be mysterious, insightful, and professional. Avoid typical AI phrases like "Based on the scenario" or "It appears that". Write as if you are a master profiler. Use natural punctuation.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryType: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              secondaryType: { type: Type.STRING, nullable: true },
              reasoning: { type: Type.STRING },
              indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              whatToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              relationshipAdvice: {
                type: Type.OBJECT,
                properties: {
                  vision: { type: Type.STRING },
                  investment: { type: Type.STRING },
                  potential: { type: Type.STRING }
                },
                required: ["vision", "investment", "potential"]
              },
              freakDynamics: {
                type: Type.OBJECT,
                properties: {
                  kink: { type: Type.STRING },
                  threesomes: { type: Type.STRING },
                  worship: { type: Type.STRING }
                },
                required: ["kink", "threesomes", "worship"]
              },
              darkMindBreakdown: { type: Type.STRING },
              behavioralBlueprint: { type: Type.STRING }
            },
            required: ["primaryType", "confidence", "reasoning", "indicators", "recommendedNextSteps", "whatToAvoid", "relationshipAdvice", "freakDynamics", "darkMindBreakdown", "behavioralBlueprint"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAnalysis(result);
      
      const newHistoryItem: AnalysisHistory = {
        ...result,
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        scenarioSummary: structuredInput.additionalNotes.slice(0, 50) || structuredInput.clothingStyle || 'Guided Analysis'
      };
      setHistory([newHistoryItem, ...history]);
      
    } catch (err) {
      setError('The Oracle is currently unavailable. Please check your API key or try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const manualClues = [
    {
      axis: 'Time Line',
      options: [
        { label: 'Tester (T)', clues: ['Shorter attention span', 'Multitasking/Texting', 'Unaffected by compliments', 'Surrounded by male friends', 'Changes topics rapidly'] },
        { label: 'Investor (N)', clues: ['Takes compliments seriously', 'Needs focused attention', 'Responds with deep eye contact', 'Asks about your future/goals'] }
      ]
    },
    {
      axis: 'Sex Line',
      options: [
        { label: 'Denier (D)', clues: ['Careful with health/safety', 'Religious/Conservative background', 'Shy about sex talk', 'Consistent with upbringing', 'Avoids aggressive touch'] },
        { label: 'Justifier (J)', clues: ['Has tattoos', 'Takes risks with safety', 'Talks about sex openly', 'Comfortable with aggressive touch', 'Rebels against upbringing'] }
      ]
    },
    {
      axis: 'Relationship Line',
      options: [
        { label: 'Realist (R)', clues: ['Career/Studies priority', 'Believes women are equals', 'Takes care of others', 'Flakes because of work', 'Had weaker male figures'] },
        { label: 'Idealist (I)', clues: ['Affluent/Spoiled upbringing', 'Plans wedding early', 'Expects to be pampered', 'Flakes to hang out with guys', 'Vivid imagination'] }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Scanning Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-mystic-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full border-4 border-accent-primary/30 flex items-center justify-center"
              >
                <Brain className="w-12 h-12 text-accent-primary animate-pulse" />
              </motion.div>
              
              {/* Scanning Line */}
              <motion.div
                animate={{ 
                  top: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-accent-primary shadow-[0_0_15px_rgba(255,75,107,0.8)] z-10"
              />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center space-y-4"
            >
              <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Scanning Archetype</h3>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Consulting The Oracle...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Calibration Lab
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">The Oracle</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Advanced personality analysis and type calibration. Use the AI Oracle, practice your skills, or review past analyses.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setMode('ai')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all border flex items-center gap-2",
            mode === 'ai' ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
          )}
        >
          <Brain className="w-4 h-4" /> AI Oracle
        </button>
        <button
          onClick={() => setMode('manual')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all border flex items-center gap-2",
            mode === 'manual' ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
          )}
        >
          <UserCheck className="w-4 h-4" /> Manual
        </button>
        <button
          onClick={() => setMode('practice')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all border flex items-center gap-2",
            mode === 'practice' ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
          )}
        >
          <PlayCircle className="w-4 h-4" /> Practice
        </button>
        <button
          onClick={() => setMode('history')}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all border flex items-center gap-2",
            mode === 'history' ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
          )}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {mode === 'ai' && (
        <div className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-primary" />
                Scenario Parameters
              </h3>
              <button 
                onClick={clearForm}
                className="text-xs font-bold text-slate-500 hover:text-accent-primary transition-colors uppercase tracking-widest"
              >
                Clear Form
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Eye Contact
                </label>
                <select 
                  value={structuredInput.eyeContact}
                  onChange={(e) => setStructuredInput({...structuredInput, eyeContact: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="Intense / Holding gaze" className="bg-slate-900">Intense / Holding gaze</option>
                  <option value="Shy / Looking down" className="bg-slate-900">Shy / Looking down</option>
                  <option value="Avoiding / Looking around room" className="bg-slate-900">Avoiding / Looking around room</option>
                  <option value="Normal / Conversational" className="bg-slate-900">Normal / Conversational</option>
                  <option value="Rapid blinking / Nervous" className="bg-slate-900">Rapid blinking / Nervous</option>
                  <option value="Squinting / Skeptical" className="bg-slate-900">Squinting / Skeptical</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Conversation Topic
                </label>
                <select 
                  value={structuredInput.conversationTopic}
                  onChange={(e) => setStructuredInput({...structuredInput, conversationTopic: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="Work / Career / Goals" className="bg-slate-900">Work / Career / Goals</option>
                  <option value="Family / Friends / Relationships" className="bg-slate-900">Family / Friends / Relationships</option>
                  <option value="Hobbies / Fun / Travel" className="bg-slate-900">Hobbies / Fun / Travel</option>
                  <option value="Deep / Philosophical" className="bg-slate-900">Deep / Philosophical</option>
                  <option value="Small Talk / Surface Level" className="bg-slate-900">Small Talk / Surface Level</option>
                  <option value="Complaining / Negative" className="bg-slate-900">Complaining / Negative</option>
                  <option value="Boasting / Self-centered" className="bg-slate-900">Boasting / Self-centered</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Body Language
                </label>
                <select 
                  value={structuredInput.bodyLanguage}
                  onChange={(e) => setStructuredInput({...structuredInput, bodyLanguage: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="Open / Relaxed / Leaning in" className="bg-slate-900">Open / Relaxed / Leaning in</option>
                  <option value="Closed / Guarded / Arms crossed" className="bg-slate-900">Closed / Guarded / Arms crossed</option>
                  <option value="Fidgety / Distracted / Restless" className="bg-slate-900">Fidgety / Distracted / Restless</option>
                  <option value="Touchy / Flirty / Playful" className="bg-slate-900">Touchy / Flirty / Playful</option>
                  <option value="Mirroring your movements" className="bg-slate-900">Mirroring your movements</option>
                  <option value="Rigid / Professional / Stiff" className="bg-slate-900">Rigid / Professional / Stiff</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Clothing Style
                </label>
                <select 
                  value={structuredInput.clothingStyle}
                  onChange={(e) => setStructuredInput({...structuredInput, clothingStyle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <option value="" className="bg-slate-900">Select...</option>
                  <option value="Modest / Conservative" className="bg-slate-900">Modest / Conservative</option>
                  <option value="Trendy / Fashionable" className="bg-slate-900">Trendy / Fashionable</option>
                  <option value="Classy / Elegant" className="bg-slate-900">Classy / Elegant</option>
                  <option value="Casual / Practical / Tomboy" className="bg-slate-900">Casual / Practical / Tomboy</option>
                  <option value="Revealing / Sexy / Edgy" className="bg-slate-900">Revealing / Sexy / Edgy</option>
                  <option value="Artistic / Eccentric / Unique" className="bg-slate-900">Artistic / Eccentric / Unique</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Additional Notes (Optional)</label>
              <textarea
                value={structuredInput.additionalNotes}
                onChange={(e) => setStructuredInput({...structuredInput, additionalNotes: e.target.value})}
                placeholder="Any other specific behaviors, quotes, or context..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full py-4 rounded-xl accent-gradient text-white font-bold shadow-xl shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consulting The Oracle...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze Scenario
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              {error}
            </motion.div>
          )}

          {analysis && (
            <motion.div
              ref={analysisRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-wrap justify-between items-center gap-4">
                <button
                  onClick={clearForm}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Analysis
                </button>
                <button
                  onClick={handleSaveImage}
                  disabled={isCapturing}
                  className="px-4 py-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold hover:bg-accent-primary/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isCapturing ? 'Capturing...' : 'Save Analysis as Image'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 text-center space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Type</h4>
                  <div className="text-5xl font-black text-accent-primary italic">{analysis.primaryType}</div>
                </div>
                <div className="glass-card p-8 text-center space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidence</h4>
                  <div className="text-5xl font-black text-white italic">{analysis.confidence}%</div>
                </div>
                <div className="glass-card p-8 text-center space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secondary Type</h4>
                  <div className="text-5xl font-black text-slate-500 italic">{analysis.secondaryType || 'N/A'}</div>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Info className="w-6 h-6 text-accent-primary" />
                  Oracle's Reasoning
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {analysis.reasoning}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 space-y-4">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <Target className="w-5 h-5 text-accent-primary" />
                    Key Indicators Found
                  </h4>
                  <ul className="space-y-3">
                    {analysis.indicators.map((indicator, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-8 space-y-4">
                  <h4 className="text-xl font-bold flex items-center gap-3">
                    <Zap className="w-5 h-5 text-accent-primary" />
                    Recommended Next Steps
                  </h4>
                  <ul className="space-y-3">
                    {analysis.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-8 space-y-4">
                  <h4 className="text-xl font-bold flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    What to Avoid
                  </h4>
                  <ul className="space-y-3">
                    {analysis.whatToAvoid.map((avoid, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        {avoid}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-accent-primary">
                  <Shield className="w-6 h-6" />
                  Relationship Strategy: Total Devotion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vision</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.relationshipAdvice.vision}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Investment</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.relationshipAdvice.investment}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Potential</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.relationshipAdvice.potential}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-purple-400">
                  <HandMetal className="w-6 h-6" />
                  Freak Dynamics: Bring Out the Freak
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kink & Novelty</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.freakDynamics.kink}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Threesomes</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.freakDynamics.threesomes}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Worship</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{analysis.freakDynamics.worship}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-red-400">
                  <Brain className="w-6 h-6" />
                  Dark Mind Breakdown
                </h3>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {analysis.darkMindBreakdown}
                </p>
              </div>

              <div className="glass-card p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-accent-primary">
                  <Target className="w-6 h-6" />
                  Behavioral Blueprint
                </h3>
                <div className="space-y-4">
                  {analysis.behavioralBlueprint.split(/\d+\.\s+/).filter(Boolean).map((step, i) => {
                    const parts = step.split(/:\s*/);
                    if (parts.length >= 2) {
                      const title = parts[0].replace(/\*\*/g, '').trim();
                      const content = parts.slice(1).join(': ').trim();
                      return (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <h4 className="font-bold text-accent-primary mb-2">{title}</h4>
                          <p className="text-slate-300">{content}</p>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-slate-300">{step.trim()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {manualClues.map((axis) => (
              <div key={axis.axis} className="space-y-6">
                <h3 className="text-xl font-bold text-accent-primary border-b border-white/10 pb-2">{axis.axis}</h3>
                {axis.options.map((option) => (
                  <div key={option.label} className="glass-card p-6 space-y-4">
                    <h4 className="font-bold text-lg text-white">{option.label}</h4>
                    <ul className="space-y-2">
                      {option.clues.map((clue, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                          {clue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="glass-card p-8 bg-accent-primary/5 border-accent-primary/20">
            <h3 className="text-xl font-bold mb-4">How to Mind Read</h3>
            <p className="text-slate-400 leading-relaxed">
              Identify one dominant trait from each axis. Combine the letters to find her 3-letter type. 
              For example, if she is a Tester, a Denier, and a Realist, her type is TDR (The Private Dancer).
              Use the Encyclopedia to look up the specific strategy for that type.
            </p>
          </div>
        </div>
      )}

      {mode === 'history' && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <History className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-xl font-bold text-white">No History Yet</h3>
              <p className="text-slate-400">Use the AI Oracle to analyze scenarios and they will be saved here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => {
                setAnalysis(item);
                setMode('ai');
              }}>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-accent-primary italic">{item.primaryType}</span>
                    <span className="text-sm text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2">{item.scenarioSummary}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-500 uppercase">Confidence</div>
                    <div className="text-xl font-bold text-white">{item.confidence}%</div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {mode === 'practice' && (
        <div className="space-y-8">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setDynamicScenario(null);
                setCurrentScenarioIdx(0);
                setShowPracticeResult(false);
                setSelectedType('');
              }}
              className={cn(
                "px-6 py-2 rounded-full font-bold transition-all border",
                !dynamicScenario ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
              )}
            >
              Static Scenarios
            </button>
            <button
              onClick={generateDynamicScenario}
              disabled={isGeneratingScenario}
              className={cn(
                "px-6 py-2 rounded-full font-bold transition-all border flex items-center gap-2",
                dynamicScenario ? "accent-gradient text-white border-transparent" : "bg-white/5 text-slate-400 border-white/10"
              )}
            >
              {isGeneratingScenario ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Dynamic Scenario
            </button>
          </div>

          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-6 h-6 text-accent-primary" />
                {dynamicScenario ? 'AI Generated Scenario' : `Scenario ${currentScenarioIdx + 1} of ${practiceScenarios.length}`}
              </h3>
              {!dynamicScenario && (
                <div className="text-slate-400 font-mono">
                  {currentScenarioIdx + 1} / {practiceScenarios.length}
                </div>
              )}
            </div>

            <p className="text-xl text-slate-300 leading-relaxed italic">
              "{dynamicScenario ? dynamicScenario.text : practiceScenarios[currentScenarioIdx].text}"
            </p>

            {!showPracticeResult ? (
              <div className="space-y-6">
                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Select her type:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {personalityTypes.map(pt => (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedType(pt.id)}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all font-bold",
                        selectedType === pt.id 
                          ? "bg-accent-primary/20 border-accent-primary text-accent-primary" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      {pt.id}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPracticeResult(true)}
                  disabled={!selectedType}
                  className="w-full py-4 rounded-xl accent-gradient text-white font-bold disabled:opacity-50 transition-all"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {(() => {
                  const correctType = dynamicScenario ? dynamicScenario.correctType : practiceScenarios[currentScenarioIdx].correctType;
                  const explanation = dynamicScenario ? dynamicScenario.explanation : practiceScenarios[currentScenarioIdx].explanation;
                  const isCorrect = selectedType === correctType;

                  return (
                    <>
                      <div className={cn(
                        "p-6 rounded-2xl border flex items-start gap-4",
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      )}>
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-bold text-lg mb-2">
                            {isCorrect ? "Correct!" : `Incorrect. The correct type is ${correctType}.`}
                          </h4>
                          <p className="text-sm opacity-80 leading-relaxed">
                            {explanation}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {dynamicScenario ? (
                          <button
                            onClick={generateDynamicScenario}
                            className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            New AI Scenario
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (currentScenarioIdx < practiceScenarios.length - 1) {
                                setCurrentScenarioIdx(prev => prev + 1);
                                setSelectedType('');
                                setShowPracticeResult(false);
                              } else {
                                setCurrentScenarioIdx(0);
                                setSelectedType('');
                                setShowPracticeResult(false);
                              }
                            }}
                            className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            {currentScenarioIdx < practiceScenarios.length - 1 ? (
                              <>Next Scenario <ArrowRight className="w-4 h-4" /></>
                            ) : (
                              <>Restart Practice <RotateCcw className="w-4 h-4" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

