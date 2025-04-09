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

    // create a new course
    app.post("/api/createCourse", async (c) => {
      try {
        const {
          title,
          description,
          category,
          difficultyLevel,
          thumbnail,
          status,
          modules = []
        } = await c.req.json();

        // Validate required fields
        if (!title || !category || !difficultyLevel) {
          return c.json({
            message: "Title, category, and difficulty level are required"
          }, 400);
        }

        // Create course object
        const courseData = {
          title,
          description: description || "",
          category,
          difficultyLevel,
          thumbnail: thumbnail || "",
          status: status || "Draft",
          modules: modules.map(module => ({
            ...module,
            id: module.id || `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          })),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();

        return c.json({
          message: "Course created successfully",
          course: savedCourse
        }, 201);
      } catch (error) {
        console.error("Error creating course:", error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });


    // delete module
    app.post("/api/deleteModule/:courseId/:moduleId", async (c) => {
      const courseId = c.req.param("courseId");
      const moduleId = c.req.param("moduleId");

      try {
        const course = await Course.findById(courseId);
        if (!course) {
          return c.json({ message: "Course not found" }, 404);
        }
        
        // Filter out the module to be deleted
        course.modules = course.modules.filter((m) => m.id !== moduleId);
        await course.save();

        return c.json({
          message: "Module deleted successfully",
          course,
        }, 200);
      } catch (error) {
        console.error("Error deleting module:", error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });

    // add a module to a course
    app.post("/api/addModule/:courseId", async (c) => {
      const courseId = c.req.param("courseId");
      const { title, description } = await c.req.json();

      if (!title) {
        return c.json({ message: "Module title is required" }, 400);
      }

      try {
        const course = await Course.findById(courseId);
        if (!course) {
          return c.json({ message: "Course not found" }, 404);
        }

        const moduleData = {
          id: `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description: description || "",
          lessons: []
        };

        course.modules.push(moduleData);
        await course.save();

        return c.json({
          message: "Module added successfully",
          course
        }, 200);
      } catch (error) {
        console.error("Error adding module:", error);
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });


export const GET = handle(app);
export const POST = handle(app);
