import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStyles,
  useTypeahead,
} from "@floating-ui/react";
import { type ReactElement, useRef, useState } from "react";

export type DropdownOption = {
  id: string;
  isDisabled?: boolean;
  onClick: () => void;
  title: string;
};

type DropdownProps = {
  children: ReactElement;
  options: DropdownOption[];
};

export function Dropdown({ children, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const optionLabelsRef = useRef<Array<string | null>>(options.map((option) => option.title));
  optionLabelsRef.current = options.map((option) => option.title);

  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    onOpenChange: setIsOpen,
    open: isOpen,
    placement: "bottom-end",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context, { event: "click" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    activeIndex,
    listRef,
    loop: true,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    activeIndex,
    listRef: optionLabelsRef,
    onMatch: setActiveIndex,
    resetMs: 500,
  });
  const { getFloatingProps, getItemProps, getReferenceProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { close: 120, open: 160 },
    initial: { opacity: 0 },
  });
  const referenceProps = getReferenceProps({
    "aria-expanded": isOpen,
    "aria-haspopup": "menu",
  });

  return (
    <>
      <span ref={refs.setReference} {...referenceProps}>
        {children}
      </span>
      {isMounted ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} initialFocus={-1} modal={false}>
            <div
              ref={refs.setFloating}
              {...getFloatingProps({
                className:
                  "relative z-50 min-w-56 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-zinc-300 bg-surface/95 shadow-[0_24px_72px_-28px_rgba(24,24,27,0.48)] ring-1 ring-zinc-950/10 backdrop-blur-xl outline-none",
                style: { ...floatingStyles, ...styles },
              })}>
              {options.map((option, index) => (
                <button
                  key={option.id}
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  type="button"
                  {...getItemProps({
                    className:
                      "flex min-h-10 w-full items-center rounded-lg px-3.5 py-2.5 text-left text-sm font-medium tracking-[-0.01em] text-primary outline-none transition-[background-color,color,transform] duration-150 ease-out hover:bg-zinc-950/[0.035] hover:text-zinc-950 focus-visible:bg-zinc-950/[0.05] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-zinc-950/15 active:scale-[0.985] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
                    disabled: option.isDisabled,
                    onClick: () => {
                      option.onClick();
                      setIsOpen(false);
                    },
                  })}>
                  {option.title}
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}
