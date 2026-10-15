import type { Metadata } from "next";
import { CommandCenter } from "@/features/quests/command-center";

export const metadata: Metadata = {
  title: "The Command Center",
};

export default function PlayPage() {
  return <CommandCenter />;
}
