import z from "zod/v4";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { task } from "../db/schema/task";
import { desc, eq, and, asc, type SQL } from "drizzle-orm";
import { db } from "../db";

const taskFiltersSchema = z.object({ 
  userId: z.string(),
  time: z.string().optional(),
  wasSpecial: z.boolean().optional(),
  dayCreated: z.string().optional(),
  categoryId: z.string().optional(),
  orderBy: z.enum(['asc', 'desc']).optional().default('asc'),
});

type TaskFilters = z.infer<typeof taskFiltersSchema>;

export const taskRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(task).orderBy();
  }),

  getRecentTasks: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(task)
        .limit(30)
        .where(eq(task.userId, input.userId))
        .orderBy(task.updatedAt);
    }),

    getFilters: protectedProcedure
    .input(taskFiltersSchema)
    .query(async ({ input }) => {
      const filters: SQL<unknown>[] = [eq(task.userId, input.userId)];

      if (input.time) {
        filters.push(eq(task.time, input.time));
      }

      if (input.wasSpecial !== undefined) {
        filters.push(eq(task.wasSpecial, input.wasSpecial));
      }

      if (input.dayCreated) {
        filters.push(eq(task.dayCreated, input.dayCreated));
      }

      if (input.categoryId) {
        filters.push(eq(task.categoryId, input.categoryId));
      }

      return await db
        .select()
        .from(task)
        .where(and(...filters))
        .orderBy(input.orderBy === 'asc' ? asc(task.createdAt) : desc(task.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({ 
      time: z.string(),
      wasSpecial: z.boolean(),
      dayCreated: z.string(),
      userId: z.string(),
      message: z.string().optional().default(""),
      categoryId: z.string().optional(),
     }))
    .mutation(async ({ input }) => {
      return await db.insert(task).values({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        time: input.time,
        wasSpecial: input.wasSpecial,
        dayCreated: input.dayCreated,
        userId: input.userId,
        message: input.message || "",
        categoryId: input.categoryId, 
      });
    }),

  
  edit: protectedProcedure
    .input(z.object({ 
       id: z.string(),
       time: z.string().optional(),
       wasSpecial: z.boolean().optional(),
       dayCreated: z.string().optional(),
       userId: z.string().optional(),
       message: z.string().optional().default("").optional(),
       categoryId: z.string().optional(),
     }))
    .mutation(async ({ input }) => {
      return await db
        .update(task)
        .set({ 
          wasSpecial: input.wasSpecial, 
          updatedAt: new Date().toISOString(),
          time: input.time,
          dayCreated: input.dayCreated,
          userId: input.userId,
          message: input.message || "",
          categoryId: input.categoryId,
        })
        .where(eq(task.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(task).where(eq(task.id, input.id));
    }),
});
