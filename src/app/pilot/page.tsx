import type { Metadata } from "next";
import { PilotClient } from "./pilot-client";

export const metadata: Metadata = {
  title: "Lead Pilot | SalesFlow",
  description: "Portable lead capture for the SalesFlow pilot.",
};

export default function PilotPage() {
  return <PilotClient />;
}
