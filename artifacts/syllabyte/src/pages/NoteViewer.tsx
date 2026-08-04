import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'wouter';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { MoreActionsPopover, type ToolbarProps, type ToolbarSlot } from '@react-pdf-viewer/toolbar';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { AppShell } from '@/components/layout/AppShell';
import { PageTransition } from '@/components/layout/PageTransition';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { NoteItem } from './notes';

function renderToolbar(Toolbar: (props: ToolbarProps) => React.ReactElement) {
  return (
    <Toolbar>
      {(toolbarSlot: ToolbarSlot) => {
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

        // Hide Open from the visible toolbar and from the 3-dot menu slot we pass in.
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
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <GoToPreviousPage />
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 h-9 text-sm min-w-[110px] justify-center">
                  <CurrentPageInput />
                  <span className="text-muted-foreground">/</span>
                  <NumberOfPages />
                </div>

                <div className="flex items-center gap-1">
                  <GoToNextPage />
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ZoomOut />
                <div className="hidden sm:block">
                  <Zoom />
                </div>
                <ZoomIn />
                <EnterFullScreen />
                <Download />
                <MoreActionsPopover toolbarSlot={toolbarSlotWithoutOpen} />
              </div>
            </div>
          </div>
        );
      }}
    </Toolbar>
  );
}

export default function NoteViewer() {
  const { noteId } = useParams();
  const { isReady } = useAuthGuard();

  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('id, title, unit, url')
          .eq('id', noteId)
          .single();

        if (error) throw error;

        setNote(data as NoteItem);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Note not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  const pdfUrl = useMemo(() => {
    if (!note?.url) return '';
    return note.url.split('#')[0];
  }, [note?.url]);

  const workerUrl = useMemo(() => {
    return 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }, []);

 const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],
});

  const handleBack = () => {
    window.history.back();
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageTransition className="flex flex-col min-h-[100dvh] bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-4 sm:pb-5 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/75 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <FileText size={18} className="text-white/75 shrink-0 hidden sm:block" />
              <h1 className="text-base sm:text-xl font-serif font-bold leading-snug truncate">
                {note?.title ?? 'Note Viewer'}
              </h1>
            </div>
          </div>
        </div>

        {/* PDF area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 min-h-0 flex items-center justify-center text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span>Loading note...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 min-h-0 flex items-center justify-center px-4">
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
                {error}
              </div>
            </div>
          ) : note ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <Worker workerUrl={workerUrl}>
                <div className="h-full w-full">
                  <Viewer
                    fileUrl={pdfUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    renderLoader={() => (
                      <div className="w-full h-[calc(100dvh-140px)] flex items-center justify-center text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="animate-spin text-primary" />
                          <span>Opening PDF...</span>
                        </div>
                      </div>
                    )}
                    renderError={(err) => {
                      console.error('PDF viewer error:', err);
                      return (
                        <div className="w-full h-[calc(100dvh-140px)] flex items-center justify-center px-4">
                          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
                            Could not load this PDF.
                          </div>
                        </div>
                      );
                    }}
                  />
                </div>
              </Worker>
            </div>
          ) : null}
        </div>
      </PageTransition>
    </AppShell>
  );
}