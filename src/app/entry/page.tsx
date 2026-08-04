import type { Metadata } from "next";
import { EntryClient } from "./entry-client";

export const metadata: Metadata = {
  title: "New Entry | SalesFlow",
  description: "Add a sales lead or workload record from one place.",
};

export default async function EntryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  return <EntryClient initialType={params.type === "workload" ? "workload" : "lead"} />;
}
