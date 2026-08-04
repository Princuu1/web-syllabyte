import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Clock3, Menu, Send, Sparkles, Trash2, X } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGetProfile } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
  renderText?: string;
  typing?: boolean;
  reasoning?: string;
  model?: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

type StoredMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
  reasoning?: string;
  model?: string;
};

type StoredSession = {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: number;
  updatedAt: number;
};

type ModelOption = {
  label: string;
  value: string;
  provider: string;
};

const API_URL = "http://localhost:5173/api/chatbot";
const STORAGE_SESSIONS = "syllabyte-ai-chat-sessions-v7";
const STORAGE_ACTIVE = "syllabyte-ai-active-session-v7";
const STORAGE_MODEL = "syllabyte-ai-selected-model-v1";

const WELCOME_TEXT =
  "Hi! I’m Syllabyte AI. Ask me anything about your syllabus, a topic, or exam prep.";

const MODEL_OPTIONS: ModelOption[] = [
  {
    label: "⭐ Syllabyte Swift",
    value: "gemini-3.5-flash",
    provider: "Syllabyte AI",
  },
  {
    label: "Syllabyte Core",
    value: "gemini-2.5-flash",
    provider: "Syllabyte AI",
  },
  {
    label: "Syllabyte Prime",
    value: "qwen/qwen3.6-27b",
    provider: "Syllabyte AI",
  },
  {
    label: "Syllabyte Apex",
    value: "openai/gpt-oss-120b",
    provider: "Syllabyte AI",
  },
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function truncate(text: string, max = 46) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function titleFromMessage(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.split(" ").filter(Boolean);
  return words.slice(0, 5).join(" ") || "New chat";
}

function makeWelcomeMessage(): ChatMessage {
  return {
    id: uid(),
    role: "assistant",
    text: WELCOME_TEXT,
    createdAt: Date.now(),
    renderText: WELCOME_TEXT,
    typing: false,
  };
}

function makeNewSession(): ChatSession {
  const now = Date.now();
  return {
    id: uid(),
    title: "New chat",
    messages: [makeWelcomeMessage()],
    createdAt: now,
    updatedAt: now,
  };
}

function serializeSessions(sessions: ChatSession[]): StoredSession[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messages: session.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      text: msg.text,
      createdAt: msg.createdAt,
      reasoning: msg.reasoning,
      model: msg.model,
    })),
  }));
}

function hydrateSessions(stored: StoredSession[]): ChatSession[] {
  return stored.map((session) => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messages: session.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      text: msg.text,
      createdAt: msg.createdAt,
      reasoning: msg.reasoning,
      model: msg.model,
      renderText: msg.text,
      typing: false,
    })),
  }));
}

function extractThinkBlock(raw: string) {
  const matches = [...raw.matchAll(/<think>([\s\S]*?)<\/think>/gi)];
  const reasoning = matches
    .map((match) => match[1]?.trim())
    .filter(Boolean)
    .join("\n\n");

  const answer = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  return {
    hasReasoning: matches.length > 0,
    reasoning,
    answerText: answer || "No response received.",
  };
}

function isQwenModel(model: string) {
  return model.startsWith("qwen/");
}

function ThinkingDots() {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <span className="relative flex h-3.5 w-12 items-end justify-between">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.25s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.05s]" />
      </span>
    </div>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-2 mb-2 text-lg font-semibold text-zinc-900 sm:text-xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2 mb-2 text-base font-semibold text-zinc-900 sm:text-lg">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 text-sm font-semibold text-zinc-900 sm:text-base">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-900 sm:text-[15px]">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-4 border-zinc-200" />,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-7 text-zinc-900 sm:text-[15px]">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 sm:text-[15px]">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-zinc-900 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }: any) => {
    const isBlock = /language-/.test(className || "");

    if (isBlock) {
      return (
        <code
          className={
            "block overflow-x-auto rounded-2xl bg-zinc-950 p-4 font-mono text-sm text-zinc-100 " +
            (className || "")
          }
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-900"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-zinc-100">
      {children}
    </div>
  ),
  table: ({ children }) => (
    <div className="my-3 w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-zinc-200 last:border-b-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border-r border-zinc-200 px-3 py-2 text-left font-semibold last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-r border-zinc-200 px-3 py-2 align-top last:border-r-0">
      {children}
    </td>
  ),
};

function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {String(text)}
    </ReactMarkdown>
  );
}

type SidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
};

