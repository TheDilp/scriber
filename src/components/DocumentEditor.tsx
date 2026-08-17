import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import { defineBasicExtension } from "prosekit/basic";
import { createEditor } from "prosekit/core";
import { ProseKit } from "prosekit/react";
import { useId, useMemo } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

type Props = {
  title?: string;
} & BaseComponentType;

const classes = tv({
  slots: {
    editor:
      "rounded-control bg-surface text-primary w-full border p-2 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-within:ring-2",
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

export function DocumentEditor({ size, title, variant }: Props) {
  const id = useId();
  const { editor, label, wrapper } = classes({ size, variant });

  const editorInstance = useMemo(() => {
    const extension = defineBasicExtension();

    return createEditor({ extension });
  }, []);

  return (
    <div className={wrapper()}>
      {title ? (
        <label className={label()} htmlFor={id}>
          {title}
        </label>
      ) : null}
      <ProseKit editor={editorInstance}>
        <div ref={editorInstance.mount} className={editor()} id={id} />
      </ProseKit>
    </div>
  );
}
