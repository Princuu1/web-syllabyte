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
  Heart,
  PlayCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Notes, type NoteItem } from './notes';
import { Lectures, type LectureItem } from './lecture';

type ActiveTab = 'topics' | 'notes' | 'lectures';

export default function TopicsNotes() {
  const { subjectId, unitId } = useParams();
  const [, setLocation] = useLocation();
  const { isReady } = useAuthGuard();

  const [activeTab, setActiveTab] = useState<ActiveTab>('topics');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [lecturesError, setLecturesError] = useState<string | null>(null);

  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [importantTopics, setImportantTopics] = useState<string[]>([]);

  const completionHydratedRef = useRef(false);
  const importantHydratedRef = useRef(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const subject = syllabus.find((s) => s.id === subjectId);
  const unit = subject?.units.find((u) => u.id === unitId);

  const completionKey =
    subject && unit
      ? `completed-topics-${subject.id}-${unit.id}`
      : null;

  const importantKey =
    subject && unit
      ? `important-topics-${subject.id}-${unit.id}`
      : null;

  /* -------------------------------------------------------
     FETCH NOTES
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
     FETCH LECTURES
  ------------------------------------------------------- */
  useEffect(() => {
    const fetchLectures = async () => {
      if (!subject || !unit) return;

      setLecturesLoading(true);
      setLecturesError(null);

      try {
        const matchKeys = Array.from(
          new Set(
            [unit.id, unit.name, `${subject.code}-${unit.id}`]
              .map((v) => v?.trim())
              .filter(Boolean)
          )
        );

     const { data, error } = await supabase
  .from('lectures')
  .select('*')
  .eq('unit', unitId)
  .order('created_at', { ascending: false });

        if (error) throw error;

        setLectures((data ?? []) as LectureItem[]);
      } catch (error) {
        console.error('Error fetching lectures:', error);
        setLecturesError('Failed to load lectures.');
      } finally {
        setLecturesLoading(false);
      }
    };

    fetchLectures();
  }, [subject, unit]);

  /* -------------------------------------------------------
     LOAD COMPLETED TOPICS
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
     SAVE COMPLETED TOPICS
  ------------------------------------------------------- */
  useEffect(() => {
    if (!completionKey || !completionHydratedRef.current) return;

    try {
      localStorage.setItem(
        completionKey,
        JSON.stringify(completedTopics)
      );
    } catch (error) {
      console.error('Error saving completed topics:', error);
    }
  }, [completedTopics, completionKey]);

  /* -------------------------------------------------------
     LOAD IMPORTANT TOPICS
  ------------------------------------------------------- */
  useEffect(() => {
    importantHydratedRef.current = false;

    if (!importantKey) {
      setImportantTopics([]);
      return;
    }

    try {
      const stored = localStorage.getItem(importantKey);
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];

      setImportantTopics(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error('Error loading important topics:', error);
      setImportantTopics([]);
    } finally {
      importantHydratedRef.current = true;
    }
  }, [importantKey]);

  /* -------------------------------------------------------
     SAVE IMPORTANT TOPICS
  ------------------------------------------------------- */
  useEffect(() => {
    if (!importantKey || !importantHydratedRef.current) return;

    try {
      localStorage.setItem(
        importantKey,
        JSON.stringify(importantTopics)
      );
    } catch (error) {
      console.error('Error saving important topics:', error);
    }
  }, [importantTopics, importantKey]);

  /* -------------------------------------------------------
     CLEANUP LONG PRESS
  ------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  /* -------------------------------------------------------
     TOPIC HELPERS
  ------------------------------------------------------- */
  const isCompleted = (topicId: string) =>
    completedTopics.includes(topicId);

  const isImportant = (topicId: string) =>
    importantTopics.includes(topicId);

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleImportant = (topicId: string) => {
    setImportantTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  /* -------------------------------------------------------
     LONG PRESS
  ------------------------------------------------------- */
  const startLongPress = (topicId: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTriggered.current = false;

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleImportant(topicId);
      longPressTimer.current = null;
    }, 550);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTopicClick = (topicId: string) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    setExpandedTopic((prev) =>
      prev === topicId ? null : topicId
    );
  };

  /* -------------------------------------------------------
     CHATGPT
  ------------------------------------------------------- */
  const askChatGPT = (topicName: string) => {
    if (!subject || !unit) return;

    const prompt = `Explain ${topicName} from ${subject.name} - ${unit.name} in simple language. Include key concepts, examples, and a short revision summary.`;

    const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */
  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* -------------------------------------------------------
     INVALID UNIT
  ------------------------------------------------------- */
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

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] md:min-h-0">

        {/* =====================================================
            HEADER
        ====================================================== */}
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

              <span className="text-sm">
                {unit.topics.length} topics
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="flex-1 px-6 md:px-10 py-6 pb-28 md:pb-10 space-y-6">

          {/* ===================================================
    TABS
==================================================== */}
<div className="w-full max-w-2xl overflow-x-auto scrollbar-hide">
  <div className="flex w-max min-w-full items-center gap-6 border-b border-border/60">

    {/* TOPICS */}
    <button
      onClick={() => setActiveTab('topics')}
      className={`shrink-0 relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
        activeTab === 'topics'
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Layers size={16} />

      <span>Topics</span>

      <span
        className={`text-xs px-1.5 py-0.5 rounded-md ${
          activeTab === 'topics'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {unit.topics.length}
      </span>

      {activeTab === 'topics' && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full"
        />
      )}
    </button>

    {/* NOTES */}
    <button
      onClick={() => setActiveTab('notes')}
      className={`shrink-0 relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
        activeTab === 'notes'
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <BookOpen size={16} />

      <span>Notes</span>

      <span
        className={`text-xs px-1.5 py-0.5 rounded-md ${
          activeTab === 'notes'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {notes.length}
      </span>

      {activeTab === 'notes' && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full"
        />
      )}
    </button>

    {/* LECTURES */}
    <button
      onClick={() => setActiveTab('lectures')}
      className={`shrink-0 relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
        activeTab === 'lectures'
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <PlayCircle size={16} />

      <span>Lectures</span>

      <span
        className={`text-xs px-1.5 py-0.5 rounded-md ${
          activeTab === 'lectures'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {lectures.length}
      </span>

      {activeTab === 'lectures' && (
        <motion.div
          layoutId="activeTab"
          className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full"
        />
      )}
    </button>

  </div>
</div>

          {/* ===================================================
              TOPICS
          ==================================================== */}
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
                  const important = isImportant(topic.id);

                  return (
                    <div
                      key={topic.id}
                      className={`bg-card border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                        expanded
                          ? 'border-primary/30 shadow-primary/5'
                          : important
                            ? 'border-rose-300 dark:border-rose-900'
                            : 'border-border hover:border-border/80'
                      }`}
                    >
                      {/* TOPIC HEADER */}
                      <button
                        onPointerDown={() =>
                          startLongPress(topic.id)
                        }
                        onPointerUp={cancelLongPress}
                        onPointerLeave={cancelLongPress}
                        onPointerCancel={cancelLongPress}
                        onContextMenu={(e) =>
                          e.preventDefault()
                        }
                        onClick={() =>
                          handleTopicClick(topic.id)
                        }
                        className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 select-none"
                        style={{ touchAction: 'pan-y' }}
                        aria-label={`${topic.name}${
                          important
                            ? ', important topic'
                            : ''
                        }. Hold to toggle importance.`}
                      >
                        {/* NUMBER / COMPLETE */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : expanded
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            String(idx + 1).padStart(2, '0')
                          )}
                        </div>

                        {/* TOPIC TITLE */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block font-semibold text-[15px] leading-snug pr-1 transition-colors ${
                              expanded
                                ? 'text-primary'
                                : 'text-foreground'
                            }`}
                          >
                            {topic.name}
                          </span>

                          <AnimatePresence>
                            {important && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                  y: 4,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: 'auto',
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                  y: 4,
                                }}
                                transition={{ duration: 0.2 }}
                                className="text-xs text-rose-500 font-medium mt-1 block overflow-hidden"
                              >
                                Important topic
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* HEART */}
                        <div className="shrink-0 w-9 h-9 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            {important && (
                              <motion.div
                                key="important-heart"
                                initial={{
                                  scale: 0,
                                  rotate: -35,
                                  opacity: 0,
                                }}
                                animate={{
                                  scale: 1,
                                  rotate: 0,
                                  opacity: 1,
                                }}
                                exit={{
                                  scale: 0,
                                  rotate: 35,
                                  opacity: 0,
                                }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 500,
                                  damping: 15,
                                }}
                                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-500/10"
                              >
                                <motion.div
                                  animate={{
                                    scale: [1, 1.3, 1],
                                  }}
                                  transition={{
                                    duration: 0.45,
                                    ease: 'easeOut',
                                  }}
                                >
                                  <Heart
                                    size={21}
                                    fill="#f43f5e"
                                    color="#f43f5e"
                                    strokeWidth={2.5}
                                  />
                                </motion.div>

                                <motion.span
                                  initial={{
                                    scale: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                  }}
                                  transition={{
                                    duration: 0.55,
                                  }}
                                  className="absolute -top-1 -right-1 text-rose-400 text-xs pointer-events-none"
                                >
                                  ✦
                                </motion.span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* CHEVRON */}
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

                      {/* =================================================
                          EXPANDED TOPIC
                      ================================================== */}
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: 'auto',
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.28,
                              ease: 'easeInOut',
                            }}
                          >
                            <div className="px-5 pb-6 pt-1 border-t border-border/50">
                              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none" />

                              <div className="flex flex-col sm:flex-row gap-3">

                                {/* CHATGPT */}
                                <button
                                  onClick={() =>
                                    askChatGPT(topic.name)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
                                >
                                  <img
                                    src="https://cdn-icons-png.flaticon.com/512/11865/11865326.png"
                                    alt=""
                                    className="h-5 w-5 object-contain"
                                  />

                                  Ask ChatGPT
                                </button>

                                {/* COMPLETION */}
                                <button
                                  onClick={() =>
                                    toggleCompleted(
                                      topic.id
                                    )
                                  }
                                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors border ${
                                    done
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                      : 'border-border bg-background text-foreground hover:bg-muted'
                                  }`}
                                >
                                  {done ? (
                                    <CheckCircle2 size={16} />
                                  ) : (
                                    <Circle size={16} />
                                  )}

                                  {done
                                    ? 'Completed'
                                    : 'Mark as completed'}
                                </button>

                                {/* IMPORTANT */}
                                <button
                                  onClick={() =>
                                    toggleImportant(
                                      topic.id
                                    )
                                  }
                                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors border ${
                                    important
                                      ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                      : 'border-border bg-background text-foreground hover:bg-muted'
                                  }`}
                                >
                                  <Heart
                                    size={16}
                                    fill={
                                      important
                                        ? 'currentColor'
                                        : 'none'
                                    }
                                  />

                                  {important
                                    ? 'Important'
                                    : 'Mark important'}
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

          {/* ===================================================
              NOTES
          ==================================================== */}
          {activeTab === 'notes' && (
            <Notes
              notes={notes}
              notesLoading={notesLoading}
              notesError={notesError}
              unitId={unit.id}
              onSeeNote={(note) =>
                setLocation(`/notes/${note.id}`)
              }
            />
          )}

          {/* ===================================================
              LECTURES
          ==================================================== */}
          {activeTab === 'lectures' && (
            <Lectures
              lectures={lectures}
              lecturesLoading={lecturesLoading}
              lecturesError={lecturesError}
              unitId={unit.id}
            />
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}