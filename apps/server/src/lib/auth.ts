import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import { createAuthEndpoint } from "better-auth/api";
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "",
    "my-better-t-app://",
    "*",
  ],
  socialProviders: {
    google: {
      prompt: "select_account", 
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    // microsoft: {
    //   clientId: process.env.GITHUB_CLIENT_ID || "",
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    // },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
  },
  plugins: [expo()],
  debug: true,
  session: {
    // Add more lenient session settings for debugging
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  }
});