import type { MouseEventHandler } from "react";

import { tv } from "tailwind-variants";

import type { AvailableIconsType } from "@/enums/icons";
import type { BaseComponentType } from "@/types";

type Props = {
  icon?: AvailableIconsType;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  title?: string;
} & BaseComponentType;

const classes = tv({
  base: "rounded-control focus-visible:ring-accent/50 focus-visible:ring-offset-surface inline-flex cursor-pointer items-center justify-center font-medium tracking-tight whitespace-nowrap transition-[transform,box-shadow,background-color,border-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
  variants: {
    isFullWidth: {
      true: "w-full",
    },
    size: {
      lg: "h-10 px-5 text-base",
      md: "h-9 px-4 text-sm",
      sm: "h-7 px-3 text-sm",
      xl: "h-12 px-6 text-base",
      xs: "h-6 px-2 text-xs",
    },
    variant: {
      error: "bg-error hover:bg-error/90 text-white shadow-sm inset-shadow-sm inset-shadow-white/10 hover:shadow-md",
      info: "bg-info hover:bg-info/90 text-white shadow-sm inset-shadow-sm inset-shadow-white/10 hover:shadow-md",
      primary: "bg-primary hover:bg-primary/90 text-white shadow-sm inset-shadow-sm inset-shadow-white/10 hover:shadow-md",
      secondary: "bg-surface text-primary ring-secondary/15 hover:bg-layout hover:ring-secondary/30 shadow-sm ring-1",
      success: "bg-success hover:bg-success/90 text-white shadow-sm inset-shadow-sm inset-shadow-white/10 hover:shadow-md",
      tertiary: "bg-tertiary hover:bg-tertiary/90 text-white shadow-sm inset-shadow-sm inset-shadow-white/10 hover:shadow-md",
    },
    isIconOnly: {
      true: "border-0 bg-transparent px-1 text-black shadow-none hover:bg-transparent hover:shadow-none",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function Button({ icon, isDisabled = false, isFullWidth = false, onClick, size, title, variant }: Props) {
  return (
    <button
      className={classes({ isFullWidth, isIconOnly: !title && !!icon, size, variant })}
      disabled={isDisabled}
      onClick={onClick}>
      {title ? <span>{title}</span> : null}
      {icon ? <span className={`size-6 ${icon}`} /> : null}
    </button>
  );
}
