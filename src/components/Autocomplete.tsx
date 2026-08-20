import type { ChangeEvent, KeyboardEvent } from "react";

import {
  autoUpdate,
  flip,
  size as floatingSize,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useId, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import type { BaseComponentType } from "@/types";

export type AutocompleteOption = {
  id: string;
  label: string;
};

type AutocompleteProps = {
  allowCustomValues?: boolean;
  onChange: (value: AutocompleteOption[]) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  title?: string;
  value: AutocompleteOption[];
} & BaseComponentType;

const classes = tv({
  slots: {
    input:
      "text-primary placeholder:text-tertiary min-w-28 flex-1 bg-transparent py-1 text-sm outline-none disabled:cursor-not-allowed",
    label: "font-medium",
    listbox:
      "bg-surface/95 z-50 max-h-60 min-w-56 overflow-y-auto rounded-xl border border-zinc-300 p-1 shadow-[0_24px_72px_-28px_rgba(24,24,27,0.48)] ring-1 ring-zinc-950/10 backdrop-blur-xl outline-none",
    option:
      "text-primary flex min-h-10 w-full items-center rounded-lg px-3.5 py-2.5 text-left text-sm font-medium tracking-[-0.01em] transition-[background-color,color,transform] duration-150 ease-out outline-none hover:bg-zinc-950/[0.035] focus-visible:ring-1 focus-visible:ring-zinc-950/15 focus-visible:ring-inset active:scale-[0.985]",
    removeButton:
      "text-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/30 inline-flex size-4 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
    tag: "focus-visible:ring-primary/35 inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium tracking-tight whitespace-nowrap transition-[box-shadow,background-color] outline-none focus-visible:ring-2",
    trigger:
      "rounded-control bg-surface flex min-h-9 w-full flex-wrap items-center gap-1.5 border px-2 py-1 transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:ring-2",
    wrapper: "flex flex-col gap-0.5",
  },
  variants: {
    size: {
      lg: { input: "text-base", label: "text-xs", trigger: "min-h-10 px-3" },
      md: { input: "text-sm", label: "text-xs", trigger: "min-h-9" },
      sm: { input: "text-sm", label: "text-[11px]", trigger: "min-h-7" },
      xl: { input: "text-base", label: "text-sm", trigger: "min-h-12 px-4" },
      xs: { input: "text-xs", label: "text-[10px]", trigger: "min-h-6" },
    },
    variant: {
      error: { tag: "bg-error/10 text-error", trigger: "border-error/30 focus-within:border-error focus-within:ring-error/20" },
      info: { tag: "bg-info/10 text-info", trigger: "border-info/30 focus-within:border-info focus-within:ring-info/20" },
      primary: {
        tag: "bg-primary/10 text-primary",
        trigger: "border-secondary/20 focus-within:border-primary focus-within:ring-primary/20",
      },
      secondary: {
        tag: "bg-surface text-secondary ring-secondary/15 ring-1",
        trigger: "border-secondary/20 focus-within:border-secondary focus-within:ring-secondary/20",
      },
      success: {
        tag: "bg-success/10 text-success",
        trigger: "border-success/30 focus-within:border-success focus-within:ring-success/20",
      },
      tertiary: {
        tag: "bg-tertiary/10 text-tertiary",
        trigger: "border-secondary/20 focus-within:border-tertiary focus-within:ring-tertiary/20",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
});

export function Autocomplete({
  allowCustomValues = false,
  onChange,
  options,
  placeholder,
  size,
  title,
  value,
  variant,
}: AutocompleteProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIds = new Set(value.map((option) => option.id));
  const matches = options.filter(
    (option) => !selectedIds.has(option.id) && option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );
  const isListboxOpen = isOpen && matches.length > 0;
  const { context, floatingStyles, refs } = useFloating({
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ elements, rects }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    ],
    onOpenChange: setIsOpen,
    open: isListboxOpen,
    whileElementsMounted: autoUpdate,
  });
  const dismiss = useDismiss(context, { escapeKey: false });
  const role = useRole(context, { role: "listbox" });
  const { getFloatingProps } = useInteractions([dismiss, role]);
  const { input, label, listbox, option, removeButton, tag, trigger, wrapper } = classes({ size, variant });

  function focusInput() {
    inputRef.current?.focus();
  }

  function focusTag(index: number) {
    tagRefs.current[index]?.focus();
  }

  function removeOption(optionId: string, focusIndex?: number) {
    onChange(value.filter((option) => option.id !== optionId));
    if (focusIndex === undefined) focusInput();
    else requestAnimationFrame(() => focusTag(focusIndex));
  }

  function selectOption(selectedOption: AutocompleteOption) {
    if (!selectedIds.has(selectedOption.id)) onChange([...value, selectedOption]);
    setActiveIndex(null);
    setQuery("");
    setIsOpen(true);
    focusInput();
  }

  function addCustomValue() {
    const label = query.trim();
    if (!label || value.some((option) => option.label.toLocaleLowerCase() === label.toLocaleLowerCase())) return;

    onChange([...value, { id: label, label }]);
    setActiveIndex(null);
    setQuery("");
    setIsOpen(false);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActiveIndex(null);
    setIsOpen(true);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && matches.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index === null ? 0 : (index + 1) % matches.length));
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowUp" && matches.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index === null ? matches.length - 1 : (index - 1 + matches.length) % matches.length));
      setIsOpen(true);
      return;
    }

    if (
      (event.key === "ArrowLeft" || event.key === "Backspace" || event.key === "Delete") &&
      query.length === 0 &&
      value.length > 0
    ) {
      event.preventDefault();
      focusTag(value.length - 1);
      return;
    }

    if (event.key === "Enter" && activeIndex !== null && isListboxOpen) {
      event.preventDefault();
      selectOption(matches[activeIndex]);
      return;
    }

    if (event.key === "Enter" && allowCustomValues) {
      event.preventDefault();
      addCustomValue();
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(null);
      return;
    }
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number, selectedOption: AutocompleteOption) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (index === 0) focusInput();
      else focusTag(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index === value.length - 1) focusInput();
      else focusTag(index + 1);
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      const nextFocusIndex = index < value.length - 1 ? index : index - 1;
      removeOption(selectedOption.id, nextFocusIndex >= 0 ? nextFocusIndex : undefined);
    }
  }

  return (
    <div className={wrapper()}>
      {title ? (
        <label className={label()} htmlFor={inputId}>
          {title}
        </label>
      ) : null}
      <div ref={refs.setReference} className={trigger()}>
        {value.map((selectedOption, index) => (
          <button
            key={selectedOption.id}
            ref={(node) => {
              tagRefs.current[index] = node;
            }}
            aria-label={`Remove ${selectedOption.label}`}
            className={tag()}
            onClick={() => removeOption(selectedOption.id)}
            onKeyDown={(event) => handleTagKeyDown(event, index, selectedOption)}
            type="button">
            <span>{selectedOption.label}</span>
            <span aria-hidden="true" className={removeButton()}>
              ×
            </span>
          </button>
        ))}
        <input
          ref={inputRef}
          aria-activedescendant={activeIndex !== null && isListboxOpen ? `${listboxId}-${matches[activeIndex].id}` : undefined}
          aria-autocomplete="list"
          aria-controls={isListboxOpen ? listboxId : undefined}
          aria-expanded={isListboxOpen}
          aria-haspopup="listbox"
          aria-label={title ? undefined : "Search suggestions"}
          className={input()}
          id={inputId}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          role="combobox"
          value={query}
        />
      </div>
      {isListboxOpen ? (
        <div
          {...getFloatingProps({
            "aria-multiselectable": true,
            className: listbox(),
            id: listboxId,
            ref: refs.setFloating,
            style: floatingStyles,
          })}>
          {matches.map((matchedOption, index) => (
            <button
              key={matchedOption.id}
              aria-selected={index === activeIndex}
              className={`${option()} ${index === activeIndex ? "bg-zinc-950/5 text-zinc-950" : ""}`}
              id={`${listboxId}-${matchedOption.id}`}
              onClick={() => selectOption(matchedOption)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
              type="button">
              {matchedOption.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
