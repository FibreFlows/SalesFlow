import type { Metadata } from "next";
import { JobsClient } from "./jobs-client";

export const metadata: Metadata = { title: "Daily Jobs | SalesFlow", description: "Schedule and complete daily installation jobs." };
export default function JobsPage() { return <JobsClient />; }
