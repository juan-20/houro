import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: [process.env.CORS_ORIGIN || "", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposeHeaders: ["Authorization"],
  })
);

app.use("*", async (c, next) => {
  console.log("Incoming request:", {
    method: c.req.method,
    path: c.req.path,
    headers: Object.fromEntries(c.req.raw.headers.entries()),
  });
  await next();
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));


app.use("/api/*", trpcServer({
  router: appRouter,
  createContext: async (_opts, context) => {
    console.log("Creating tRPC context for path:", context.req.path);
    return createContext({ context });
  },
}));


app.get("/", (c) => {
  return c.text(`Welcome to the Hono server!`);
});

export default app;
