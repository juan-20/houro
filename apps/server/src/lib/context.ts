import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { session as sessionTable } from "../db/schema/auth";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  try {
    const originalAuth = context.req.raw.headers.get('authorization');

    if (!originalAuth) {
      console.log('No authorization header found');
      return { session: null };
    }

    const token = originalAuth.replace(/^Bearer\s+Bearer\s+/, 'Bearer ').replace(/^Bearer\s+/, '');

    const dbSession = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.token, token))
      .limit(1);

    const foundSession = dbSession[0];
  
    if (!foundSession) {
      console.log('No valid session found in database');
      return { session: null };
    }

    // Check if session is expired
    if (foundSession.expiresAt < new Date()) {
      console.log('Session is expired');
      return { session: null };
    }

    // Create a session object in the format expected by the app
    const session = {
      session: {
        id: foundSession.id,
        token: foundSession.token,
        userId: foundSession.userId,
        expiresAt: foundSession.expiresAt,
        createdAt: foundSession.createdAt,
        updatedAt: foundSession.updatedAt,
        ipAddress: foundSession.ipAddress,
        userAgent: foundSession.userAgent
      }
    };

    return { session };
  } catch (error: any) {
    console.error('Context creation error:', {
      name: error?.name || 'Unknown error',
      message: error?.message || 'No error message',
      stack: error?.stack || 'No stack trace',
    });
    return { session: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
