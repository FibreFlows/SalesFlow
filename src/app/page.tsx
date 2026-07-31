import {
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Gauge,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const nav = [
  [LayoutDashboard, "Overview", true],
  [Users, "Leads", false],
  [Building2, "Accounts", false],
  [Target, "Pipeline", false],
  [CalendarDays, "Activities", false],
] as const;

const metrics = [
  { label: "Pipeline value", value: "$428.6K", detail: "+12.4% this month", icon: CircleDollarSign },
  { label: "Qualified leads", value: "184", detail: "+23 this week", icon: Users },
  { label: "Win rate", value: "31.8%", detail: "+4.2 pts vs last month", icon: Target },
  { label: "Avg. sales cycle", value: "18 days", detail: "3 days faster", icon: Gauge },
];

const opportunities = [
  { company: "Northstar Logistics", contact: "Maya Chen", stage: "Proposal", value: "$48,000", next: "Today" },
  { company: "Cedar & Stone Group", contact: "Evan Brooks", stage: "Qualified", value: "$31,500", next: "Tomorrow" },
  { company: "Peakline Dental", contact: "Sofia Patel", stage: "Discovery", value: "$22,800", next: "Aug 3" },
  { company: "Harbour Foods", contact: "Noah Williams", stage: "Negotiation", value: "$67,000", next: "Aug 5" },
];

const activity = [
  { initials: "MC", title: "Proposal opened", body: "Northstar Logistics reviewed the Fibre 3G proposal.", time: "12 min" },
  { initials: "EB", title: "Call completed", body: "Discovery call notes added to Cedar & Stone Group.", time: "1 hr" },
  { initials: "SP", title: "Lead qualified", body: "Peakline Dental moved into the active pipeline.", time: "3 hr" },
];

function StageBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    Proposal: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    Qualified: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    Discovery: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    Negotiation: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };
  return <Badge className={styles[stage]}>{stage}</Badge>;
}

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
          {nav.map(([Icon, label, active]) => (
            <a
              key={label}
              href="#"
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
            <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">AB</div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-primary">THURSDAY, JULY 30</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, Aman.</h1>
              <p className="mt-2 text-muted-foreground">Here&apos;s what&apos;s moving across your fibre pipeline.</p>
            </div>
            <Button><Plus /> Add lead</Button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, detail, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-2 text-xs text-primary">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Active opportunities</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Highest-priority deals requiring attention.</p>
                </div>
                <Button variant="ghost" size="sm">View pipeline <ArrowUpRight /></Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-xs text-muted-foreground">
                      <tr><th className="pb-3 font-medium">Account</th><th className="pb-3 font-medium">Stage</th><th className="pb-3 font-medium">Value</th><th className="pb-3 text-right font-medium">Next step</th></tr>
                    </thead>
                    <tbody>
                      {opportunities.map((item) => (
                        <tr key={item.company} className="border-b border-border/60 last:border-0">
                          <td className="py-4"><p className="font-medium">{item.company}</p><p className="mt-1 text-xs text-muted-foreground">{item.contact}</p></td>
                          <td className="py-4"><StageBadge stage={item.stage} /></td>
                          <td className="py-4 font-mono text-xs">{item.value}</td>
                          <td className="py-4 text-right text-muted-foreground">{item.next}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

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
