import type { ReactNode } from "react";

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";

type DrawerProps = {
  children?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
};

export function Drawer({ children, isOpen, onClose, titleId }: DrawerProps) {
  const { context, refs } = useFloating({
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    open: isOpen,
  });
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { close: 190, open: 260 },
    initial: { opacity: 0, transform: "translateX(100%)" },
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay className="z-50 flex justify-end bg-zinc-950/55 backdrop-blur-[2px]" lockScroll>
        <FloatingFocusManager context={context} modal>
          <aside
            ref={refs.setFloating}
            {...getFloatingProps({
              "aria-labelledby": titleId,
              className:
                "relative flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-white/70 bg-surface shadow-[-24px_0_80px_-24px_rgba(24,24,27,0.48)] outline-none",
              style: styles,
            })}>
            <span aria-hidden="true" className="bg-accent absolute inset-y-0 left-0 w-1" />
            <div className="flex h-full flex-col px-7 py-8 sm:px-10">
              {children ?? (
                <div className="max-w-sm pt-12">
                  <p className="text-tertiary font-mono text-[0.64rem] font-bold tracking-[0.2em] uppercase">Workspace note</p>
                  <h2 className="font-display text-primary mt-4 text-3xl leading-tight">A quiet place for the details.</h2>
                  <p className="text-secondary mt-5 text-sm leading-7">
                    This drawer is ready for its content. Add notes, settings, or supporting context without taking the reader
                    away from their work.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
