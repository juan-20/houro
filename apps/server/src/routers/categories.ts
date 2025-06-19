import z from "zod/v4";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { task } from "../db/schema/task";
import { desc, eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { category } from "@/db/schema/categories";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = router({
    getByUser: protectedProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await db
                .select()
                .from(category)
                .limit(10)
                .where(eq(category.userId, input.userId))
                .orderBy(category.updatedAt);
        }),

    getFilters: protectedProcedure
        .input(z.object({ 
            userId: z.string(), 
            name: z.string().optional(),
            orderBy: z.enum(['asc', 'desc']).optional().default('asc').optional()
        })).query(async ({ input }) => {
            const normalizedName = input.name ? input.name.trim().toLowerCase().charAt(0).toUpperCase() + input.name.slice(1).toLowerCase() : "";            
            return await db
                .select()
                .from(category)
                .where(
                    input.name
                        ? and(
                            eq(category.userId, input.userId),
                            eq(category.name, normalizedName)
                        )
                        : eq(category.userId, input.userId)
                )
                .orderBy(
                    input.orderBy === 'asc' ? asc(category.createdAt) : desc(category.createdAt)
                );
        }),

    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            userId: z.string(),
            description: z.string().optional().default(""),
            color: z.string()
                .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code. Must be in format #RGB or #RRGGBB")
                .optional()
                .default("#0000FF"),
        }))
    .mutation(async ({ input }) => {
        const normalizedName = input.name.trim().toLowerCase().charAt(0).toUpperCase() + input.name.slice(1).toLowerCase();
        
        const existingCategory = await db
            .select()
            .from(category)
            .where(
                and(
                    eq(category.name, normalizedName),
                    eq(category.userId, input.userId)
                )
            )
            .limit(1);

        if (existingCategory.length > 0) {
            throw new TRPCError({
                code: 'CONFLICT',
                message: `A category with the name "${normalizedName}" already exists`,
                cause: "CategoryAlreadyExists",
            });
        }

        return await db.insert(category).values({
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: normalizedName,
            userId: input.userId,
            description: input.description || "",
            color: input.color,
        });
    }),
});
