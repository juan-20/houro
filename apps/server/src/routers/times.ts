import z from "zod/v4";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { times } from "../db/schema/times";
import { eq } from "drizzle-orm";
import { db } from "../db";

export const timesRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(times).orderBy();
  }),

  getByUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(times)
        .where(eq(times.userId, input.userId))
        .orderBy(times.createdAt);
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
      return await db.insert(times).values({
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
        .update(times)
        .set({ 
          wasSpecial: input.wasSpecial, 
          updatedAt: new Date().toISOString(),
          time: input.time,
          dayCreated: input.dayCreated,
          userId: input.userId,
          message: input.message || "",
          categoryId: input.categoryId,
        })
        .where(eq(times.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.delete(times).where(eq(times.id, input.id));
    }),
});
