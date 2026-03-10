import React from 'react';
import { motion } from 'motion/react';
import { personalityTypes } from '../data/personalityTypes';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Zap, Shield, Flame, Target, BookOpen, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ProfilesPage() {
  return (
    <div className="space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium">
          <User className="w-4 h-4" />
          The 8 Archetypes
        </div>
        <h1 className="text-4xl md:text-6xl font-bold">Personality Profiles</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Explore the detailed blueprints of the eight core EPIMETHEUS personality types.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalityTypes.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col space-y-4 group hover:border-accent-primary/30 transition-all duration-500"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                <span className="font-mono font-bold text-lg">{profile.id}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                {profile.combination}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold group-hover:text-accent-primary transition-colors">{profile.name}</h3>
              <p className="text-xs text-accent-primary/70 font-medium italic">{profile.tagline}</p>
            </div>

            <p className="text-slate-400 text-sm line-clamp-3 flex-grow">
              {profile.overview}
            </p>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Zap className="w-3 h-3 text-accent-primary" />
                Key Traits
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.keyTraits.slice(0, 3).map((trait, j) => (
                  <span key={j} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to={`/encyclopedia?type=${profile.id}`}
              className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-accent-primary hover:border-accent-primary transition-all group/btn"
            >
              Full Breakdown
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="glass-card p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-accent-primary">
              <Target className="w-5 h-5" />
              The Time Line
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Determines how she invests her time and effort. <strong>Testers</strong> are hard to get but easy to keep, while <strong>Investors</strong> are easy to get but hard to keep.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-accent-primary">
              <Flame className="w-5 h-5" />
              The Sex Line
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Determines her approach to physical intimacy. <strong>Deniers</strong> need a reason TO have sex, while <strong>Justifiers</strong> need a reason NOT to.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-accent-primary">
              <Shield className="w-5 h-5" />
              The Relationship Line
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Determines her worldview and relationship values. <strong>Realists</strong> value practical stability, while <strong>Idealists</strong> value romantic connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