function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
}: SidebarProps) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Chats</h2>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Syllabyte AI
          </p>
        </div>

        <button
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-medium text-zinc-900 transition hover:bg-zinc-100"
        >
          <Sparkles size={16} />
          New chat
        </button>
      </div>

      <div className="px-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          History
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-2">
          {sorted.map((session) => {
            const lastMessage = [...session.messages].reverse().find(Boolean);
            const preview =
              lastMessage?.role === "user"
                ? `You: ${truncate(lastMessage.text, 36)}`
                : truncate(lastMessage?.text ?? "No messages yet", 42);

            const active = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={[
                  "group rounded-2xl border px-3 py-3 transition",
                  active
                    ? "border-zinc-300 bg-zinc-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                ].join(" ")}
              >
                <button
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {session.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {preview}
                      </p>
                    </div>
                    <div className="mt-0.5 flex shrink-0 items-center gap-2 text-zinc-400">
                      <Clock3 size={14} />
                    </div>
                  </div>
                </button>

                <div className="mt-2 flex items-center justify-end">
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                    aria-label={`Delete ${session.title}`}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-200 p-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
          <p className="font-medium text-zinc-900">AI note</p>
          <p className="mt-1 leading-6">
            AI can make mistakes. Recheck important answers.
          </p>
        </div>
      </div>
    </div>
  );
}

type ComposerProps = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSend: () => void;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  textareaHeight: number;
  textareaScrollable: boolean;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
};

function Composer({
  message,
  setMessage,
  loading,
  onSend,
  textareaRef,
  textareaHeight,
  textareaScrollable,
  selectedModel,
  setSelectedModel,
}: ComposerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-[1.25rem] border border-zinc-200 bg-white/80 px-3 py-3 shadow-sm backdrop-blur-md sm:bg-white">
        <label className="sr-only" htmlFor="chat-input">
          Ask SyllaByte AI
        </label>

        <div className="relative">
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask SyllaByte AI"
            rows={1}
            className="w-full resize-none border-0 bg-transparent px-1 py-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0"
            style={{
              height: `${textareaHeight}px`,
              overflowY: textareaScrollable ? "auto" : "hidden",
              lineHeight: "1.35rem",
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <label className="relative inline-flex w-full max-w-[180px] items-center sm:max-w-[220px]">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 outline-none transition focus:border-zinc-300"
              aria-label="Select AI model"
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
              {selectedModel &&
                !MODEL_OPTIONS.some((model) => model.value === selectedModel) && (
                  <option value={selectedModel}>
                    {selectedModel}
                  </option>
                )}
            </select>

            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute right-3 h-4 w-4 text-zinc-500"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>

          <button
            type="button"
            onClick={onSend}
            disabled={!message.trim() || loading}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
            title="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { rollNo, user } = useAuth();
  const { isReady } = useAuthGuard();

  const { data: profile } = useGetProfile(rollNo || "", {
    query: { enabled: !!rollNo && isReady } as any,
  });

  const displayName =
    profile?.student_name?.trim() || user?.email?.split("@")?.[0] || "Student";

  const [seed] = useState(() => makeNewSession());
  const [sessions, setSessions] = useState<ChatSession[]>([seed]);
  const [activeSessionId, setActiveSessionId] = useState<string>(seed.id);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");

  const [typingJob, setTypingJob] = useState<{
    sessionId: string;
    messageId: string;
    fullText: string;
  } | null>(null);

  const [thinkingJob, setThinkingJob] = useState<{
    sessionId: string;
    messageId: string;
    fullText: string;
    delayMs: number;
  } | null>(null);

  const [expandedReasoning, setExpandedReasoning] = useState<
    Record<string, boolean>
  >({});

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [textareaHeight, setTextareaHeight] = useState(44);
  const [textareaScrollable, setTextareaScrollable] = useState(false);

  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) ?? sessions[0];
  }, [sessions, activeSessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawSessions = window.localStorage.getItem(STORAGE_SESSIONS);
      const rawActive = window.localStorage.getItem(STORAGE_ACTIVE);
      const rawModel = window.localStorage.getItem(STORAGE_MODEL);

      if (rawModel) {
        setSelectedModel(rawModel);
      }

      if (rawSessions) {
        const parsed = JSON.parse(rawSessions) as StoredSession[];
        const hydratedSessions = hydrateSessions(parsed);

        if (hydratedSessions.length > 0) {
          setSessions(hydratedSessions);
          const activeExists =
            rawActive && hydratedSessions.some((s) => s.id === rawActive);
          setActiveSessionId(activeExists ? rawActive : hydratedSessions[0].id);
        } else {
          const starter = makeNewSession();
          setSessions([starter]);
          setActiveSessionId(starter.id);
        }
      } else {
        const starter = makeNewSession();
        setSessions([starter]);
        setActiveSessionId(starter.id);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      const starter = makeNewSession();
      setSessions([starter]);
      setActiveSessionId(starter.id);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_SESSIONS,
        JSON.stringify(serializeSessions(sessions)),
      );
      window.localStorage.setItem(STORAGE_ACTIVE, activeSessionId);
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [sessions, activeSessionId, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_MODEL, selectedModel);
    } catch (error) {
      console.error("Failed to save model selection:", error);
    }
  }, [selectedModel, hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, loading, typingJob, thinkingJob]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const maxHeight = 9 * 22 + 22;
    el.style.height = "0px";
    const nextHeight = Math.min(el.scrollHeight, maxHeight);

    el.style.height = `${Math.max(44, nextHeight)}px`;
    setTextareaHeight(Math.max(44, nextHeight));
    setTextareaScrollable(el.scrollHeight > maxHeight);
  }, [message]);

  useEffect(() => {
    if (!thinkingJob) return;

    const timer = window.setTimeout(() => {
      setTypingJob({
        sessionId: thinkingJob.sessionId,
        messageId: thinkingJob.messageId,
        fullText: thinkingJob.fullText,
      });
      setThinkingJob(null);
    }, thinkingJob.delayMs);

    return () => window.clearTimeout(timer);
  }, [thinkingJob]);

  useEffect(() => {
    if (!typingJob) return;

    const { sessionId, messageId, fullText } = typingJob;
    let index = 0;
    const step = Math.max(1, Math.ceil(fullText.length / 50));

    const interval = window.setInterval(() => {
      index = Math.min(fullText.length, index + step);
      const visible = fullText.slice(0, index);

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;

          return {
            ...session,
            updatedAt: Date.now(),
            messages: session.messages.map((msg) => {
              if (msg.id !== messageId) return msg;
              return {
                ...msg,
                renderText: visible,
                typing: index < fullText.length,
              };
            }),
          };
        }),
      );

      if (index >= fullText.length) {
        window.clearInterval(interval);

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== sessionId) return session;

            return {
              ...session,
              updatedAt: Date.now(),
              messages: session.messages.map((msg) => {
                if (msg.id !== messageId) return msg;
                return {
                  ...msg,
                  renderText: fullText,
                  typing: false,
                };
              }),
            };
          }),
        );

        setTypingJob(null);
        setLoading(false);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [typingJob]);

  const newChat = () => {
    const session = makeNewSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessage("");
    setSidebarOpen(false);
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setMessage("");
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((session) => session.id !== id);

      if (remaining.length === 0) {
        const fresh = makeNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }

      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }

      return remaining;
    });

    setSidebarOpen(false);
  };

  const updateCurrentSession = (
    updater: (session: ChatSession) => ChatSession,
  ) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        return updater(session);
      }),
    );
  };

  const sendMessage = async (customMessage?: string) => {
    const userMessage = (customMessage ?? message).trim();
    if (!userMessage || loading || !currentSession) return;

    const sessionId = currentSession.id;
    const now = Date.now();

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: userMessage,
      createdAt: now,
      renderText: userMessage,
      typing: false,
    };

    updateCurrentSession((session) => {
      const firstUserMessageCount = session.messages.filter(
        (m) => m.role === "user",
      ).length;

      return {
        ...session,
        title:
          session.title === "New chat" && firstUserMessageCount === 0
            ? titleFromMessage(userMessage)
            : session.title,
        updatedAt: now,
        messages: [...session.messages, userMsg],
      };
    });

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const rawReply = String(data.reply ?? "");
      const parsed = extractThinkBlock(rawReply);
      const assistantMessageId = uid();

      const assistantMsg: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        text: parsed.answerText,
        reasoning: parsed.reasoning || undefined,
        model: selectedModel,
        createdAt: Date.now(),
        renderText: "",
        typing: true,
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          return {
            ...session,
            updatedAt: Date.now(),
            messages: [...session.messages, assistantMsg],
          };
        }),
      );

      const startTyping = () => {
        setTypingJob({
          sessionId,
          messageId: assistantMessageId,
          fullText: parsed.answerText,
        });
      };

      if (parsed.hasReasoning && isQwenModel(selectedModel)) {
        const delayMs = Math.min(
          1800,
          Math.max(900, parsed.reasoning.length * 8),
        );

        setThinkingJob({
          sessionId,
          messageId: assistantMessageId,
          fullText: parsed.answerText,
          delayMs,
        });
      } else {
        startTyping();
      }
    } catch (error) {
      console.error(error);
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          return {
            ...session,
            updatedAt: Date.now(),
            messages: [
              ...session.messages,
              {
                id: uid(),
                role: "assistant",
                text: "This model is experiencing high traffic right now. Please try again shortly or switch to another model.",
                createdAt: Date.now(),
                renderText:
                  "This model is experiencing high traffic right now. Please try again shortly or switch to another model.",
                typing: false,
              },
            ],
          };
        }),
      );
      setLoading(false);
    }
  };

  const safeSession = currentSession ?? sessions[0];

  const visibleMessages =
    safeSession?.messages?.length === 1 &&
    safeSession.messages[0]?.role === "assistant" &&
    safeSession.messages[0]?.text === WELCOME_TEXT
      ? []
      : safeSession?.messages ?? [];

  const showEmptyState = visibleMessages.length === 0;
  const showFooterNote = visibleMessages.some((msg) => msg.role === "assistant");

  if (!isReady) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <PageTransition className="h-full">
        <div className="flex h-[100dvh] w-full overflow-hidden bg-[#fbfaf6] text-zinc-900">
          <AnimatePresence>
            {sidebarOpen && (
              <div className="fixed inset-0 z-[90]">
                <button
                  aria-label="Close sidebar overlay"
                  className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -380 }}
                  animate={{ x: 0 }}
                  exit={{ x: -380 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="relative z-[91] h-[100dvh] w-[88vw] max-w-[360px] border-r border-zinc-200 bg-white shadow-2xl"
                >
                  <Sidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={selectSession}
                    onNewChat={newChat}
                    onDeleteSession={deleteSession}
                    onClose={() => setSidebarOpen(false)}
                  />
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm"
                  aria-label="Open chatbot sidebar"
                  title="Menu"
                >
                  <Menu size={18} />
                </button>

                <div className="flex flex-1 flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold tracking-tight sm:text-base">
                    SyllaByte AI
                  </p>
                </div>

                <button
                  onClick={newChat}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition hover:bg-zinc-50"
                  aria-label="New chat"
                  title="New chat"
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-4 pb-4 sm:px-6">
                <div className="flex min-h-full w-full flex-col">
                  {showEmptyState ? (
                   <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16 text-center md:-translate-y-10">
  <img
    src="/syllabyteai.png"
    alt="SyllaByte AI"
    className="mb-5 h-14 w-14 object-contain sm:h-16 sm:w-16"
  />

  <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
    How can I help, {displayName}?
  </h1>

  <div className="mt-8 w-full max-w-3xl">
    <Composer
      message={message}
      setMessage={setMessage}
      loading={loading}
      onSend={() => sendMessage()}
      textareaRef={textareaRef}
      textareaHeight={textareaHeight}
      textareaScrollable={textareaScrollable}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
    />
  </div>
</div>
                  ) : (
                    <div className="space-y-4 py-4 sm:py-6">
                      {visibleMessages.map((msg, index) => {
                        const isUser = msg.role === "user";
                        const visibleText = msg.typing
                          ? msg.renderText ?? ""
                          : msg.renderText ?? msg.text;
                        const showReasoning =
                          !isUser &&
                          Boolean(msg.reasoning) &&
                          Boolean(msg.model?.startsWith("qwen/"));
                        const isReasoningOpen = Boolean(
                          expandedReasoning[msg.id],
                        );

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.18,
                              delay: Math.min(index * 0.01, 0.1),
                            }}
                            className={"flex " + (isUser ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={[
                                "max-w-[90%] sm:max-w-[78%]",
                                isUser ? "mr-6 sm:mr-14" : "",
                              ].join(" ")}
                            >
                              {isUser ? (
                                <div className="rounded-[1.25rem] bg-[#f3f3f3] px-4 py-3 text-black shadow-sm">
                                  <p className="whitespace-pre-wrap text-sm leading-7 text-black sm:text-[15px]">
                                    {visibleText}
                                  </p>
                                </div>
                              ) : (
                                <div className="px-1 py-1 text-black">
                                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                    SyllaByte AI
                                  </div>

                                  {msg.typing && !visibleText.trim() ? (
                                    <ThinkingDots />
                                  ) : (
                                    <>
                                      <MarkdownMessage text={visibleText} />

                                      {showReasoning && (
                                        <div className="mt-3">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setExpandedReasoning((prev) => ({
                                                ...prev,
                                                [msg.id]: !prev[msg.id],
                                              }))
                                            }
                                            className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
                                          >
                                            {isReasoningOpen
                                              ? "Hide reasoning"
                                              : "Show reasoning"}
                                          </button>

                                          <AnimatePresence initial={false}>
                                            {isReasoningOpen && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0, y: -4 }}
                                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: -4 }}
                                                transition={{ duration: 0.18 }}
                                                className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3"
                                              >
                                                <p className="whitespace-pre-wrap text-[12px] leading-6 text-zinc-700">
                                                  {msg.reasoning}
                                                </p>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
            </div>

            {!showEmptyState && (
              <div className="shrink-0 px-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-4">
                <Composer
                  message={message}
                  setMessage={setMessage}
                  loading={loading}
                  onSend={() => sendMessage()}
                  textareaRef={textareaRef}
                  textareaHeight={textareaHeight}
                  textareaScrollable={textareaScrollable}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />

                {showFooterNote && (
                  <div className="mt-3 px-2 text-center text-[11px] text-zinc-500">
                    SyllaByte AI can make mistakes. Recheck important answers.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </PageTransition>
    </AppShell>
  );
}