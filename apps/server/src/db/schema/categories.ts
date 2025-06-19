import { pgTable, text, boolean, serial, date, time, integer, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";



export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow(),
  userId: text("user_id").notNull().references(() => user.id),
  color: text("color").notNull().default("#0000FF"),
});
