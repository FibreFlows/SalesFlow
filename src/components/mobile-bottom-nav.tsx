import { BarChart3, BriefcaseBusiness, Home, Plus, Target, Users } from "lucide-react";

export function MobileBottomNav() {
  return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid h-17 max-w-lg grid-cols-5 items-center px-2">
      <a href="/" className="flex flex-col items-center gap-1 text-[10px] font-semibold text-primary"><Home className="size-5" />Home</a>
      <a href="/jobs" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground"><BriefcaseBusiness className="size-5" />Workload</a>
      <a href="/entry" aria-label="Add a sales lead or workload entry" className="mx-auto grid size-13 -translate-y-3 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg"><Plus className="size-6" /></a>
      <a href="/opportunities" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground"><Target className="size-5" />Leads</a>
      <a href="/reports" className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground"><BarChart3 className="size-5" />Reports</a>
    </div>
  </nav>;
}
