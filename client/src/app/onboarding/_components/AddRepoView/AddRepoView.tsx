/* AddRepoView — add-repository screen body. URL only. API keys (OpenAI /
   Anthropic / GitHub PAT) are NOT entered here; they live in Settings → API
   Keys and don't change per repo. Escapable: Esc or the close button returns
   to the app. */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Icon, IconBtn, Kbd, TextInput, FormField } from "@devdigest/ui";
import { useAddRepo } from "@/lib/hooks";
import { ApiError } from "@/lib/api";
import { s } from "./styles";

export function AddRepoView() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [repoUrl, setRepoUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const addRepo = useAddRepo();

  const close = React.useCallback(() => router.push("/"), [router]);

  // Escapable (the footer advertises Esc — make it real).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const submit = async () => {
    if (!repoUrl.trim()) return;
    setError(null);
    try {
      const repo = await addRepo.mutateAsync(repoUrl.trim());
      router.push(`/repos/${repo.id}/pulls`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("addRepo.genericError"));
    }
  };

  return (
    <div style={s.page}>
      <div style={s.brandRow}>
        <div style={s.brandIcon}>
          <Icon.Layers size={17} style={s.brandIconGlyph} />
        </div>
        <span style={s.brandName}>DevDigest</span>
      </div>

      <div style={s.card}>
        <div style={s.closeBtnWrap}>
          <IconBtn icon="X" label={t("addRepo.close")} onClick={close} />
        </div>

        <h1 style={s.title}>{t("addRepo.title")}</h1>
        <p style={s.intro}>
          {t("addRepo.introBeforeLink")}{" "}
          <a
            href="/settings/api-keys"
            onClick={(e) => {
              e.preventDefault();
              router.push("/settings/api-keys");
            }}
            style={s.introLink}
          >
            {t("addRepo.introLinkLabel")}
          </a>
          .
        </p>

        <FormField label={t("addRepo.urlLabel")} hint={t("addRepo.urlHint")}>
          <TextInput
            value={repoUrl}
            onChange={setRepoUrl}
            mono
            placeholder={t("addRepo.urlPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
        </FormField>

        {error && (
          <div style={s.errorBox}>
            <Icon.XCircle size={16} style={s.errorIcon} />
            <span style={s.errorText}>{error}</span>
          </div>
        )}

        <div style={s.actions}>
          <Button kind="ghost" size="md" onClick={close}>
            {t("addRepo.cancel")}
          </Button>
          <div style={s.actionsSpacer} />
          <Button
            kind="primary"
            size="md"
            icon="Plus"
            onClick={submit}
            disabled={!repoUrl.trim() || addRepo.isPending}
          >
            {addRepo.isPending ? t("addRepo.submitting") : t("addRepo.submit")}
          </Button>
        </div>
      </div>

      <p style={s.footer}>
        <Icon.Lock size={12} /> {t("addRepo.footerBefore")} <Kbd>esc</Kbd> {t("addRepo.footerAfter")}
      </p>
    </div>
  );
}
