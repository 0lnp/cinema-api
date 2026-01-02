export const EventStatus = ["DRAFT", "COMING_SOON", "NOW_SHOWING", "ENDED"] as const;
export type EventStatus = (typeof EventStatus)[number];
