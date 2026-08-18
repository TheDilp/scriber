import type { ChangeEventHandler, ComponentProps, FocusEventHandler } from "react";

import { useId } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

type Props = {
  inputMode?: ComponentProps<"input">["inputMode"];
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  placeholder?: string;
  title?: string;
  type?: ComponentProps<"input">["type"];
  value: string | undefined;
} & BaseComponentType;

const classes = tv({
  slots: {
    input:
      "rounded-control bg-surface text-primary placeholder:text-tertiary w-full border transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:ring-2 focus:outline-none",
    label: "font-medium",
    wrapper: "flex flex-col gap-0.5",
  },
  variants: {
    size: {
      lg: { input: "h-10 px-5 text-base", label: "text-xs" },
      md: { input: "h-9 px-3 text-sm", label: "text-xs" },
      sm: { input: "h-7 px-3 text-sm", label: "text-[11px]" },
      xl: { input: "h-12 px-6 text-base", label: "text-sm" },
      xs: { input: "h-6 px-2 text-xs", label: "text-[10px]" },
    },
    variant: {
      error: { input: "border-error/30 focus:border-error focus:ring-error/20", label: "text-error" },
      info: { input: "border-info/30 focus:border-info focus:ring-info/20", label: "text-info" },
      primary: { input: "border-secondary/20 focus:border-primary focus:ring-primary/20", label: "text-primary" },
      secondary: {
        input: "border-secondary/20 focus:border-secondary focus:ring-secondary/20",
        label: "text-secondary",
      },
      success: { input: "border-success/30 focus:border-success focus:ring-success/20", label: "text-success" },
      tertiary: { input: "border-secondary/20 focus:border-tertiary focus:ring-tertiary/20", label: "text-tertiary" },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function Input({ inputMode, onBlur, onChange, placeholder, size, title, type, value, variant }: Props) {
  const id = useId();
  const { input, label, wrapper } = classes({ size, variant });

  return (
    <div className={wrapper()}>
      {title ? (
        <label className={label()} htmlFor={id}>
          {title}
        </label>
      ) : null}
      <input
        className={input()}
        id={id}
        inputMode={inputMode}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}
