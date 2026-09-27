import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useParams } from 'wouter';

import {
  Viewer,
  Worker,
} from '@react-pdf-viewer/core';

import {
  defaultLayoutPlugin,
} from '@react-pdf-viewer/default-layout';

import {
  MoreActionsPopover,
  type ToolbarProps,
  type ToolbarSlot,
} from '@react-pdf-viewer/toolbar';

import HTMLFlipBook from 'react-pageflip';
import * as pdfjs from 'pdfjs-dist';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import {
  AppShell,
} from '@/components/layout/AppShell';

import {
  PageTransition,
} from '@/components/layout/PageTransition';

import {
  useAuthGuard,
} from '@/hooks/useAuthGuard';

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Loader2,
  Maximize2,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

import type {
  NoteItem,
} from './notes';

const WORKER_URL =
  'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

type ViewMode = 'pdf' | 'book';

type BookPageProps = {
  image: string;
  pageNumber: number;
};

type PDFBookModeProps = {
  fileUrl: string;
};

/* =========================================================
   PDF TOOLBAR
   ========================================================= */

function renderToolbar(
  Toolbar: (
    props: ToolbarProps,
  ) => React.ReactElement,
) {
  return (
    <Toolbar>
      {(
        toolbarSlot: ToolbarSlot,
      ) => {
        const {
          CurrentPageInput,
          Download,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Zoom,
          ZoomIn,
          ZoomOut,
        } = toolbarSlot;

        const toolbarSlotWithoutOpen = {
          ...toolbarSlot,
          Open: () => <></>,
        } as ToolbarSlot;

        return (
          <div
            className="w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            role="toolbar"
            aria-orientation="horizontal"
          >
            <div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-2 py-2 sm:px-3">
              {/* Page controls */}
              <div className="flex shrink-0 items-center gap-1.5">
                <GoToPreviousPage />

                <div className="flex h-9 min-w-[105px] items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-3 text-sm">
                  <CurrentPageInput />

                  <span className="text-muted-foreground">
                    /
                  </span>

                  <NumberOfPages />
                </div>

                <GoToNextPage />
              </div>

              {/* Zoom / actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <ZoomOut />

                <div className="hidden sm:block">
                  <Zoom />
                </div>

                <ZoomIn />

                <EnterFullScreen />

                <Download />

                <MoreActionsPopover
                  toolbarSlot={
                    toolbarSlotWithoutOpen
                  }
                />
              </div>
            </div>
          </div>
        );
      }}
    </Toolbar>
  );
}

/* =========================================================
   BOOK PAGE
   ========================================================= */

function BookPage({
  image,
  pageNumber,
}: BookPageProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <img
        src={image}
        alt={`Page ${pageNumber}`}
        className="h-full w-full select-none object-contain"
        draggable={false}
      />

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
        {pageNumber}
      </div>
    </div>
  );
}

/* =========================================================
   BOOK VIEW
   ========================================================= */

function PDFBookMode({
  fileUrl,
}: PDFBookModeProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [pages, setPages] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [progress, setProgress] =
    useState(0);

  const [containerWidth, setContainerWidth] =
    useState(0);

  /*
   * Measure the actual area available to the book.
   * This makes it responsive to:
   * - mobile
   * - tablet
   * - desktop
   * - screen rotation
   * - browser resizing
   */
  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(
        element.getBoundingClientRect()
          .width,
      );
    };

    updateWidth();

    const observer =
      new ResizeObserver(() => {
        updateWidth();
      });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Render each PDF page to an image.
   * react-pageflip works with HTML elements,
   * so the PDF pages are converted to images.
   */
  useEffect(() => {
    let cancelled = false;

    let pdfDocument:
      | pdfjs.PDFDocumentProxy
      | null = null;

    async function loadBook() {
      try {
        setLoading(true);
        setError('');
        setPages([]);
        setProgress(0);

        if (!fileUrl) {
          throw new Error(
            'PDF URL is missing.',
          );
        }

        const loadingTask =
          pdfjs.getDocument({
            url: fileUrl,
            withCredentials: false,
          });

        pdfDocument =
          await loadingTask.promise;

        const totalPages =
          pdfDocument.numPages;

        const renderedPages: string[] =
          [];

        for (
          let pageNumber = 1;
          pageNumber <=
          totalPages;
          pageNumber++
        ) {
          if (cancelled) {
            return;
          }

          const page =
            await pdfDocument.getPage(
              pageNumber,
            );

          const viewport =
            page.getViewport({
              scale: 1.5,
            });

          const canvas =
            document.createElement(
              'canvas',
            );

          const context =
            canvas.getContext(
              '2d',
            );

          if (!context) {
            throw new Error(
              'Could not create canvas.',
            );
          }

          canvas.width = Math.ceil(
            viewport.width,
          );

          canvas.height = Math.ceil(
            viewport.height,
          );

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          if (cancelled) {
            page.cleanup();
            return;
          }

          renderedPages.push(
            canvas.toDataURL(
              'image/jpeg',
              0.9,
            ),
          );

          page.cleanup();

          setProgress(
            Math.round(
              (pageNumber /
                totalPages) *
                100,
            ),
          );

          /*
           * Don't keep large canvas buffers alive.
           */
          canvas.width = 0;
          canvas.height = 0;
        }

        if (!cancelled) {
          setPages(renderedPages);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          'Book mode error:',
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load book view.',
          );

          setLoading(false);
        }
      } finally {
        if (pdfDocument) {
          try {
            await pdfDocument.destroy();
          } catch {
            // Ignore cleanup error.
          }

          pdfDocument = null;
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  /*
   * Mobile = single page
   * Desktop = two-page book spread
   */
  const isMobile =
    containerWidth > 0 &&
    containerWidth < 768;

  /*
   * Keep the book inside the viewport.
   */
  const horizontalPadding =
    isMobile ? 8 : 32;

  const availableWidth =
    Math.max(
      280,
      containerWidth -
        horizontalPadding,
    );

  /*
   * Maximum physical page width.
   */
  const maxPageWidth =
    isMobile ? 500 : 520;

  /*
   * Desktop:
   * two pages side by side.
   *
   * Mobile:
   * one page wide.
   */
  const pageWidth = isMobile
    ? Math.min(
        availableWidth,
        maxPageWidth,
      )
    : Math.min(
        (availableWidth - 16) /
          2,
        maxPageWidth,
      );

  /*
   * A4-like portrait ratio.
   */
  const pageHeight = Math.round(
    pageWidth * 1.414,
  );

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="flex min-h-[calc(100dvh-140px)] items-center justify-center px-4"
      >
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen
              size={22}
              className="text-primary"
            />
          </div>

          <p className="text-sm font-medium text-foreground">
            Preparing book view...
          </p>


          <div className="mx-auto mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {progress}%
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={containerRef}
        className="flex min-h-[calc(100dvh-140px)] items-center justify-center px-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
          <p className="text-sm font-medium text-red-700">
            Could not open book view.
          </p>

          <p className="mt-2 break-words text-xs text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div
        ref={containerRef}
        className="flex min-h-[calc(100dvh-140px)] items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">
          No pages found.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="book-view-container flex min-h-0 w-full flex-1 flex-col overflow-hidden"
    >
      {/* Book background */}
      <div className="book-stage flex min-h-0 flex-1 items-center justify-center overflow-hidden px-1 py-3 sm:px-3 sm:py-5">
        <HTMLFlipBook
          key={`${isMobile ? 'mobile' : 'desktop'}-${pageWidth}-${pageHeight}`}
          width={pageWidth}
          height={pageHeight}
          size="fixed"
          minWidth={280}
          maxWidth={520}
          minHeight={396}
          maxHeight={740}
          drawShadow={true}
          flippingTime={750}
          usePortrait={isMobile}
          startZIndex={0}
          showCover={true}
          mobileScrollSupport={true}
          startPage={0}
          autoSize={false}
          maxShadowOpacity={0.4}
          showPageCorners={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          swipeDistance={20}
          clickEventForward={true}
          className="pdf-flip-book"
          style={{
            margin: '0 auto',
          }}
        >
          {pages.map(
            (
              image,
              index,
            ) => (
              <div
                key={`book-page-${index}`}
                className="overflow-hidden bg-white"
              >
                <BookPage
                  image={image}
                  pageNumber={
                    index + 1
                  }
                />
              </div>
            ),
          )}
        </HTMLFlipBook>
      </div>

      {/* Book hint */}
      <div className="flex shrink-0 items-center justify-center border-t border-border/60 bg-background/95 px-3 py-2 text-center text-[11px] text-muted-foreground backdrop-blur">
        {isMobile
          ? 'Swipe left or right to turn pages'
          : 'Click, drag, or use the page corner to turn pages'}
      </div>

      <style>{`
        .book-view-container {
          background:
            radial-gradient(
              circle at center top,
              rgba(255,255,255,0.98),
              rgba(241,245,249,0.98)
            );
        }

        .book-stage {
          min-height: 0;
        }

        .pdf-flip-book {
          flex-shrink: 0;
        }

        .book-stage
          > div {
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .book-stage {
            padding:
              8px
              2px
              10px;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   NOTE VIEWER
   ========================================================= */

export default function NoteViewer() {
  const { noteId } =
    useParams<{
      noteId?: string;
    }>();

  const { isReady } =
    useAuthGuard();

  const [note, setNote] =
    useState<NoteItem | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [viewMode, setViewMode] =
    useState<ViewMode>('pdf');

  /*
   * Remove #page= / other fragments from the URL.
   */
  const pdfUrl = useMemo(() => {
    if (!note?.url) {
      return '';
    }

    return note.url.split('#')[0];
  }, [note?.url]);

  /*
   * IMPORTANT:
   * Keep plugin creation OUTSIDE useMemo.
   * This avoids the hook warning you were
   * getting earlier.
   */
  const defaultLayoutPluginInstance =
    defaultLayoutPlugin({
      renderToolbar,
      sidebarTabs: () => [],
    });

  /*
   * Fetch note.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchNote() {
      if (!isReady || !noteId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          'Fetching note:',
          noteId,
        );

        const {
          data,
          error: fetchError,
        } = await supabase
          .from('notes')
          .select(
            'id, title, unit, url',
          )
          .eq(
            'id',
            noteId,
          )
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error(
            'Note not found.',
          );
        }

        if (!cancelled) {
          setNote(
            data as NoteItem,
          );
        }
      } catch (err) {
        console.error(
          'Error fetching note:',
          err,
        );

        if (!cancelled) {
          setNote(null);
          setError(
            'Note not found.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchNote();

    return () => {
      cancelled = true;
    };
  }, [isReady, noteId]);

  /*
   * Same back behavior as your original UI.
   */
  const handleBack = () => {
    window.history.back();
  };

  /*
   * Auth loading screen.
   */
  if (!isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex h-10 w-10 items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-primary"
          />
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <PageTransition className="flex min-h-[100dvh] flex-col overflow-hidden bg-background">
        {/* ===================================================
            HEADER
           =================================================== */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-950 px-4 pb-4 pt-4 text-white sm:px-6 sm:pb-5 sm:pt-5 md:px-10">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />

          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Top row */}
            <div className="flex items-center gap-4">
              {/* Back */}
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                <ArrowLeft
                  size={16}
                />

                <span>
                  Back
                </span>
              </button>

              {/* Title */}
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={18}
                  className="hidden shrink-0 text-white/75 sm:block"
                />

                <div className="min-w-0">
                  <h1 className="truncate font-serif text-base font-bold leading-snug sm:text-xl">
                    {note?.title ??
                      'Note Viewer'}
                  </h1>

                
                </div>
              </div>
            </div>

            {/* View switch */}
            {note && (
              <div className="flex w-full justify-start">
                <div className="inline-flex rounded-xl border border-white/15 bg-black/20 p-1 backdrop-blur">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        'pdf',
                      )
                    }
                    className={[
                      'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm',
                      viewMode ===
                      'pdf'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    <FileText
                      size={15}
                    />

                    PDF View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        'book',
                      )
                    }
                    className={[
                      'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm',
                      viewMode ===
                      'book'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    <BookOpen
                      size={15}
                    />

                    Book View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            CONTENT AREA
           =================================================== */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Loading */}
          {loading && (
            <div className="flex min-h-0 flex-1 items-center justify-center px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2
                  size={18}
                  className="animate-spin text-primary"
                />

                <span>
                  Loading note...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading &&
            error && (
              <div className="flex min-h-0 flex-1 items-center justify-center px-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

          {/* No URL */}
          {!loading &&
            !error &&
            note &&
            !pdfUrl && (
              <div className="flex min-h-0 flex-1 items-center justify-center px-4">
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                  This note does not have a PDF URL.
                </div>
              </div>
            )}

          {/* =================================================
              PDF VIEW
             ================================================= */}
          {!loading &&
            !error &&
            note &&
            pdfUrl &&
            viewMode ===
              'pdf' && (
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <Worker
                  workerUrl={
                    WORKER_URL
                  }
                >
                  <div className="h-full w-full">
                    <Viewer
                      fileUrl={
                        pdfUrl
                      }
                      plugins={[
                        defaultLayoutPluginInstance,
                      ]}
                      renderLoader={() => (
                        <div className="flex h-full min-h-[calc(100dvh-170px)] w-full items-center justify-center text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Loader2
                              size={18}
                              className="animate-spin text-primary"
                            />

                            <span>
                              Opening PDF...
                            </span>
                          </div>
                        </div>
                      )}
                      renderError={(
                        viewerError,
                      ) => {
                        console.error(
                          'PDF viewer error:',
                          viewerError,
                        );

                        return (
                          <div className="flex h-full min-h-[calc(100dvh-170px)] w-full items-center justify-center px-4">
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-900/50 dark:bg-red-950/30">
                              Could not load this PDF.
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                </Worker>
              </div>
            )}

          {/* =================================================
              BOOK VIEW
             ================================================= */}
          {!loading &&
            !error &&
            note &&
            pdfUrl &&
            viewMode ===
              'book' && (
              <PDFBookMode
                fileUrl={
                  pdfUrl
                }
              />
            )}
        </div>
      </PageTransition>
    </AppShell>
  );
}