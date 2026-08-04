import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { JobsClient } from "./jobs-client";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Daily Jobs | SalesFlow", description: "Schedule and complete daily installation jobs." };
export default function JobsPage() { return <div className="jobs-list-only"><div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-5 pt-8 sm:px-8"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Workload</p><h1 className="mt-2 text-3xl font-semibold">Workload tracker</h1><p className="mt-2 text-sm text-muted-foreground">Calendar, completed jobs and possible sales from your workload.</p></div><Link href="/entry?type=workload"><Button><Plus /> Add</Button></Link></div><JobsClient /></div>; }
