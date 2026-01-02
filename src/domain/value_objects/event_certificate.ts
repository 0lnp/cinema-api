export const EventCertificate = ["G", "PG", "PG-13", "R", "NC-17"] as const;
export type EventCertificate = (typeof EventCertificate)[number];
