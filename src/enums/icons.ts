export const AvailableIcons = ["icon-[ph--clock-counter-clockwise]", "icon-[ph--gear]", "icon-[ph--x]"] as const;

export type AvailableIconsType = (typeof AvailableIcons)[number];
