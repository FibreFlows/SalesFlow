"use client";

import { useState } from "react";
import { BriefcaseBusiness, Users } from "lucide-react";
import { PilotClient } from "@/app/pilot/pilot-client";
import { JobsClient } from "@/app/jobs/jobs-client";

type EntryType = "lead" | "workload";

export function EntryClient({ initialType }: { initialType: EntryType }) {
  const [type, setType] = useState<EntryType>(initialType);

  return <div className="min-h-screen bg-background pb-24 text-foreground">
    <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-muted/60 p-1">
        <div className="grid grid-cols-2 gap-1" role="tablist" aria-label="Entry type">
          <button type="button" role="tab" aria-selected={type === "lead"} onClick={() => setType("lead")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${type === "lead" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><Users className="size-4" /> Sales lead</button>
          <button type="button" role="tab" aria-selected={type === "workload"} onClick={() => setType("workload")} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${type === "workload" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><BriefcaseBusiness className="size-4" /> Workload</button>
        </div>
      </div>
    </div>
    {type === "lead" ? <PilotClient entryOnly /> : <div className="entry-workload-only"><JobsClient /></div>}
  </div>;
}
