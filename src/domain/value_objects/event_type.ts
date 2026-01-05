export const EventType = ["MOVIE", "CONCERT", "PREMIERE", "OTHER"] as const;
export type EventType = (typeof EventType)[number];
