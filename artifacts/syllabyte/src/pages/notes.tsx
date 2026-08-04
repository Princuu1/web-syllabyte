import React from 'react';
import { Eye, FileText, Loader2 } from 'lucide-react';

export type NoteItem = {
  id: string;
  title: string;
  unit: string;
  url: string;
};

type NotesProps = {
  notes: NoteItem[];
  notesLoading: boolean;
  notesError: string | null;
  unitId: string;
  onSeeNote: (note: NoteItem) => void;
};

export function Notes({
  notes,
  notesLoading,
  notesError,
  unitId,
  onSeeNote,
}: NotesProps) {
  if (notesLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
        <Loader2 size={18} className="animate-spin text-primary" />
        Loading notes...
      </div>
    );
  }

  if (notesError) {
    return (
      <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        {notesError}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
        No notes available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/30 hover:shadow-primary/5 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <FileText size={18} className="text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-[15px] leading-snug truncate">
                {note.title}
              </h3>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSeeNote(note)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Eye size={16} />
                  See
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}