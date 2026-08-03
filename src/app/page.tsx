import {
  Bell,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LocalDateTime } from "@/components/local-date-time";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import { ActiveOpportunities } from "@/components/active-opportunities";

const nav = [
  [LayoutDashboard, "Overview", true, "/"],
  [Users, "Leads", false, "/pilot"],
  [Target, "Sales Opportunities", false, "/opportunities"],
  [Building2, "Accounts", false, "#"],
  [Target, "Pipeline", false, "#"],
  [CalendarDays, "Workload", false, "/jobs"],
  [FileText, "Reports", false, "/reports"],
] as const;

const activity = [
  { initials: "MC", title: "Proposal opened", body: "Northstar Logistics reviewed the Fibre 3G proposal.", time: "12 min" },
  { initials: "EB", title: "Call completed", body: "Discovery call notes added to Cedar & Stone Group.", time: "1 hr" },
  { initials: "SP", title: "Lead qualified", body: "Peakline Dental moved into the active pipeline.", time: "3 hr" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-sidebar p-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_28px_rgba(43,177,91,.25)]">
            <Wifi className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">SalesFlow</p>
            <p className="text-xs text-muted-foreground">Fibre sales workspace</p>
          </div>
        </div>
        <nav className="mt-10 space-y-1">
          {nav.map(([Icon, label, active, href]) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Sparkles className="mb-3 size-5 text-primary" />
          <p className="text-sm font-medium">Sprint 1 foundation</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">CRM architecture and secure Supabase data access are ready.</p>
        </div>
        <a href="#" className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
          <Settings className="size-4" /> Settings
        </a>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-5 backdrop-blur-xl sm:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search leads, accounts, or opportunities..." />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell /></Button>
            <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">SB</div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <LocalDateTime />
            <div className="flex flex-wrap gap-2"><a href="/jobs"><Button><CalendarDays /> Workload</Button></a><a href="/opportunities"><Button variant="outline"><Target /> Sales Opportunities</Button></a><a href="/reports"><Button variant="outline"><FileText /> Reports</Button></a><a href="/pilot"><Button><Plus /> Add lead</Button></a></div>
          </div>

          <DashboardMetrics />

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <ActiveOpportunities />

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <p className="text-sm text-muted-foreground">Live updates from your team.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {activity.map((item) => (
                  <div className="flex gap-3" key={item.title}>
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium">{item.initials}</div>
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-medium">{item.title}</p><span className="text-[11px] text-muted-foreground">{item.time}</span></div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
