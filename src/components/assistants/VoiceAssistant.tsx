import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, RotateCcw, Square, X, Volume2 } from "lucide-react";
import { useAppState } from "@/context/AppStateProvider";
import { chatService } from "@/services";
import { Button, DemoBadge, Pill } from "@/components/common/Primitives";

type VoiceState = "ready" | "listening" | "processing" | "speaking";

const STATE_COPY: Record<VoiceState, string> = {
  ready: "Tap the microphone to speak.",
  listening: "Listening to your voice…",
  processing: "Thinking with Groq AI…",
  speaking: "LifeRoute AI is speaking…",
};

const LANGUAGES = [
  "English",
  "हिन्दी (Hindi)",
  "Hinglish",
  "मराठी",
  "বাংলা",
  "தமிழ்",
  "తెలుగు",
  "ગુજરાતી",
];

const COMMANDS = [
  "I need an ambulance.",
  "What should I do for severe bleeding?",
  "Signs of a heart attack?",
  "Where is my ambulance?",
  "Find the nearest hospital.",
  "Show my medical records.",
];

export function VoiceAssistant() {
  const { voiceOpen, setVoiceOpen } = useAppState();
  const navigate = useNavigate();
  const [state, setState] = useState<VoiceState>("ready");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speakText(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setState("ready");
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setState("ready"), 2500);
    }
  }

  async function listen(sample?: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setConfirmEmergency(false);
    setResponse("");

    if (sample) {
      setTranscript(sample);
      setState("processing");
      await route(sample);
      return;
    }

    // Try live browser speech recognition if supported

    interface BrowserSpeechRecognition {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (event: { results: { 0: { transcript: string } }[] }) => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = language && language.includes("हिन्दी") ? "hi-IN" : "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setState("listening");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = async (event: any) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(spokenText);
          setState("processing");
          await route(spokenText);
        };

        recognition.onerror = async () => {
          // Fallback if mic permission denied or timeout
          const fallbackText = "What should I do in an emergency?";
          setTranscript(fallbackText);
          setState("processing");
          await route(fallbackText);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Speech recognition initialization fallback:", err);
      }
    }

    // Fallback simulation when browser speech API is unavailable
    setState("listening");
    await new Promise((r) => setTimeout(r, 1200));
    const fallbackQuestion = "How to treat severe chest pain?";
    setTranscript(fallbackQuestion);
    setState("processing");
    await route(fallbackQuestion);
  }

  async function route(text: string) {
    const t = text.toLowerCase();

    // Emergency Ambulance trigger
    if (
      t.includes("ambulance chahiye") ||
      t.includes("need an ambulance") ||
      t.includes("accident") ||
      t.includes("emergency")
    ) {
      setConfirmEmergency(true);
      setState("ready");
      setResponse("Emergency ambulance trigger detected. Confirm dispatch below.");
      speakText("Emergency ambulance trigger detected. Please confirm dispatch.");
      return;
    }

    // Direct Navigation routes
    if (
      t.includes("where is my ambulance") ||
      t.includes("track ambulance") ||
      t.includes("tracking")
    ) {
      setState("speaking");
      setResponse("Opening live ambulance tracking screen.");
      speakText("Opening live ambulance tracking screen.");
      setTimeout(() => {
        setVoiceOpen(false);
        navigate({ to: "/ambulance/tracking" });
      }, 1200);
      return;
    }

    if (t.includes("hospital") || t.includes("doctor")) {
      setState("speaking");
      setResponse("Showing nearest hospitals with available emergency beds.");
      speakText("Showing nearest hospitals with available emergency beds.");
      setTimeout(() => {
        setVoiceOpen(false);
        navigate({ to: "/hospitals" });
      }, 1200);
      return;
    }

    if (t.includes("record") || t.includes("allerg") || t.includes("prescription")) {
      setState("speaking");
      setResponse("Opening your secure medical records vault.");
      speakText("Opening your secure medical records vault.");
      setTimeout(() => {
        setVoiceOpen(false);
        navigate({ to: "/records" });
      }, 1200);
      return;
    }

    if (t.includes("payment") || t.includes("bill")) {
      setState("speaking");
      setResponse("Opening payments and billing portal.");
      speakText("Opening payments and billing portal.");
      setTimeout(() => {
        setVoiceOpen(false);
        navigate({ to: "/payments" });
      }, 1200);
      return;
    }

    // General Clinical Question -> Ask Groq AI
    try {
      setState("speaking");
      const { reply } = await chatService.send(text, language);
      setResponse(reply);
      speakText(reply);
    } catch (err) {
      const fallback =
        "Stay calm and keep the patient resting comfortably. If symptoms are severe, request an ambulance immediately.";
      setResponse(fallback);
      speakText(fallback);
    }
  }

  function stop() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition already stopped or not started
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState("ready");
  }

  if (!voiceOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="LifeRoute Voice Assistant"
    >
      <div className="card-surface w-full max-w-md p-6 border-ai/40 shadow-2xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="min-w-0 truncate text-xl font-bold flex items-center gap-2 text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ai-soft text-ai">
              <Mic className="h-4 w-4" />
            </span>
            LifeRoute Voice AI
          </h2>
          <button
            aria-label="Close voice assistant"
            onClick={() => {
              stop();
              setVoiceOpen(false);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-accent"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label className="sr-only" htmlFor="voice-language">
            Voice language
          </label>
          <select
            id="voice-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs"
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <Pill tone="ai">Groq Live</Pill>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => listen()}
            aria-label="Start listening"
            className={`relative grid h-28 w-28 place-items-center rounded-full bg-ai text-ai-foreground transition-all hover:scale-105 shadow-lg ${
              state === "listening" ? "pulse-ring ring-4 ring-ai" : ""
            }`}
          >
            <Mic className="h-10 w-10" aria-hidden />
          </button>
          <p className="text-sm font-semibold text-foreground" aria-live="polite">
            {STATE_COPY[state]}
          </p>
          {transcript ? (
            <div className="rounded-xl bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
              “{transcript}”
            </div>
          ) : null}
          {response ? (
            <div className="max-h-36 overflow-y-auto rounded-xl bg-ai-soft/40 p-3 text-xs leading-relaxed text-foreground border border-ai/20">
              {response}
            </div>
          ) : null}
        </div>

        {confirmEmergency ? (
          <div className="mt-4 rounded-xl border border-emergency/40 bg-emergency-soft p-4">
            <p className="font-bold text-emergency">🚨 Urgent Medical Dispatch Triggered</p>
            <p className="mt-1 text-xs text-foreground/90">
              Dispatch the nearest ALS / BLS ambulance to your live location?
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="emergency"
                size="sm"
                className="w-full"
                onClick={() => {
                  stop();
                  setConfirmEmergency(false);
                  setVoiceOpen(false);
                  navigate({ to: "/emergency/request" });
                }}
              >
                CONFIRM & DISPATCH
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmEmergency(false)}>
                CANCEL
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Quick Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMANDS.map((c) => (
              <button
                key={c}
                onClick={() => listen(c)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:bg-accent text-foreground transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={stop}>
            <Square className="h-4 w-4" aria-hidden /> Stop Audio
          </Button>
          {transcript && (
            <Button variant="outline" size="sm" onClick={() => route(transcript)}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Repeat
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              stop();
              setVoiceOpen(false);
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
