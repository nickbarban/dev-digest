"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@devdigest/ui";

/** Root error boundary — catches renders/query errors not caught by a nested error.tsx. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <EmptyState
        icon="AlertTriangle"
        title={t("errorBoundary.title")}
        body={t("errorBoundary.body")}
        cta={t("errorBoundary.retry")}
        onCta={reset}
      />
    </div>
  );
}
