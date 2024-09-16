import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.get("/hello", async (c) => {
  const rss = await fetch(
    "https://news.google.com/rss/search?q=コラボカフェ"
  ).then((res) => {
    return res.text();
  });
  console.log(rss);
  return c.json({
    message: "Hello from Hono!",
  });
});

export const GET = handle(app);
