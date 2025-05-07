import { pgTable, text, timestamp, uuid, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";

// Dream interpretation schema
const interpretationSchema = z.object({
  content: z.string(),
  createdAt: z.date(),
  isSaved: z.boolean().default(false)
});

export const dreams = pgTable("dreams", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  dreamDate: timestamp("dream_date").notNull(), // Date selected from calendar
  interpretations: json("interpretations").$type<z.infer<typeof interpretationSchema>[]>().default([]), // Array of AI interpretations
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
});

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  }),
}));

export const selectDreamSchema = createSelectSchema(dreams);
export type Dream = z.infer<typeof selectDreamSchema>;

export const insertDreamSchema = createInsertSchema(dreams, {
  title: (schema) => schema.min(1, "Title cannot be empty"),
  content: (schema) => schema.min(1, "Content cannot be empty"),
  dreamDate: (schema) => schema.refine(
    (date) => date instanceof Date,
    "Dream date must be a valid date"
  ),
});
export type NewDream = z.infer<typeof insertDreamSchema>; 