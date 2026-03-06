"use client";

import { signOut } from "next-auth/react";
import Nav from "@/components/Nav";

export default function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav userEmail={userEmail} onSignOut={() => signOut()} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </>
  );
}
