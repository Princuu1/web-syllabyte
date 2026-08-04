import React from 'react';
import { useLocation, useParams } from 'wouter';
import { PageTransition } from '@/components/layout/PageTransition';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { syllabus } from '@/data';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ChevronRight, Layers } from 'lucide-react';

const subjectColors: Record<string, { hero: string; badge: string; unit: string }> = {
  blue:   { hero: 'from-blue-600 to-indigo-700',   badge: 'bg-blue-100 text-blue-700',    unit: 'hover:border-blue-200 hover:bg-blue-50/50' },
  green:  { hero: 'from-emerald-600 to-teal-700',  badge: 'bg-emerald-100 text-emerald-700', unit: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
  purple: { hero: 'from-purple-600 to-violet-700', badge: 'bg-purple-100 text-purple-700',  unit: 'hover:border-purple-200 hover:bg-purple-50/50' },
  orange: { hero: 'from-orange-500 to-amber-600',  badge: 'bg-orange-100 text-orange-700',  unit: 'hover:border-orange-200 hover:bg-orange-50/50' },
  red:    { hero: 'from-rose-600 to-pink-700',     badge: 'bg-rose-100 text-rose-700',      unit: 'hover:border-rose-200 hover:bg-rose-50/50' },
  yellow: { hero: 'from-amber-500 to-yellow-600',  badge: 'bg-amber-100 text-amber-700',    unit: 'hover:border-amber-200 hover:bg-amber-50/50' },
};

export default function SubjectUnits() {
  const { subjectId } = useParams();
  const [, setLocation] = useLocation();
  const { isReady } = useAuthGuard();

  const subject = syllabus.find((s) => s.id === subjectId);

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <p className="text-muted-foreground">Subject not found.</p>
          <button onClick={() => setLocation('/home')} className="text-primary text-sm underline">Go home</button>
        </div>
      </AppShell>
    );
  }

  const colors = subjectColors[subject.colorClass] ?? subjectColors.blue;
  const totalTopics = subject.units.reduce((a, u) => a + u.topics.length, 0);

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] md:min-h-0">
        {/* Hero */}
        <div className={`relative bg-gradient-to-br ${colors.hero} text-white pt-12 pb-10 px-6 md:px-10 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10">
            <button
              onClick={() => setLocation('/home')}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              All Subjects
            </button>

            <span className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${colors.badge} mb-4 inline-block`}>
              {subject.code}
            </span>
            <h1 className="text-3xl font-serif font-bold leading-tight mt-2 mb-5">{subject.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <Layers size={14} />
                <span className="text-sm font-semibold">{subject.units.length} Units</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <BookOpen size={14} />
                <span className="text-sm font-semibold">{totalTopics} Topics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit list */}
        <div className="flex-1 px-6 md:px-10 py-6 pb-28 md:pb-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Units</p>
          <div className="space-y-3">
            {subject.units.map((unit, idx) => (
              <motion.button
                key={unit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                onClick={() => setLocation(`/subject/${subject.id}/unit/${unit.id}`)}
                className={`w-full text-left bg-card border border-border rounded-2xl p-5 shadow-sm transition-all duration-200 active:scale-[0.97] hover:shadow-md ${colors.unit} group`}
              >
                <div className="flex items-center gap-4">
                  {/* Number badge */}
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 font-bold text-muted-foreground text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-[15px] leading-snug group-hover:text-primary transition-colors">
                      {unit.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <BookOpen size={11} />
                      {unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
