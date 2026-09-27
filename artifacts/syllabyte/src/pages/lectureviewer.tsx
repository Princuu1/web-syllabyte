import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Maximize,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/lib/supabase';

/* ============================================================
   TYPES
============================================================ */

type Lecture = {
  id: string;
  title: string;
  unit: string;
  url: string;
  created_at?: string;
};

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (
    seconds: number,
    allowSeekAhead?: boolean
  ) => void;
  destroy: () => void;
};

type YouTubeStateEvent = {
  data: number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: string | HTMLElement,
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (
              event: YouTubeStateEvent
            ) => void;
          };
        }
      ) => YouTubePlayer;

      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
        CUED: number;
      };
    };

    onYouTubeIframeAPIReady?: () => void;
  }
}

/* ============================================================
   LOAD YOUTUBE IFRAME API
============================================================ */

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://www.youtube.com/iframe_api';
    script.async = true;

    document.head.appendChild(script);
  });
}

/* ============================================================
   PREPARE YOUTUBE URL
============================================================ */

function prepareYoutubeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    parsed.searchParams.set('enablejsapi', '1');
    parsed.searchParams.set(
      'origin',
      window.location.origin
    );

    return parsed.toString();
  } catch {
    return url;
  }
}

/* ============================================================
   FORMAT TIME
============================================================ */

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, '0')}`;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function LectureViewer() {
  const { lectureId } = useParams();
  const [, setLocation] = useLocation();
  const { isReady } = useAuthGuard();

  const [lecture, setLecture] =
    useState<Lecture | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [completed, setCompleted] =
    useState(false);

  const [savedPosition, setSavedPosition] =
    useState(0);

  const playerRef =
    useRef<YouTubePlayer | null>(null);

  const saveIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /* ============================================================
     FETCH LECTURE
  ============================================================ */

  useEffect(() => {
    const fetchLecture = async () => {
      if (!lectureId) {
        setError('Lecture not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('lectures')
          .select(
            'id, title, unit, url, created_at'
          )
          .eq('id', lectureId)
          .single();

        if (error) {
          throw error;
        }

        setLecture(data as Lecture);
      } catch (err) {
        console.error(
          'Error fetching lecture:',
          err
        );

        setError('Failed to load lecture.');
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [lectureId]);

  /* ============================================================
     LOAD LOCAL STORAGE
  ============================================================ */

  useEffect(() => {
    if (!lectureId) {
      setCompleted(false);
      setSavedPosition(0);
      return;
    }

    try {
      const progressKey =
        `lecture-progress-${lectureId}`;

      const completedKey =
        `lecture-completed-${lectureId}`;

      const storedProgress =
        localStorage.getItem(progressKey);

      const storedCompleted =
        localStorage.getItem(completedKey);

      const parsedProgress = storedProgress
        ? Number(storedProgress)
        : 0;

      setSavedPosition(
        Number.isFinite(parsedProgress)
          ? parsedProgress
          : 0
      );

      setCompleted(
        storedCompleted === 'true'
      );
    } catch (err) {
      console.error(
        'Error loading lecture data:',
        err
      );

      setSavedPosition(0);
      setCompleted(false);
    }
  }, [lectureId]);

  /* ============================================================
     INITIALIZE YOUTUBE PLAYER
  ============================================================ */

  useEffect(() => {
    if (!lecture?.id || !lecture.url) {
      return;
    }

    let mounted = true;

    const progressKey =
      `lecture-progress-${lecture.id}`;

    const saveProgress = () => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      try {
        const current =
          player.getCurrentTime();

        if (
          Number.isFinite(current) &&
          current >= 0
        ) {
          localStorage.setItem(
            progressKey,
            String(Math.floor(current))
          );

          if (mounted) {
            setSavedPosition(
              current
            );
          }
        }
      } catch (err) {
        console.error(
          'Error saving lecture progress:',
          err
        );
      }
    };

    const startSaving = () => {
      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );
      }

      saveIntervalRef.current =
        setInterval(() => {
          saveProgress();
        }, 2000);
    };

    const stopSaving = () => {
      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );

        saveIntervalRef.current = null;
      }

      saveProgress();
    };

    const initializePlayer = async () => {
      await loadYouTubeAPI();

      if (
        !mounted ||
        !window.YT?.Player
      ) {
        return;
      }

      const elementId =
        `youtube-player-${lecture.id}`;

      const iframe =
        document.getElementById(
          elementId
        );

      if (!iframe) {
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        playerRef.current = null;
      }

      const saved =
        Number(
          localStorage.getItem(
            progressKey
          ) || 0
        ) || 0;

      const player =
        new window.YT.Player(
          elementId,
          {
            events: {
              onReady: () => {
                if (!mounted) {
                  return;
                }

                playerRef.current =
                  player;

                /*
                 * Resume from saved position.
                 */
                try {
                  const total =
                    player.getDuration();

                  if (
                    saved > 5 &&
                    total > 0 &&
                    saved < total - 5
                  ) {
                    player.seekTo(
                      saved,
                      true
                    );
                  }
                } catch (err) {
                  console.error(
                    'Could not resume lecture:',
                    err
                  );
                }

                startSaving();
              },

              onStateChange: (
                event
              ) => {
                if (!mounted) {
                  return;
                }

                if (
                  event.data ===
                  window.YT?.PlayerState
                    .PLAYING
                ) {
                  startSaving();
                }

                if (
                  event.data ===
                  window.YT?.PlayerState
                    .PAUSED
                ) {
                  stopSaving();
                }

                if (
                  event.data ===
                  window.YT?.PlayerState
                    .ENDED
                ) {
                  stopSaving();
                }
              },
            },
          }
        );

      playerRef.current = player;

      /*
       * Save when leaving/hiding the page.
       */
      const handleVisibilityChange =
        () => {
          if (
            document.visibilityState ===
            'hidden'
          ) {
            saveProgress();
          }
        };

      const handlePageHide = () => {
        saveProgress();
      };

      document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      window.addEventListener(
        'pagehide',
        handlePageHide
      );

      (
        player as YouTubePlayer & {
          __cleanup?: () => void;
        }
      ).__cleanup = () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );

        window.removeEventListener(
          'pagehide',
          handlePageHide
        );
      };
    };

    initializePlayer();

    return () => {
      mounted = false;

      if (saveIntervalRef.current) {
        clearInterval(
          saveIntervalRef.current
        );

        saveIntervalRef.current = null;
      }

      saveProgress();

      const player =
        playerRef.current;

      if (player) {
        try {
          (
            player as YouTubePlayer & {
              __cleanup?: () => void;
            }
          ).__cleanup?.();
        } catch {
          // Ignore cleanup errors.
        }

        try {
          player.destroy();
        } catch {
          // Ignore cleanup errors.
        }

        playerRef.current = null;
      }
    };
  }, [lecture?.id, lecture?.url]);

  /* ============================================================
     TOGGLE COMPLETED
  ============================================================ */

  const toggleCompleted = () => {
    if (!lecture?.id) {
      return;
    }

    try {
      const completedKey =
        `lecture-completed-${lecture.id}`;

      const nextValue = !completed;

      localStorage.setItem(
        completedKey,
        String(nextValue)
      );

      setCompleted(nextValue);
    } catch (err) {
      console.error(
        'Error saving lecture completion:',
        err
      );
    }
  };

  /* ============================================================
     FULLSCREEN
  ============================================================ */

  const openFullscreen = async () => {
    const player =
      document.getElementById(
        'lecture-player'
      );

    if (!player) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      if (player.requestFullscreen) {
        await player.requestFullscreen();
      }
    } catch (err) {
      console.error(
        'Fullscreen request failed:',
        err
      );
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (!isReady || loading) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2
                size={24}
                className="animate-spin text-primary"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Loading lecture...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !lecture) {
    return (
      <AppShell>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle
              size={28}
              className="text-red-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-foreground">
            Unable to load lecture
          </h2>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {error ||
              'Lecture not found.'}
          </p>

          <button
            onClick={() =>
              setLocation('/home')
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <ArrowLeft size={16} />
            Go home
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageTransition className="min-h-[100dvh]">
        {/* =====================================================
            TOP BAR
        ====================================================== */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/70">
          <div className="px-4 sm:px-6 md:px-10 py-3">
            <div className="max-w-6xl mx-auto flex items-center gap-3">

              {/* BACK BUTTON */}
              <button
                onClick={() =>
                  window.history.back()
                }
                className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0 active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>

              {/* TITLE */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Video size={14} />
                  </div>

                  <h1 className="font-semibold text-sm sm:text-base truncate text-foreground">
                    {lecture.title}
                  </h1>
                </div>
              </div>

              {/* COMPLETED STATUS */}
              {completed && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500"
                  />
                  Completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <main className="px-4 sm:px-6 md:px-10 py-5 md:py-8">
          <div className="max-w-6xl mx-auto">

            {/* =================================================
                VIDEO PLAYER
            ================================================== */}
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <div
                id="lecture-player"
                className="relative w-full aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
              >
                <iframe
                  id={`youtube-player-${lecture.id}`}
                  src={prepareYoutubeUrl(
                    lecture.url
                  )}
                  title={lecture.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>
            </motion.div>

            {/* =================================================
                CONTROLS
            ================================================== */}
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
                delay: 0.06,
              }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >

              {/* FULLSCREEN */}
              <button
                onClick={
                  openFullscreen
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <Maximize size={16} />
                Full screen
              </button>

              {/* MARK / UNMARK COMPLETED */}
              <button
                onClick={
                  toggleCompleted
                }
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                  completed
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                <CheckCircle2
                  size={16}
                  fill={
                    completed
                      ? 'currentColor'
                      : 'none'
                  }
                />

                {completed
                  ? 'Completed'
                  : 'Mark as completed'}
              </button>
            </motion.div>

            {/* =================================================
                LECTURE INFORMATION
            ================================================== */}
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
                delay: 0.1,
              }}
              className="mt-5"
            >
              <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-5 sm:p-6">
                <div className="flex items-start gap-4">

                  {/* ICON */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Video size={22} />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                        Lecture
                      </span>

                      {completed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold">
                          <CheckCircle2
                            size={12}
                          />
                          Completed
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug break-words">
                      {lecture.title}
                    </h2>

                    {/* RESUME INFO */}
                    {savedPosition > 5 &&
                      !completed && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Resume from{' '}
                          <span className="font-semibold text-foreground">
                            {formatTime(
                              savedPosition
                            )}
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BOTTOM SPACING */}
            <div className="h-8" />
          </div>
        </main>
      </PageTransition>
    </AppShell>
  );
}