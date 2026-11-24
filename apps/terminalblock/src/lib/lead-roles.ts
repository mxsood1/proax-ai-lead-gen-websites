/** Optional "your role" answers on lead forms (shared by the browser form and the server check). */
export const ROLES = ["Buyer / purchasing", "Engineer / designer", "Maintenance / technician", "Other"] as const;
export type Role = (typeof ROLES)[number];
