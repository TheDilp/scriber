import type { LinkProps } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";
import { tv } from "tailwind-variants";

export type ListItem = {
  id: string;
  link?: LinkProps;
  title: string;
};

type ListProps = {
  items: ListItem[];
};

const classes = tv({
  slots: {
    caret:
      "icon-[ph--caret-right] text-tertiary size-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-150 ease-out",
    item: "group text-primary flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium tracking-[-0.01em] outline-none",
    list: "divide-secondary/10 flex flex-col divide-y",
  },
  variants: {
    isInteractive: {
      true: {
        caret:
          "group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
        item: "cursor-pointer transition-[background-color,color,transform] duration-150 ease-out hover:bg-zinc-950/[0.035] hover:text-zinc-950 focus-visible:bg-zinc-950/5 focus-visible:ring-1 focus-visible:ring-zinc-950/15 focus-visible:ring-inset active:scale-[0.985]",
      },
    },
  },
});

export function List({ items }: ListProps) {
  const { caret, item, list } = classes();

  return (
    <ul className={list()}>
      {items.map(({ id, link, title }) => (
        <li key={id}>
          {link ? (
            <Link {...link} className={item({ isInteractive: true })}>
              <span>{title}</span>
              <span aria-hidden="true" className={caret({ isInteractive: true })} />
            </Link>
          ) : (
            <div className={item()}>{title}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
