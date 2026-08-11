"use client";

import { AuthGuard } from "@/components/nav/AuthGuard";
import { NewDealWizard } from "@/components/deal/NewDealWizard";

export default function NewDealPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-5 text-xl font-semibold text-ink-50">New deal</h1>
        <NewDealWizard />
      </div>
    </AuthGuard>
  );
}
