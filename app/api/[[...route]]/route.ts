import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import dbConnect from '@/lib/db/connect';
import { cors } from 'hono/cors'
import { Course } from '@/lib/db/schema';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


const app = new Hono();
app.use('*', cors())




const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  tools: [
    {
      codeExecution: {},
    },
  ],
});


app.post('/generate', async (c) => {
  try {
    const data = await c.req.json();
    const prompt = data.text || "Explain how AI works";
    const result = await model.generateContent(prompt);
    return c.json({
      summary: result.response.text(),
    }, 200);
  } catch (error) {
    return c.json((error as any)?.message || "Internal server error", 500);
  }
});



dbConnect()
  .then(() => {
    // get all notes
    app.get("/api/log", async (c) => {
      const course = await Course.find()
        return c.json(course, 200)
      });
    })


app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Hono on Vercel!' });
});


app.post("/api/post", async (c) => {
  const dummyData = {
    title: "Introduction to TypeScript",
    description: "Learn the basics of TypeScript, a typed superset of JavaScript.",
    category: "Programming",
    difficultyLevel: "Beginner",
    thumbnail: "https://example.com/thumbnail.jpg",
    status: "Published",
    modules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const course = new Course(dummyData);
    const document = await course.save();
    return c.json(document, 200);
  } catch (error) {
    return c.json((error as any)?.message || "Internal server error", 500);
  }
});


export const GET = handle(app);
export const POST = handle(app);
