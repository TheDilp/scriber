import "prosekit/basic/style.css";
import type { NodeJSON } from "prosekit/core";

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
import { useId, useMemo, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

import { API } from "@/utils/api";

import { Badge } from "./Badge";

type Props = {
  documentId: string;
  initialContent: NodeJSON | undefined;
  versionNumber: string;
} & BaseComponentType;

type SaveStatus = "error" | "idle" | "saved" | "saving";

const AUTOSAVE_DELAY_MS = 200;

const classes = tv({
  slots: {
    editor:
      "rounded-control prose prose-hr:my-1 prose-headings:my-0 prose-p:my-0.5 bg-surface text-primary h-[90dvh] max-h-[90dvh] w-full max-w-full overflow-y-auto border p-2 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-within:ring-1",

    wrapper: "flex flex-col gap-2",
  },
  variants: {
    size: {
      lg: { editor: "min-h-40 text-base" },
      md: { editor: "min-h-32 text-sm" },
      sm: { editor: "min-h-24 text-sm" },
      xl: { editor: "min-h-48 text-base" },
      xs: { editor: "min-h-20 text-xs" },
    },
    variant: {
      error: { editor: "border-error/30 focus-within:border-error focus-within:ring-error/10" },
      info: { editor: "border-info/30 focus-within:border-info focus-within:ring-info/10" },
      primary: {
        editor: "border-secondary/20 focus-within:border-info/40 focus-within:ring-secondary/10",
      },
      secondary: {
        editor: "border-secondary/20 focus-within:border-secondary focus-within:ring-secondary/20",
      },
      success: {
        editor: "border-success/30 focus-within:border-success focus-within:ring-success/20",
      },
      tertiary: {
        editor: "border-secondary/20 focus-within:border-tertiary focus-within:ring-tertiary/20",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function DocumentEditor({ documentId, initialContent, size, variant, versionNumber }: Props) {
  const id = useId();
  const { editor, wrapper } = classes({ size, variant });

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

    return createEditor({ defaultContent: initialContent, extension });
  }, [documentId, initialContent]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");

  useDocChange(
    () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setStatus("saving");

      saveTimeoutRef.current = setTimeout(() => {
        API.updateDocumentVersion(documentId, versionNumber, editorInstance.getDocJSON())
          .then(() => setStatus("saved"))
          .catch(() => setStatus("error"));
      }, AUTOSAVE_DELAY_MS);
    },
    { editor: editorInstance }
  );

  return (
    <div className={wrapper()}>
      {status !== "idle" ? (
        <div className="flex items-center justify-between gap-2">
          {status === "saved" ? <Badge size="sm" title="Saved" variant="success" /> : null}
          {status === "saving" ? <Badge size="sm" title="Saving…" variant="info" /> : null}
          {status === "error" ? <Badge size="sm" title="Save failed" variant="error" /> : null}
        </div>
      ) : null}
      <ProseKit editor={editorInstance}>
        <div ref={editorInstance.mount} className={editor()} id={id} />
      </ProseKit>
    </div>
  );
}
