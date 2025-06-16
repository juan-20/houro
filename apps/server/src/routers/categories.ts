import z from "zod/v4";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { times } from "../db/schema/times";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { category } from "@/db/schema/categories";

export const categoriesRouter = router({
    getByUser: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db
                .select()
                .from(category)
                .where(eq(category.userId, input.userId))
                .orderBy(category.createdAt);
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            userId: z.string(),
            description: z.string().optional().default(""),
        }))
    .mutation(async ({ input }) => {
        return await db.insert(category).values({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: input.name,
            userId: input.userId,
            description: input.description || "",
        });
    }),
});
