import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { XMLParser } from "fast-xml-parser";

export const runtime = "edge";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
    }
  }
}

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.get("/hello", async (c) => {
  const res: {
    id: string;
    title: string;
    link: string;
    publicationDate: string;
    description: string;
    source: string;
  }[] = [];
  const parser = new XMLParser();
  const dom = parser.parse(
    await (
      await fetch(
        "https://news.google.com/rss/search?q=コラボカフェ&hl=ja&gl=JP&ceid=JP:ja"
      )
    ).text()
  );
  const items = dom.rss.channel.item;
  items.forEach(
    (item: {
      guid: string;
      title: string;
      link: string;
      pubDate: string;
      description: string;
      source: string;
    }) => {
      res.push({
        id: item.guid || "",
        title: item.title || "",
        link: item.link || "",
        publicationDate: item.pubDate || "",
        description: item.description || "",
        source: item.source || "",
      });
    }
  );

  return c.json({
    items: res,
  });
});

app.get("/query/rss", async (c) => {
  console.log("process", env.DB);
  console.log("c", c.env.DB);
  const { results } = await process.env.DB.prepare("SELECT * FROM RSS").all();
  return c.json(results);
});

export const GET = handle(app);
