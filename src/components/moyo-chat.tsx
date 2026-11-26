"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatLink = { label: string; href: string };
type Message = { id: number; from: "moyo" | "you"; text: string; links?: ChatLink[] };
type Rule = { words: string[]; reply: string; links?: ChatLink[] };

// Moyo answers from these topics. Each rule matches whole words in the visitor's question.
const RULES: Rule[] = [
  {
    words: ["hi", "hello", "hey", "morning", "afternoon"],
    reply: "Hi there! What can I help you with today?",
  },
  {
    words: ["prescription", "prescriptions", "script", "refill", "repeat"],
    reply: "You can send your prescription to us online. Upload a clear photo or PDF and a pharmacist will check it before anything is dispensed.",
    links: [{ label: "Send a prescription", href: "/prescriptions" }],
  },
  {
    words: ["branch", "branches", "pharmacy", "store", "location", "near", "nearest", "hours", "open"],
    reply: "Find the Link Pharmacy branch nearest you, with opening hours and the services each branch offers.",
    links: [{ label: "Find a pharmacy", href: "/find-a-pharmacy" }],
  },
  {
    words: ["appointment", "appointments", "book", "booking", "doctor", "clinic", "consultation", "mediclinic"],
    reply: "You can request an appointment at Link Mediclinic. Tell us what you need and our team will confirm a time with you.",
    links: [{ label: "Request an appointment", href: "/mediclinic" }],
  },
  {
    words: ["delivery", "deliver", "shipping", "courier", "post"],
    reply: "We deliver to many areas. Delivery times and costs depend on where you are, so check the details before you order.",
    links: [{ label: "Shipping and delivery", href: "/shipping-delivery" }],
  },
  {
    words: ["health", "blog", "article", "articles", "advice", "tips"],
    reply: "Our health blog has clear, practical articles from our pharmacists and clinicians.",
    links: [{ label: "Read the health blog", href: "/blog" }],
  },
  {
    words: ["return", "returns", "refund", "exchange"],
    reply: "You can read about returns and refunds on our returns page.",
    links: [{ label: "Returns", href: "/returns" }],
  },
];

const FALLBACK: Rule = {
  words: [],
  reply: "I'm not sure about that one yet. Our team can help. Send us a message and we will get back to you.",
  links: [{ label: "Message our team", href: "/customer-care" }],
};

const SUGGESTIONS = ["Send a prescription", "Find a branch", "Book an appointment", "Delivery"];

/** The first topic whose words appear in the question, or a helpful fallback. */
export function answerFor(question: string): Rule {
  const text = question.toLowerCase();
  return RULES.find((rule) => rule.words.some((word) => new RegExp(`\\b${word}\\b`).test(text))) ?? FALLBACK;
}

const GREETING: Message = {
  id: 0,
  from: "moyo",
  text: "Hi, I'm Moyo. Ask me about prescriptions, branches, appointments or delivery.",
};

/** Floating chat button on the marketing pages. Opens a panel where Moyo answers common questions. */
export function MoyoChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function ask(question: string) {
    const text = question.trim();
    if (!text || thinking) return;
    const answer = answerFor(text);
    const youId = nextId.current++;
    const moyoId = nextId.current++;
    setMessages((current) => [...current, { id: youId, from: "you", text }]);
    setDraft("");
    setThinking(true);
    // A short pause so the reply feels like a conversation rather than an instant jump.
    timer.current = setTimeout(() => {
      setMessages((current) => [...current, { id: moyoId, from: "moyo", text: answer.reply, links: answer.links }]);
      setThinking(false);
    }, 600);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(draft);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <section
          id="moyo-chat-panel"
          aria-label="Chat with Moyo"
          className="flex h-[min(520px,calc(100vh-7rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between gap-3 bg-ink px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm bg-white/10">
                <img src="/mascot/moyo.svg" alt="" className="h-10 w-10 object-contain" />
              </span>
              <div>
                <p className="font-semibold leading-tight">Moyo</p>
                <p className="text-xs text-white/70">Link Pharmacy assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
            </button>
          </header>

          <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "you" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2 ${message.from === "you" ? "items-end" : ""}`}>
                  <p
                    className={`rounded-sm px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.from === "you" ? "bg-ink text-white" : "border border-slate-200 bg-white text-ink"
                    }`}
                  >
                    {message.from === "moyo" && <span className="sr-only">Moyo: </span>}
                    {message.text}
                  </p>
                  {message.links?.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-sm border border-brand bg-brand/20 px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-brand/40"
                    >
                      {link.label}
                      <Icon icon="lucide:arrow-right" className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start" aria-label="Moyo is typing">
                <span className="flex gap-1 rounded-sm border border-slate-200 bg-white px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </span>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white px-4 py-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-sm border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <label className="sr-only" htmlFor="moyo-chat-input">
              Your question
            </label>
            <input
              ref={inputRef}
              id="moyo-chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Moyo a question"
              maxLength={300}
              className="min-w-0 flex-1 rounded-sm border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
              aria-label="Send"
              className="flex items-center justify-center rounded-sm bg-ink px-3 text-white transition hover:bg-ink/85 disabled:opacity-40"
            >
              <Icon icon="lucide:send" className="h-4 w-4" aria-hidden />
            </button>
          </form>
          <p className="bg-white px-4 pb-3 text-[11px] text-muted">
            Moyo gives general information only. For advice about your medicines, speak to a pharmacist.
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="moyo-chat-panel"
        className="relative isolate flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-white shadow-lg transition hover:bg-ink/90 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:animate-[moyo-rise_0.6s_ease-out_both]"
      >
        {/* A soft ring that pulses until the chat is opened. */}
        {!open && <span aria-hidden className="absolute inset-0 -z-10 rounded-full bg-brand/40 motion-safe:animate-ping" />}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
          <img src="/mascot/moyo.svg" alt="" className="h-11 w-11 object-contain motion-safe:animate-[moyo-bob_3s_ease-in-out_infinite]" />
        </span>
        <span className="text-sm font-semibold">Chat with Moyo</span>
      </button>
    </div>
  );
}
