import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { PageTransition } from '@/components/layout/PageTransition';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { syllabus } from '@/data';
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  FileText,
  Layers,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Notes, type NoteItem } from './notes';

export default function TopicsNotes() {
  const { subjectId, unitId } = useParams();
  const [, setLocation] = useLocation();
  const { isReady } = useAuthGuard();

  const [activeTab, setActiveTab] = useState<'topics' | 'notes'>('topics');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  const completionHydratedRef = useRef(false);

  const subject = syllabus.find((s) => s.id === subjectId);
  const unit = subject?.units.find((u) => u.id === unitId);

  const completionKey =
    subject && unit ? `completed-topics-${subject.id}-${unit.id}` : null;

  useEffect(() => {
    const fetchNotes = async () => {
      if (!subject || !unit) return;

      setNotesLoading(true);
      setNotesError(null);

      try {
        const matchKeys = Array.from(
          new Set(
            [unit.id, unit.name, `${subject.code}-${unit.id}`]
              .map((v) => v?.trim())
              .filter(Boolean)
          )
        );

        const { data, error } = await supabase
          .from('notes')
          .select('id, title, unit, url')
          .in('unit', matchKeys);

        if (error) throw error;

        setNotes((data ?? []) as NoteItem[]);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setNotesError('Failed to load notes.');
      } finally {
        setNotesLoading(false);
      }
    };

    fetchNotes();
  }, [subject, unit]);

  useEffect(() => {
    completionHydratedRef.current = false;

    if (!completionKey) {
      setCompletedTopics([]);
      return;
    }

    try {
      const stored = localStorage.getItem(completionKey);
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      setCompletedTopics(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Error loading completed topics:', error);
      setCompletedTopics([]);
    } finally {
      completionHydratedRef.current = true;
    }
  }, [completionKey]);

  useEffect(() => {
    if (!completionKey || !completionHydratedRef.current) return;

    try {
      localStorage.setItem(completionKey, JSON.stringify(completedTopics));
    } catch (error) {
      console.error('Error saving completed topics:', error);
    }
  }, [completedTopics, completionKey]);

  const isCompleted = (topicId: string) => completedTopics.includes(topicId);

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const askChatGPT = (topicName: string) => {
    if (!subject || !unit) return;

    const prompt = `Explain ${topicName} from ${subject.name} - ${unit.name} in simple language. Include key concepts, examples, and a short revision summary.`;
    const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject || !unit) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <p className="text-muted-foreground">Unit not found.</p>
          <button
            onClick={() => setLocation('/home')}
            className="text-primary text-sm underline"
          >
            Go home
          </button>
        </div>
      </AppShell>
    );
  }

  const toggleTopic = (topicId: string) =>
    setExpandedTopic((prev) => (prev === topicId ? null : topicId));

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] md:min-h-0">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white px-6 md:px-10 pt-12 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10">
            <button
              onClick={() => setLocation(`/subject/${subjectId}`)}
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors mb-5 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              {subject.name}
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-white/50 bg-white/10 px-2.5 py-1 rounded-full">
                {subject.code}
              </span>
            </div>

            <h1 className="text-2xl font-serif font-bold leading-snug">
              {unit.name}
            </h1>

            <div className="flex items-center gap-1.5 mt-3 text-white/60">
              <FileText size={13} />
              <span className="text-sm">{unit.topics.length} topics</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 py-6 pb-28 md:pb-10 space-y-6">
          <div className="flex items-center p-1 bg-muted rounded-xl w-full max-w-md border border-border/50">
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'topics'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers size={16} />
              <span>Topics</span>
              <span className="text-xs bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                {unit.topics.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'notes'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen size={16} />
              <span>Notes</span>
              <span className="text-xs bg-muted-foreground/10 px-2 py-0.5 rounded-full">
                {notes.length}
              </span>
            </button>
          </div>

          {activeTab === 'topics' && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-2">
                {unit.topics.map((topic, idx) => {
                  const expanded = expandedTopic === topic.id;
                  const done = isCompleted(topic.id);

                  return (
                    <div
                      key={topic.id}
                      className={`bg-card border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                        expanded
                          ? 'border-primary/30 shadow-primary/5'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : expanded
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {done ? <CheckCircle2 size={16} /> : String(idx + 1).padStart(2, '0')}
                        </div>

                        <span
                          className={`flex-1 font-semibold text-[15px] leading-snug pr-2 transition-colors ${
                            expanded ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {topic.name}
                        </span>

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            expanded
                              ? 'bg-primary/10 text-primary rotate-180'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <ChevronDown size={16} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-6 pt-1 border-t border-border/50">
                              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3">
                               <button
  onClick={() => askChatGPT(topic.name)}
  className="inline-flex items-center justify-center gap-2
             rounded-xl border border-gray-200 bg-white
             px-4 py-2.5 text-sm font-semibold text-gray-800
             shadow-sm transition-all duration-200
             hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
             active:scale-[0.98]"
>
  <img
    src="https://cdn-icons-png.flaticon.com/512/11865/11865326.png"
    alt=""
    className="h-5 w-5 object-contain"
  />
  Ask ChatGPT
</button>

                                <button
                                  onClick={() => toggleCompleted(topic.id)}
                                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors border ${
                                    done
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'border-border bg-background text-foreground hover:bg-muted'
                                  }`}
                                >
                                  {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                  {done ? 'Completed' : 'Mark as completed'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {activeTab === 'notes' && (
            <Notes
              notes={notes}
              notesLoading={notesLoading}
              notesError={notesError}
              unitId={unit.id}
              onSeeNote={(note) => setLocation(`/notes/${note.id}`)}
            />
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}