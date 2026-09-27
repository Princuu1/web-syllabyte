import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Play,
  Video,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type LectureItem = {
  id: string;
  title: string;
  unit: string;
  url: string;
  created_at?: string;
};

type LecturesProps = {
  lectures: LectureItem[];
  lecturesLoading: boolean;
  lecturesError: string | null;
  unitId: string;
};

type CompletionState = Record<string, boolean>;

export function Lectures({
  lectures,
  lecturesLoading,
  lecturesError,
}: LecturesProps) {
  const [, setLocation] = useLocation();

  const [completedLectures, setCompletedLectures] =
    useState<CompletionState>({});

  /* ============================================================
     LOAD COMPLETION STATUS
  ============================================================ */
  const loadCompletionStatus = () => {
    const status: CompletionState = {};

    lectures.forEach((lecture) => {
      try {
        status[lecture.id] =
          localStorage.getItem(
            `lecture-completed-${lecture.id}`
          ) === 'true';
      } catch {
        status[lecture.id] = false;
      }
    });

    setCompletedLectures(status);
  };

  /* ============================================================
     LOAD WHEN LECTURES CHANGE
  ============================================================ */
  useEffect(() => {
    loadCompletionStatus();
  }, [lectures]);

  /* ============================================================
     LISTEN FOR COMPLETION CHANGES
  ============================================================ */
  useEffect(() => {
    const handleCompletionChange = () => {
      loadCompletionStatus();
    };

    window.addEventListener(
      'lecture-completion-changed',
      handleCompletionChange
    );

    window.addEventListener(
      'storage',
      handleCompletionChange
    );

    window.addEventListener(
      'focus',
      handleCompletionChange
    );

    return () => {
      window.removeEventListener(
        'lecture-completion-changed',
        handleCompletionChange
      );

      window.removeEventListener(
        'storage',
        handleCompletionChange
      );

      window.removeEventListener(
        'focus',
        handleCompletionChange
      );
    };
  }, [lectures]);

  /* ============================================================
     LOADING
  ============================================================ */
  if (lecturesLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-card border border-border rounded-2xl p-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-32 sm:w-40 aspect-video rounded-xl bg-muted shrink-0" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>

                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */
  if (lecturesError) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle
            size={26}
            className="text-red-500"
          />
        </div>

        <h3 className="font-semibold text-foreground">
          Unable to load lectures
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          {lecturesError}
        </p>
      </motion.section>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */
  if (lectures.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Video
            size={28}
            className="text-muted-foreground"
          />
        </div>

        <h3 className="font-semibold text-foreground">
          No lectures available
        </h3>

        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Lectures for this unit will appear here once they
          are added.
        </p>
      </motion.section>
    );
  }

  /* ============================================================
     PLAYLIST STYLE
  ============================================================ */
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        {lectures.map((lecture, index) => {
          const isCompleted =
            completedLectures[lecture.id] === true;

          return (
            <motion.button
              key={lecture.id}
              type="button"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.22,
                delay: index * 0.04,
              }}
              onClick={() =>
                setLocation(
                  `/lecture/${lecture.id}`
                )
              }
              className={`w-full text-left bg-card border rounded-2xl p-3 transition-all duration-200 group ${
                isCompleted
                  ? 'border-emerald-500/20 hover:border-emerald-500/40'
                  : 'border-border hover:border-primary/30'
              } hover:shadow-md`}
            >
              <div className="flex items-center gap-3">

                {/* =================================================
                    VIDEO PREVIEW / THUMBNAIL
                ================================================== */}
                <div className="relative w-32 sm:w-44 aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 shrink-0">

                  {/* YouTube thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${
                      extractYoutubeId(
                        lecture.url
                      ) || ''
                    }/mqdefault.jpg`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        'none';
                    }}
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Play
                        size={17}
                        fill="currentColor"
                        className="ml-0.5"
                      />
                    </div>
                  </div>

                  {/* Lecture number */}
                  <div className="absolute left-2 bottom-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold">
                    {String(index + 1).padStart(
                      2,
                      '0'
                    )}
                  </div>
                </div>

                {/* =================================================
                    TITLE
                ================================================== */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Lecture
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[14px] sm:text-[15px] leading-snug text-foreground line-clamp-2">
                    {lecture.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Video size={13} />
                    <span>Watch lecture</span>
                  </div>
                </div>

                {/* =================================================
                    RIGHT SIDE STATUS
                ================================================== */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{
                        scale: 0.7,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 18,
                      }}
                      className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                      aria-label="Completed"
                    >
                      <CheckCircle2
                        size={20}
                        strokeWidth={2.6}
                      />
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <ChevronRight
                        size={17}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}

/* ============================================================
   EXTRACT YOUTUBE VIDEO ID
============================================================ */
function extractYoutubeId(
  url: string
): string | null {
  try {
    if (!url) return null;

    const parsed = new URL(url);

    // https://www.youtube.com/embed/VIDEO_ID
    if (
      parsed.pathname.startsWith('/embed/')
    ) {
      return (
        parsed.pathname
          .split('/embed/')[1]
          ?.split('/')[0] || null
      );
    }

    // https://www.youtube.com/watch?v=VIDEO_ID
    const watchId =
      parsed.searchParams.get('v');

    if (watchId) {
      return watchId;
    }

    // https://youtu.be/VIDEO_ID
    if (
      parsed.hostname.includes('youtu.be')
    ) {
      return (
        parsed.pathname
          .replace(/^\/+/, '')
          .split('/')[0] || null
      );
    }

    return null;
  } catch {
    return null;
  }
}

export default Lectures;