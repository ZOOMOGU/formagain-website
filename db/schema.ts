import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable("subscribers", {
  email: text("email").primaryKey(),
  createdAt: text("created_at").notNull(),
  consentVersion: text("consent_version").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
});
