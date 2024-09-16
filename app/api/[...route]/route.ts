import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { JSDOM } from "jsdom"

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', async(c) => {
  const res: {
    id: string,
    title: string,
    link: string,
    publicationDate: string,
    description: string,
    source: string
  }[] = [];
  const dom = new JSDOM(await (await fetch('https://news.google.com/rss/search?q=コラボカフェ')).text())
  const items = dom.window.document.querySelectorAll('item');
  items.forEach(item => {
    res.push({
      id: item.querySelector('guid')?.textContent || "",
      title: item.querySelector('title')?.textContent || "",
      link: item.querySelector('link')?.textContent || "",
      publicationDate: item.querySelector('pubDate')?.textContent || "",
      description: item.querySelector('description')?.textContent || "",
      source: item.querySelector('source')?.textContent || ""
    })
  });

  console.log(res);
  
  return c.json({
    message: 'Hello from Hono!'
  })
})

export const GET = handle(app)
