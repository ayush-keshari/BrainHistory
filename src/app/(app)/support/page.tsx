import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Metadata } from "next";
import SupportContent from "@/components/support/SupportContent";

export const metadata: Metadata = { title: "Support — BrainHistory" };

export default async function SupportPage() {
  const session = await auth();
  const userId  = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/auth/signin");

  return <SupportContent />;
}
