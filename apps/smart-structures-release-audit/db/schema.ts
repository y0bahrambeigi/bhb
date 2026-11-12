import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

export const auditEvents = sqliteTable("audit_events", {
  seq: integer("seq").primaryKey({ autoIncrement: true }),
  id: text("id").notNull().unique(),
  ownerId: text("owner_id").notNull(),
  actor: text("actor").notNull(),
  kind: text("kind").notNull(),
  entity: text("entity").notNull(),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull(),
}, (t) => [index("audit_owner_seq").on(t.ownerId, t.seq)]);
