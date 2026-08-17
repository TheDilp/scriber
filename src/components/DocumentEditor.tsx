import "prosekit/basic/style.css";
import { createEditor, defineBaseCommands, defineBaseKeymap, defineHistory, union } from "prosekit/core";
import { defineBlockquote } from "prosekit/extensions/blockquote";
import { defineBold } from "prosekit/extensions/bold";
import { defineDoc } from "prosekit/extensions/doc";
import { defineGapCursor } from "prosekit/extensions/gap-cursor";
import { defineHardBreak } from "prosekit/extensions/hard-break";
import { defineHeading } from "prosekit/extensions/heading";
import { defineHorizontalRule } from "prosekit/extensions/horizontal-rule";
import { defineImage } from "prosekit/extensions/image";
import { defineItalic } from "prosekit/extensions/italic";
import { defineLink } from "prosekit/extensions/link";
import { defineList } from "prosekit/extensions/list";
import { defineMention } from "prosekit/extensions/mention";
import { defineModClickPrevention } from "prosekit/extensions/mod-click-prevention";
import { defineParagraph } from "prosekit/extensions/paragraph";
import { defineStrike } from "prosekit/extensions/strike";
import { defineTable } from "prosekit/extensions/table";
import { defineText } from "prosekit/extensions/text";
import { defineUnderline } from "prosekit/extensions/underline";
import { defineVirtualSelection } from "prosekit/extensions/virtual-selection";
import { ProseKit, useDocChange } from "prosekit/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

import { getDocument, saveDocument } from "@/utils/api";

import { Badge } from "./Badge";

type Props = {
  documentId: string;
  title?: string;
} & BaseComponentType;

type SaveStatus = "error" | "idle" | "saving";

const AUTOSAVE_DELAY_MS = 800;

const classes = tv({
  slots: {
    editor:
      "rounded-control prose prose-hr:my-1 prose-headings:my-0 prose-p:my-0.5 bg-surface text-primary w-full max-w-full border p-2 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-within:ring-2",
    label: "font-medium",
    wrapper: "flex flex-col gap-0.5",
  },
  variants: {
    size: {
      lg: { editor: "min-h-40 text-base", label: "text-xs" },
      md: { editor: "min-h-32 text-sm", label: "text-xs" },
      sm: { editor: "min-h-24 text-sm", label: "text-[11px]" },
      xl: { editor: "min-h-48 text-base", label: "text-sm" },
      xs: { editor: "min-h-20 text-xs", label: "text-[10px]" },
    },
    variant: {
      error: { editor: "border-error/30 focus-within:border-error focus-within:ring-error/20", label: "text-error" },
      info: { editor: "border-info/30 focus-within:border-info focus-within:ring-info/20", label: "text-info" },
      primary: {
        editor: "border-secondary/20 focus-within:border-primary focus-within:ring-primary/20",
        label: "text-primary",
      },
      secondary: {
        editor: "border-secondary/20 focus-within:border-secondary focus-within:ring-secondary/20",
        label: "text-secondary",
      },
      success: {
        editor: "border-success/30 focus-within:border-success focus-within:ring-success/20",
        label: "text-success",
      },
      tertiary: {
        editor: "border-secondary/20 focus-within:border-tertiary focus-within:ring-tertiary/20",
        label: "text-tertiary",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function DocumentEditor({ documentId, size, title, variant }: Props) {
  const id = useId();
  const { editor, label, wrapper } = classes({ size, variant });

  const editorInstance = useMemo(() => {
    const extension = union(
      defineDoc(),
      defineText(),
      defineParagraph(),
      defineHeading(),
      defineList(),
      defineBlockquote(),
      defineImage(),
      defineHorizontalRule(),
      defineHardBreak(),
      defineTable(),
      defineItalic(),
      defineBold(),
      defineUnderline(),
      defineStrike(),
      defineLink(),
      defineBaseKeymap(),
      defineBaseCommands(),
      defineHistory(),
      defineGapCursor(),
      defineVirtualSelection(),
      defineModClickPrevention(),
      defineMention()
    );

    return createEditor({ extension });
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isReady, setIsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setIsReady(false);
    setLoadFailed(false);

    async function bootstrap() {
      try {
        const doc = await getDocument(documentId);

        if (isCancelled) return;

        if (doc.content) editorInstance.setContent(doc.content as never);

        setIsReady(true);
      } catch {
        if (!isCancelled) setLoadFailed(true);
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [documentId, editorInstance]);

  useDocChange(
    () => {
      if (!isReady) return;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setStatus("saving");

      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(documentId, { content: editorInstance.getDocJSON() })
          .then(() => setStatus("idle"))
          .catch(() => setStatus("error"));
      }, AUTOSAVE_DELAY_MS);
    },
    { editor: editorInstance }
  );

  return (
    <div className={wrapper()}>
      {title || loadFailed || status !== "idle" ? (
        <div className="flex items-center justify-between gap-2">
          {title ? (
            <label className={label()} htmlFor={id}>
              {title}
            </label>
          ) : null}
          {loadFailed ? <Badge size="xs" title="Failed to load" variant="error" /> : null}
          {!loadFailed && status === "saving" ? <Badge size="xs" title="Saving…" variant="secondary" /> : null}
          {!loadFailed && status === "error" ? <Badge size="xs" title="Save failed" variant="error" /> : null}
        </div>
      ) : null}
      <ProseKit editor={editorInstance}>
        <div ref={editorInstance.mount} className={editor()} id={id} />
      </ProseKit>
    </div>
  );
}
