import { pgTable, text, boolean, serial, date, time, integer, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { category } from "./categories";

export const times = pgTable("times", {
  id: text("id").primaryKey(),
  createdAt: date("created_at").notNull(),
  updatedAt: date("updated_at").notNull(),
  time: time("time").notNull(),
  wasSpecial: boolean("was_special").notNull(),
  dayCreated: date("day_created").notNull(),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  message: varchar("message", { length: 255 }).notNull().default(""),
  categoryId: text("category_id").references(() => category.id, { onDelete: 'cascade' }),
});
