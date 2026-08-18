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

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
};

export function Modal({ children, isOpen, onClose, titleId }: ModalProps) {
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
    duration: { close: 170, open: 220 },
    initial: { opacity: 0, transform: "translateY(12px) scale(0.975)" },
  });

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay
        className="z-50 grid place-items-center bg-zinc-950/60 px-5 py-8 backdrop-blur-[3px] transition-opacity duration-150 ease-out"
        lockScroll
        style={{ opacity: styles.opacity }}>
        <FloatingFocusManager context={context} modal>
          <div
            ref={refs.setFloating}
            {...getFloatingProps({
              "aria-labelledby": titleId,
              className:
                "relative w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/70 bg-surface shadow-[0_24px_80px_-24px_rgba(24,24,27,0.5)] outline-none",
              style: styles,
            })}>
            <span aria-hidden="true" className="bg-accent absolute top-0 left-0 h-full w-1" />
            {children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
