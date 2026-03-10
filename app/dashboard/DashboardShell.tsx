"use client";

import { signOut } from "next-auth/react";
import Nav from "@/components/Nav";
import FeedbackButton from "@/components/FeedbackButton";
import { FeedbackProvider, useFeedbackBrand } from "@/lib/feedback-context";

function ShellInner({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const { currentBrand } = useFeedbackBrand();

  return (
    <>
      <Nav userEmail={userEmail} onSignOut={() => signOut()} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <FeedbackButton userEmail={userEmail} currentBrand={currentBrand} />
    </>
  );
}

export default function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <FeedbackProvider>
      <ShellInner userEmail={userEmail}>{children}</ShellInner>
    </FeedbackProvider>
  );
}
