"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { curriculum as bundledCurriculum } from "@/data/curriculum";
import { validateCurriculumCatalog } from "@/lib/curriculum-validate";
import {
  fetchCurriculumRevision,
  publishCurriculumRevision,
  type CurriculumRevisionInfo,
} from "@/lib/organizer-api";
import { clearCurriculumCache } from "@/lib/remote-curriculum";

export interface CurriculumPublishPanelProps {
  password: string;
}

export function CurriculumPublishPanel({ password }: CurriculumPublishPanelProps) {
  const [status, setStatus] = useState<CurriculumRevisionInfo | null>(null);
  const [jsonDraft, setJsonDraft] = useState("");
  const [revisionTag, setRevisionTag] = useState("");
  const [publishedBy, setPublishedBy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const info = await fetchCurriculumRevision();
      setStatus(info);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load curriculum status",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleLoadBundled = () => {
    setJsonDraft(JSON.stringify(bundledCurriculum, null, 2));
    setRevisionTag(`bundled-${new Date().toISOString().slice(0, 10)}`);
    setError("");
    setSuccess("");
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonDraft) as unknown;
      } catch {
        throw new Error("JSON is not valid. Fix syntax before publishing.");
      }

      const validationError = validateCurriculumCatalog(parsed);
      if (validationError) {
        throw new Error(validationError);
      }

      const result = await publishCurriculumRevision(password, {
        content: parsed,
        revision_tag: revisionTag.trim() || undefined,
        published_by: publishedBy.trim() || undefined,
      });

      clearCurriculumCache();
      setSuccess(
        `Published revision "${result.revision_tag}" at ${new Date(result.published_at).toLocaleString()}. Campers will pick it up on next load.`,
      );
      await loadStatus();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Could not publish curriculum",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section
      className="space-y-4 rounded-2xl border border-border bg-paper p-5 shadow-bento"
      aria-label="Remote curriculum"
    >
      <div>
        <h2 className="font-display text-lg font-extrabold text-ink">
          Remote curriculum
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Publish lesson content without redeploying the site. Campers fall back
          to the bundled curriculum until a revision is active.
        </p>
      </div>

      <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink/80">
        {loading ? (
          "Loading curriculum status…"
        ) : status?.active ? (
          <>
            Active revision:{" "}
            <strong className="text-ink">{status.revision_tag}</strong>
            {status.published_at ? (
              <>
                {" "}
                (published{" "}
                {new Date(status.published_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                )
              </>
            ) : null}
          </>
        ) : (
          "No remote revision published — campers use bundled curriculum from the last deploy."
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">Revision tag</span>
          <input
            type="text"
            value={revisionTag}
            onChange={(event) => setRevisionTag(event.target.value)}
            placeholder="2026-week3-tweak"
            className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-ink"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">
            Published by (optional)
          </span>
          <input
            type="text"
            value={publishedBy}
            onChange={(event) => setPublishedBy(event.target.value)}
            placeholder="Counselor name"
            className="min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-ink"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-ink">
          Curriculum JSON (full catalog)
        </span>
        <textarea
          value={jsonDraft}
          onChange={(event) => setJsonDraft(event.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs text-ink"
          placeholder='Paste validated curriculum JSON keyed by week number, e.g. { "1": { ... } }'
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl bg-teal-accent/10 px-4 py-3 text-sm text-teal-accent">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" size="sm" onClick={handleLoadBundled}>
          Load bundled JSON
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadStatus()}
          disabled={loading}
        >
          Refresh status
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => void handlePublish()}
          disabled={publishing || !jsonDraft.trim()}
        >
          {publishing ? "Publishing…" : "Publish revision"}
        </Button>
      </div>
    </section>
  );
}
