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
import { useId, useMemo, useRef } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

type Props = {
  documentId: string;
  initialContent: NodeJSON | undefined;
  save: (content: NodeJSON) => void;
  versionNumber: string;
} & BaseComponentType;

const AUTOSAVE_DELAY_MS = 200;

const classes = tv({
  slots: {
    editor:
      "rounded-control prose prose-hr:my-1 prose-headings:my-0 prose-p:my-0.5 bg-surface text-primary h-[90dvh] max-h-[90dvh] w-full max-w-full overflow-y-auto border p-2 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-within:ring-1",
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

export function DocumentEditor({ documentId, initialContent, save, size, variant }: Props) {
  const id = useId();
  const { editor } = classes({ size, variant });

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
  }, [documentId]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useDocChange(
    () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        save(editorInstance.getDocJSON());
      }, AUTOSAVE_DELAY_MS);
    },
    { editor: editorInstance }
  );

  return (
    <ProseKit editor={editorInstance}>
      <div ref={editorInstance.mount} className={editor()} id={id} />
    </ProseKit>
  );
}
