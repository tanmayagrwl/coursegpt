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
    // get all courses
    app.get("/api/getAllCourses", async (c) => {
      const course = await Course.find()
        return c.json(course, 200)
      });
    })

    // get course by course ID
    app.get("/api/getCourse/:id", async (c) => {
      const courseId = c.req.param("id");
      try {
      const course = await Course.findById(courseId);
      if (!course) {
        return c.json({ message: "Course not found" }, 404);
      }
      return c.json(course, 200);
      } catch (error) {
      return c.json((error as any)?.message || "Internal server error", 500);
      }
    });

    app.post("/api/test", (c) => c.json({ message: "PUT works!" }));

    // make course Draft
    app.post("/api/togglePublish/:id", async (c) => {
      try {
        const courseId = c.req.param("id");
        const course = await Course.findById(courseId);
        if (!course) {
          return c.json({ message: "Course not found" }, 404);
        }
    
        course.status = course.status === "Draft" ? "Published" : "Draft";
        await course.save();
    
        return c.json({
          message: `Course status updated to ${course.status}`,
          course,
        }, 200);
      } catch (error) {
        console.error(error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });

    // delete lesson
    app.post("/api/deleteLesson/:courseId/:moduleId/:lessonId", async (c) => {
      const courseId = c.req.param("courseId");
      const moduleId = c.req.param("moduleId");
      const lessonId = c.req.param("lessonId");
    
      try {
        const course = await Course.findById(courseId);
        if (!course) {
          return c.json({ message: "Course not found" }, 404);
        }
        const module = course.modules.find((m) => m.id === moduleId);
        if (!module) {
          return c.json({ message: "Module not found" }, 404);
        }
        module.lessons = module.lessons.filter((l) => l.id !== lessonId);
        await course.save();
    
        return c.json(
          {
            message: "Lesson deleted successfully",
            course,
          },
          200
        );
      } catch (error) {
        console.error("Error deleting lesson:", error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });

    //  add lesson
    app.post("/api/addLesson/:courseId/:moduleId", async (c) => {
      const courseId = c.req.param("courseId");
      const moduleId = c.req.param("moduleId");
      const { title, type } = await c.req.json();

      if (!title || !type) {
      return c.json({ message: "Lesson title and type are required" }, 400);
      }

      const lessonData = {
      id: `lesson-${Date.now()}`, // Generate a unique ID for the lesson
      title,
      type,
      content: "",
      learningOutcomes: [],
      additionalResources: [],
      };

      try {
      const course = await Course.findById(courseId);
      if (!course) {
        return c.json({ message: "Course not found" }, 404);
      }
      const module = course.modules.find((m) => m.id === moduleId);
      if (!module) {
        return c.json({ message: "Module not found" }, 404);
      }
      module.lessons.push(lessonData);
      await course.save();

      return c.json(
        {
        message: "Lesson added successfully",
        course,
        },
        200
      );
      } catch (error) {
      console.error("Error adding lesson:", error);
      return c.json((error as any)?.message || "Internal server error", 500);
      }
    });


    // update lesson
    app.post("/api/updateLesson/:courseId/:moduleId/:lessonId", async (c) => {
      const courseId = c.req.param("courseId");
      const moduleId = c.req.param("moduleId");
      const lessonId = c.req.param("lessonId");
      const lessonData = await c.req.json();
      
      try {
        const course = await Course.findById(courseId);
        if (!course) {
          return c.json({ message: "Course not found" }, 404);
        }
        
        const module = course.modules.find((m) => m.id === moduleId);
        if (!module) {
          return c.json({ message: "Module not found" }, 404);
        }
        
        const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
        if (lessonIndex === -1) {
          return c.json({ message: "Lesson not found" }, 404);
        }
        
        // Create a new object with the original lesson as the base
        const updatedLesson = {
          ...module.lessons[lessonIndex],
          ...lessonData
        };
        
        // Force the ID to be the original one
        updatedLesson.id = lessonId;
        
        // Replace the lesson with the updated version
        module.lessons[lessonIndex] = updatedLesson;
        
        await course.save();
        
        return c.json({
          message: "Lesson updated successfully",
          course
        }, 200);
      } catch (error) {
        console.error("Error updating lesson:", error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Hono on Vercel!' });
});


app.post("/api/post", async (c) => {
  const dummyData = {
    id: "course-12345", // Unique identifier for the course
    image: "https://example.com/course-image.jpg", // URL for the course image
    title: "Introduction to TypeScript", // Title of the course
    description: "Learn the basics of TypeScript, a typed superset of JavaScript.", // Description of the course
    category: "Programming", // Category of the course
    difficultyLevel: "Beginner", // Difficulty level
    thumbnail: "https://example.com/thumbnail.jpg", // URL for the course thumbnail
    status: "Published", // Status of the course
    modules: [
      {
        id: "module-1", // Unique identifier for the module
        title: "Getting Started with TypeScript", // Title of the module
        description: "An introduction to TypeScript and its key features.", // Description of the module
        lessons: [
          {
            id: "lesson-1", // Unique identifier for the lesson
            title: "What is TypeScript?", // Title of the lesson
            type: "lecture", // Type of lesson
            content: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.", // Content of the lesson
            learningOutcomes: [
              "Understand what TypeScript is",
              "Learn the benefits of using TypeScript",
            ], // Array of learning outcomes
            additionalResources: [
              {
                title: "Official TypeScript Documentation", // Title of the resource
                url: "https://www.typescriptlang.org/docs/", // URL for the resource
              },
            ], // Array of additional resources
          },
          {
            id: "lesson-2", // Unique identifier for the lesson
            title: "Setting Up TypeScript", // Title of the lesson
            type: "lab", // Type of lesson
            content: "Learn how to set up TypeScript in your development environment.", // Content of the lesson
            learningOutcomes: [
              "Install TypeScript",
              "Set up a TypeScript project",
            ], // Array of learning outcomes
            additionalResources: [
              {
                title: "TypeScript Setup Guide", // Title of the resource
                url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", // URL for the resource
              },
            ], // Array of additional resources
          },
        ], // Array of lessons
      },
      {
        id: "module-2", // Unique identifier for the module
        title: "TypeScript Basics", // Title of the module
        description: "Learn the basic syntax and features of TypeScript.", // Description of the module
        lessons: [
          {
            id: "lesson-3", // Unique identifier for the lesson
            title: "Type Annotations", // Title of the lesson
            type: "lecture", // Type of lesson
            content: "Learn how to use type annotations in TypeScript.", // Content of the lesson
            learningOutcomes: [
              "Understand type annotations",
              "Learn how to use basic types in TypeScript",
            ], // Array of learning outcomes
            additionalResources: [
              {
                title: "TypeScript Basic Types", // Title of the resource
                url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html", // URL for the resource
              },
            ], // Array of additional resources
          },
        ], // Array of lessons
      },
    ], // Array of modules
    createdAt: new Date(), // Timestamp for course creation
    updatedAt: new Date(), // Timestamp for course updates
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
