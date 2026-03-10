import React from 'react';
import { motion } from 'motion/react';
import { BookA, Search } from 'lucide-react';

const glossaryTerms = [
  {
    term: "Calibration",
    definition: "The ability to read a woman's reactions and adjust your behavior accordingly. It's about being socially aware and responsive rather than rigidly following a script."
  },
  {
    term: "Time Line (Tester vs. Investor)",
    definition: "Determines how a woman views the progression of a relationship. Testers are harder to get but easier to keep (they test you upfront). Investors are easier to get but harder to keep (they invest early but expect a return)."
  },
  {
    term: "Sex Line (Denier vs. Justifier)",
    definition: "Determines how a woman views sex. Deniers need a reason TO have sex (emotional connection, commitment). Justifiers need a reason NOT to have sex (they enjoy it freely unless there's a red flag)."
  },
  {
    term: "Relationship Line (Realist vs. Idealist)",
    definition: "Determines how a woman views the world and relationships. Realists are practical, logical, and focus on what is. Idealists are romantic, imaginative, and focus on what could be."
  },
  {
    term: "ETS (Emotional Tension Sequence)",
    definition: "The specific sequence of emotions a woman needs to feel to become devoted. The four emotions are Intrigue, Arousal, Comfort, and Devotion. The order varies based on her personality type."
  },
  {
    term: "Intrigue",
    definition: "Curiosity and interest. Making her wonder about you and want to know more."
  },
  {
    term: "Arousal",
    definition: "Sexual tension and physical attraction. The feeling of being turned on."
  },
  {
    term: "Comfort",
    definition: "Emotional safety and trust. The feeling that she can be herself around you."
  },
  {
    term: "Devotion",
    definition: "Deep loyalty and commitment. The feeling that she wants to be with you long-term."
  },
  {
    term: "The Us-Frame",
    definition: "Framing the interaction as 'you and me against the world'. Creating a shared reality and a sense of partnership."
  },
  {
    term: "Cold Read",
    definition: "Making an educated guess about her personality or background based on her appearance or behavior. Used to build intrigue and connection."
  },
  {
    term: "Fractionation",
    definition: "Alternating between different emotional states (e.g., serious and playful, or arousing and comforting) to build emotional depth and tension."
  },
  {
    term: "Compliance",
    definition: "Getting her to agree to small requests or follow your lead. A key indicator of interest and investment."
  },
  {
    term: "Inner Process Language",
    definition: "Speaking in a way that describes your internal thoughts, feelings, and motivations, rather than just facts. Used to connect with Idealists and build deep rapport."
  }
];

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium">
          <BookA className="w-4 h-4" />
          Terminology
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">Glossary</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Master the language of the EPIMETHEUS system.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input 
          type="text"
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTerms.map((item, i) => (
          <motion.div 
            key={item.term}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 space-y-3 hover:bg-white/5 transition-colors"
          >
            <h3 className="text-xl font-bold text-accent-primary">{item.term}</h3>
            <p className="text-slate-300 leading-relaxed">{item.definition}</p>
          </motion.div>
        ))}
        {filteredTerms.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No terms found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
