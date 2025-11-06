import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { readFile } from "fs/promises";
import { join } from "path";

const app = new Hono();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/public/calendar-embed.html", async (c) => {
  try {
    const html = await readFile(join(process.cwd(), "public", "calendar-embed.html"), "utf-8");
    return c.html(html);
  } catch (error) {
    console.error("Error reading calendar-embed.html:", error);
    return c.text("Calendar embed not found", 404);
  }
});

export default app;
