import {
  Bell,
  Mic,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  Target,
  Tags,
  Users,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocalDateTime } from "@/components/local-date-time";
import { DashboardMetrics } from "@/components/dashboard-metrics";
import { ActiveOpportunities } from "@/components/active-opportunities";
import { ProductSalesTracker } from "@/components/product-sales-tracker";
import { AppearanceControl } from "@/components/appearance-control";
import { BestPlans } from "@/components/best-plans";
import { UserAvatarLink } from "@/components/user-avatar-link";

const nav = [
  [LayoutDashboard, "Overview", true, "/"],
  [Users, "Leads", false, "/pilot"],
  [Target, "Sales Opportunities", false, "/opportunities"],
  [Tags, "Deals & Plans", false, "/deals"],
  [Building2, "Accounts", false, "#"],
  [Target, "Pipeline", false, "#"],
  [CalendarDays, "Workload", false, "/jobs"],
  [FileText, "Reports", false, "/reports"],
] as const;

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
            <AppearanceControl />
            <Button variant="ghost" size="icon"><Bell /></Button>
            <UserAvatarLink />
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 pb-28 sm:p-8 lg:pb-8">
          <div className="mb-8">
            <LocalDateTime />
          </div>

          <BestPlans />
          <a href="/pilot?voice=1" className="mb-5 flex min-h-15 items-center gap-3 rounded-2xl border border-orange-300/70 bg-orange-50 px-4 text-sm dark:border-orange-700 dark:bg-orange-950/25 lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-orange-500 text-white"><Mic className="size-5" /></span><span className="flex-1"><strong className="block text-foreground">Voice entry</strong><span className="text-xs text-muted-foreground">Speak raw details, then verify the orange draft</span></span><span className="font-semibold text-orange-600">Start</span></a>

          <DashboardMetrics />
          <ProductSalesTracker />

          <section className="mt-6">
            <ActiveOpportunities />
          </section>
        </div>
      </main>
    </div>
  );
}
