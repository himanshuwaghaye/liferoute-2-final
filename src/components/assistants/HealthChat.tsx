import { useRef, useState } from "react";
import { Copy, MessageCircle, Send, Trash2, Volume2, X } from "lucide-react";
import { chatService } from "@/services";
import { useAppState } from "@/context/AppStateProvider";
import { Button, DemoBadge, Pill } from "@/components/common/Primitives";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "What are the signs of a heart attack?",
  "How do I help someone who is bleeding?",
  "When should I call an ambulance?",
];

const LANGUAGES = ["English", "हिन्दी", "Hinglish", "मराठी", "বাংলা", "தமிழ்"];

/** Text-only health assistant. Deliberately separate from the Voice Assistant. */
export function HealthChat() {
  const { chatOpen, setChatOpen } = useAppState();
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      content: "How can I help you today? Ask me anything about health or healthcare.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", content: question }]);
    setBusy(true);
    try {
      const { reply } = await chatService.send(question, language);
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", content: reply }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: 99999, behavior: "smooth" }));
    }
  }

  function speak(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  }

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:bottom-24 sm:right-6">
      <div className="card-surface flex h-[78vh] w-full flex-col overflow-hidden p-0 sm:h-[560px] sm:w-[400px]">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-primary-soft px-4 py-3">
          <div className="min-w-0">
            <h2 className="flex min-w-0 items-center gap-2 truncate text-base font-semibold">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              LifeRoute Health Assistant
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              Ask questions about health and healthcare.
            </p>
          </div>
          <button
            aria-label="Close health chat"
            onClick={() => setChatOpen(false)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <label className="sr-only" htmlFor="chat-language">
            Language
          </label>
          <select
            id="chat-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <DemoBadge />
          <button
            onClick={() =>
              setMessages([
                { id: "m0", role: "assistant", content: "Chat cleared. How can I help?" },
              ])
            }
            className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Clear
          </button>
        </div>

        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] animate-rise rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] animate-rise rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
                }
              >
                {m.content}
                {m.role === "assistant" ? (
                  <div className="mt-2 flex gap-2 text-muted-foreground">
                    <button
                      aria-label="Copy answer"
                      onClick={() => navigator.clipboard?.writeText(m.content)}
                      className="hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      aria-label="Read answer aloud"
                      onClick={() => speak(m.content)}
                      className="hover:text-foreground"
                    >
                      <Volume2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {busy ? <Pill>Assistant is typing…</Pill> : null}
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health question"
            aria-label="Type your health question"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="sm" aria-label="Send message">
            <Send className="h-4 w-4" aria-hidden /> Send
          </Button>
        </form>
      </div>
    </div>
  );
}
