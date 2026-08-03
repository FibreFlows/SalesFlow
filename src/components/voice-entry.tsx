"use client";

import { useRef, useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; onresult: ((event: RecognitionEvent) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type RecognitionConstructor = new () => Recognition;
declare global { interface Window { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor } }

export type VoiceFields = Partial<{ first_name: string; last_name: string; email: string; phone: string; secondary_phone: string; address: string; ncid: string; ecid: string; ban: string; mobility_ban: string; referrer_ban: string; competitor_name: string; is_with_competitor: boolean; customer_rating: string; notes: string; current_services: string[]; sale_scope: string[]; count_as_sale: boolean; status: "converted" }>;
const SERVICES: [string, RegExp][] = [["Fibre internet", /\b(fibre|fiber)\b/i], ["Copper internet", /\bcopper\b/i], ["Optik TV", /\b(optik|tv)\b/i], ["Home phone", /\bhome phone|landline\b/i], ["Security", /\bsecurity\b/i], ["Mobility", /\b(mobility|mobile|cell)\b/i]];
const capture = (text: string, pattern: RegExp) => text.match(pattern)?.[1]?.trim() || "";

export function parseVoiceEntry(raw: string): VoiceFields {
  const email = raw.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || "";
  const phones = raw.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || [];
  const name = capture(raw, /(?:customer\s+)?name(?:\s+is)?\s+([a-z][a-z' -]{1,50}?)(?=\s+(?:phone|email|address|ncid|ecid|ban|has|wants|sold|rating|competitor)\b|$)/i).split(/\s+/);
  const currentServices = SERVICES.filter(([, test]) => new RegExp(`(?:has|currently has|existing)[^.;]*${test.source}`, "i").test(raw)).map(([service]) => service);
  const saleScope = SERVICES.filter(([, test]) => new RegExp(`(?:wants|interested in|sold|sale|converted)[^.;]*${test.source}`, "i").test(raw)).map(([service]) => service);
  const competitor = capture(raw, /(?:competitor|with)\s+(?:is\s+)?([a-z0-9 &-]+?)(?=\s+(?:rating|contract|wants|sold|notes)\b|[.,]|$)/i);
  const converted = /\b(converted|sale done|sold successfully)\b/i.test(raw);
  return {
    first_name: name[0] || "", last_name: name.slice(1).join(" "), email, phone: phones[0] || "", secondary_phone: phones[1] || "",
    address: capture(raw, /address(?:\s+is)?\s+(.+?)(?=\s+(?:phone|email|ncid|ecid|ban|has|wants|sold|rating|competitor)\b|$)/i),
    ncid: capture(raw, /ncid\s*[:#-]?\s*([a-z0-9-]+)/i), ecid: capture(raw, /ecid\s*[:#-]?\s*([a-z0-9-]+)/i),
    ban: capture(raw, /(?:hs\s+)?ban\s*[:#-]?\s*([a-z0-9-]+)/i), mobility_ban: capture(raw, /mob(?:ility)?\s+ban\s*[:#-]?\s*([a-z0-9-]+)/i),
    referrer_ban: capture(raw, /referr?er\s+ban\s*[:#-]?\s*([a-z0-9-]+)/i), competitor_name: competitor, is_with_competitor: Boolean(competitor),
    customer_rating: capture(raw, /rating\s*(?:is)?\s*([1-5])/i), current_services: currentServices, sale_scope: saleScope, count_as_sale: converted, status: converted ? "converted" : undefined, notes: raw,
  };
}

export function VoiceEntry({ onApply }: { onApply: (fields: VoiceFields) => void }) {
  const [raw, setRaw] = useState(""); const [listening, setListening] = useState(false); const [message, setMessage] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const start = () => { const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Constructor) { setMessage("Voice recognition is not supported in this browser. Type or paste the raw details below."); return; } const instance = new Constructor(); instance.continuous = true; instance.interimResults = false; instance.lang = "en-CA"; instance.onresult = (event) => { let text = ""; for (let i = 0; i < event.results.length; i++) text += `${event.results[i][0].transcript} `; setRaw((current) => `${current} ${text}`.trim()); }; instance.onend = () => setListening(false); recognition.current = instance; instance.start(); setListening(true); setMessage("Listening... speak naturally and include labels such as name, phone, address, services, and what sold."); };
  const stop = () => { recognition.current?.stop(); setListening(false); };
  const process = () => { if (!raw.trim()) { setMessage("Speak or type the customer information first."); return; } onApply(parseVoiceEntry(raw)); setMessage("Draft applied to the form. Double-check every orange-section result before saving."); };
  return <section className="rounded-xl border border-orange-400/60 bg-orange-500/10 p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-orange-700 dark:text-orange-300">Voice draft · Needs review</p><p className="mt-1 text-xs text-muted-foreground">Speak or paste raw information. Nothing is saved until you review the form and press its Add button.</p></div><Sparkles className="size-5 text-orange-500"/></div><textarea className="mt-3 min-h-24 w-full rounded-md border border-orange-300 bg-background p-3 text-sm" placeholder="Example: Customer name is John Smith, phone..., address..., currently has copper, wants fibre and Optik TV..." value={raw} onChange={(event)=>setRaw(event.target.value)}/><div className="mt-3 flex flex-wrap gap-2">{listening?<Button type="button" variant="outline" onClick={stop}><MicOff/> Stop</Button>:<Button type="button" variant="outline" onClick={start}><Mic/> Start voice</Button>}<Button type="button" className="bg-orange-500 text-white hover:bg-orange-600" onClick={process}><Sparkles/> Process draft</Button></div>{message?<p className="mt-2 text-xs text-orange-700 dark:text-orange-300">{message}</p>:null}</section>;
}
