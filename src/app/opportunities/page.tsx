import type { Metadata } from "next";
import { OpportunitiesClient } from "./opportunities-client";
export const metadata: Metadata = { title: "Sales Opportunities | SalesFlow" };
export default function OpportunitiesPage() { return <OpportunitiesClient />; }
