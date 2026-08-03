"use client";

import { Check, MonitorSmartphone, Moon, Palette, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

type Style = "theme-1" | "theme-2" | "theme-3";
type Mode = "system" | "light" | "dark";

const styles: { id: Style; title: string; description: string; swatch: string }[] = [
  { id: "theme-1", title: "Field Command", description: "Action-first and energetic", swatch: "bg-gradient-to-br from-emerald-400 to-green-800" },
  { id: "theme-2", title: "Clean Ledger", description: "Calm and information-focused", swatch: "bg-gradient-to-br from-stone-100 to-emerald-700" },
  { id: "theme-3", title: "Route & Revenue", description: "Workload-first and immersive", swatch: "bg-gradient-to-br from-emerald-950 to-green-500" },
];

const modes: { id: Mode; title: string; icon: typeof Sun }[] = [
  { id: "system", title: "Device default", icon: MonitorSmartphone },
  { id: "light", title: "Light", icon: Sun },
  { id: "dark", title: "Dark", icon: Moon },
];

function apply(style: Style, mode: Mode) {
  const root = document.documentElement;
  root.dataset.design = style;
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function AppearanceControl() {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<Style>("theme-1");
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const savedStyle = (localStorage.getItem("salesflow-design") as Style) || "theme-1";
    const savedMode = (localStorage.getItem("salesflow-mode") as Mode) || "system";
    setStyle(savedStyle);
    setMode(savedMode);
    apply(savedStyle, savedMode);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => mode === "system" && apply(style, mode);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode, style]);

  const chooseStyle = (value: Style) => {
    setStyle(value);
    localStorage.setItem("salesflow-design", value);
    apply(value, mode);
  };
  const chooseMode = (value: Mode) => {
    setMode(value);
    localStorage.setItem("salesflow-mode", value);
    apply(style, value);
  };

  return <>
    <button aria-label="Appearance settings" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition active:scale-95">
      <Palette className="size-[18px]" />
    </button>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={() => setOpen(false)}>
      <section aria-label="Appearance" className="w-full max-w-md rounded-t-[28px] border border-border bg-background p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[28px]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between">
          <div><p className="text-lg font-semibold">Make SalesFlow yours</p><p className="mt-1 text-sm text-muted-foreground">Choose a layout and display mode.</p></div>
          <button aria-label="Close" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-muted"><X className="size-4" /></button>
        </div>
        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Design style</p>
        <div className="space-y-2">{styles.map((item) => <button key={item.id} onClick={() => chooseStyle(item.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${style === item.id ? "border-primary bg-primary/8" : "border-border bg-card"}`}>
          <span className={`h-12 w-16 shrink-0 rounded-xl ${item.swatch}`} />
          <span className="flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="text-xs text-muted-foreground">{item.description}</span></span>
          {style === item.id && <Check className="size-5 text-primary" />}
        </button>)}</div>
        <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Display mode</p>
        <div className="grid grid-cols-3 gap-2">{modes.map(({ id, title, icon: Icon }) => <button key={id} onClick={() => chooseMode(id)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-xs font-medium transition ${mode === id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}><Icon className="size-5" />{title}</button>)}</div>
      </section>
    </div>}
  </>;
}
