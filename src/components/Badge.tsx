import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

type Props = {
  isFullWidth?: boolean;
  title?: string;
} & BaseComponentType;

const classes = tv({
  base: "inline-flex items-center justify-center rounded-full font-medium tracking-tight whitespace-nowrap",
  variants: {
    isFullWidth: {
      true: "w-full",
    },
    size: {
      lg: "px-3 py-1 text-sm",
      md: "px-2.5 py-1 text-xs",
      sm: "px-2 py-0.5 text-xs",
      xl: "px-3.5 py-1.5 text-sm",
      xs: "px-1.5 py-0.5 text-[10px]",
    },
    variant: {
      error: "bg-error/10 text-error",
      info: "bg-info/10 text-info",
      primary: "bg-primary/10 text-primary",
      secondary: "bg-surface text-secondary ring-secondary/15 ring-1",
      success: "bg-success/10 text-success",
      tertiary: "bg-tertiary/10 text-tertiary",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function Badge({ isFullWidth = false, size, title, variant }: Props) {
  return <span className={classes({ isFullWidth, size, variant })}>{title ? <span>{title}</span> : null}</span>;
}
