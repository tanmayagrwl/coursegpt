import { Hono } from "hono";
import { handle } from "hono/vercel";
import dbConnect from "@/lib/db/connect";
import { cors } from "hono/cors";
import { Course } from "@/lib/db/schema";
import { GoogleGenerativeAI, SchemaType as Type } from "@google/generative-ai";
import { NextResponse } from "next/server";

const app = new Hono().basePath("/api");
app.use("*", cors());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
const model = genAI.getGenerativeModel({
	model: "gemini-2.0-flash-001",
});

app.post("/generate", async (c) => {
	try {
		const data = await c.req.json();
		const prompt = data.text || "Explain how AI works";
    console.log("Prompt:", prompt);
		const result = await model.generateContent({
			contents: [
				{
					parts: [
						{
							text: prompt,
						},
					],
					role: "user",
				},
			],
			systemInstruction:
				"You are an expert course creator. For the given title or topic, generate a comprehensive course outline including: 1) A compelling course title if not provided, 2) A detailed course description explaining what students will learn, 3) Appropriate category classification, 4) Suitable difficulty level, 5) Well-structured modules that follow a logical progression, 6) Diverse lesson types (lectures, quizzes, labs) within each module, 7) Clear learning outcomes for each lesson, and 8) Specific content suggestions for key lessons. Ensure the course is engaging, practical, and follows educational best practices.\n\n\n Lesson.content is the entire so INCLUDE A FULL BOOK OF CONTENT in the field, user can learn about the full topic just by reading the content of the lesson. \n\n\n",

			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						title: {
							type: Type.STRING,
							nullable: false,
							description: "Title of the course",
						},
						description: {
							type: Type.STRING,
							nullable: true,
							description: "Description of the course",
						},
						category: {
							type: Type.STRING,
							nullable: false,
							description: "Category of the course",
						},
						difficultyLevel: {
							type: Type.STRING,
							enum: ["Beginner", "Intermediate", "Advanced"],
							format: "enum",
							nullable: false,
							description: "Difficulty level of the course",
						},
						thumbnail: {
							type: Type.STRING,
							nullable: true,
							description: "URL of the thumbnail",
						},
						status: {
							type: Type.STRING,
							enum: ["Draft", "Published"],
							nullable: true,
							format: "enum",
							description: "Status of the course",
						},
						modules: {
							type: Type.ARRAY,
							items: {
								type: Type.OBJECT,
								properties: {
									title: {
										type: Type.STRING,
										nullable: false,
										description: "Title of the module",
									},
									description: {
										type: Type.STRING,
										nullable: true,
										description: "Description of the module",
									},
									lessons: {
										type: Type.ARRAY,
										items: {
											type: Type.OBJECT,
											properties: {
												title: {
													type: Type.STRING,
													nullable: false,
													description: "Title of the lesson",
												},
												type: {
													type: Type.STRING,
													enum: ["lecture", "quiz", "lab"],
													format: "enum",
													nullable: false,
													description: "Type of the lesson",
												},
												content: {
													type: Type.STRING,
													nullable: true,
													description: "Content of the lesson",
												},
												learningOutcomes: {
													type: Type.ARRAY,
													items: { type: Type.STRING },
													nullable: true,
													description: "Learning outcomes of the lesson",
												},
											},
											required: ["title", "type"],
										},
									},
								},
								required: ["title"],
							},
						},
					},
					required: ["title", "category", "difficultyLevel"],
				},
			},
		});
    const parsedResult = JSON.parse(result.response.text());
    console.log("Parsed Result:", parsedResult);
    // Create a new course document
    const courseData = {
      ...parsedResult,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const course = new Course(courseData);
      const savedCourse = await course.save();
      
      return c.json({
        message: "Course generated and saved successfully",
        course: savedCourse
      }, 201);
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Still return the generated content even if DB save fails
      return c.json({
        message: "Course generated but not saved to database",
        course: parsedResult,
        error: (dbError as any)?.message
      }, 200);
    }
    
	} catch (error) {
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});


app.post("/generateModule/:courseId", async (c) => {
	try {
		const courseId = c.req.param("courseId");

		// Find the course first
		const course = await Course.findById(courseId);
		if (!course) {
			return c.json({ message: "Course not found" }, 404);
		}

		const data = await c.req.json();
		const prompt = data.text;
		console.log("Prompt:", prompt);

		const result = await model.generateContent({
			contents: [
				{
					parts: [
						{
							text: prompt,
						},
					],
					role: "user",
				},
			],
			systemInstruction: `You are an expert module creator. For the given topic, generate a comprehensive course module including:
				1) A compelling module title if not provided
				2) A detailed module description explaining what students will learn
				3) Well-structured lessons that follow a logical progression
				4) Diverse lesson types (lectures, quizzes, labs)
				5) Clear learning outcomes for each lesson
				6) Specific content for each lesson (include full educational content)
				
				Ensure the module is engaging, practical, and follows educational best practices. Each lesson's content should be comprehensive enough that a student could learn the material just by reading it.`,

			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						title: {
							type: Type.STRING,
							nullable: false,
							description: "Title of the module",
						},
						description: {
							type: Type.STRING,
							nullable: true,
							description: "Description of the module",
						},
						lessons: {
							type: Type.ARRAY,
							items: {
								type: Type.OBJECT,
								properties: {
									title: {
										type: Type.STRING,
										nullable: false,
										description: "Title of the lesson",
									},
									type: {
										type: Type.STRING,
										enum: ["lecture", "quiz", "lab"],
										format: "enum",
										nullable: false,
										description: "Type of the lesson",
									},
									content: {
										type: Type.STRING,
										nullable: true,
										description: "Comprehensive content of the lesson",
									},
									learningOutcomes: {
										type: Type.ARRAY,
										items: { type: Type.STRING },
										nullable: true,
										description: "Learning outcomes of the lesson",
									},
								},
								required: ["title", "type"],
							},
						},
					},
					required: ["title", "lessons"],
				},
			},
		});

		const responseText = await result.response.text();
		const parsedResult = JSON.parse(responseText);

		return c.json(parsedResult);

	} catch (error) {
		console.error("Error generating module:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// app.post("/generateLessons/", async (c) => {
// 	const { title } = await c.req.json();


// 	if (!title) {
// 		return c.json({ message: "Title is required" }, 400);
// 	}

// 	try {
// 		const result = await model.generateContent({
// 			contents: [
// 				{
// 					parts: [
// 						{
// 							text: title,
// 						},
// 					],
// 					role: "user",
// 				},
// 			],
// 			systemInstruction:
// 				"You are an expert course creator specializing in educational content development. For the given lesson title, generate a comprehensive set of lessons that follow a logical learning progression. Each lesson should include:\n\n1. A clear, descriptive title that accurately reflects the content\n2. An appropriate lesson type (lecture, quiz, or lab) based on the content's purpose\n3. Detailed, comprehensive content that thoroughly explains concepts, includes relevant examples, practical applications, and addresses potential questions or misconceptions\n4. Specific learning outcomes that are measurable, achievable, and aligned with the lesson content\n\nFor lectures: Include thorough explanations, examples, definitions, and contextual information.\nFor quizzes: Create meaningful assessment questions with explanations for correct answers.\nFor labs: Design practical, hands-on activities with clear step-by-step instructions.\n\nEnsure all content is educationally sound, engaging, and provides sufficient depth for learners to master the topic. The entire collection of lessons should build upon each other and cover the course subject comprehensively. Make sure that quizzes have qestions and answers relevent to the topic.\n\n\n Lesson.content is the entire so INCLUDE A FULL BOOK OF CONTENT in the field, user can learn about the full topic just by reading the content of the lesson. \n\n\n",	
// 			generationConfig: {
// 				responseMimeType: "application/json",
// 				responseSchema: {
// 					type: Type.ARRAY,
// 					items: {
// 						type: Type.OBJECT,
// 						properties: {
// 							title: {
// 								type: Type.STRING,
// 								nullable: false,
// 								description: "Title of the lesson",
// 							},
// 							type: {
// 								type: Type.STRING,
// 								enum: ["lecture", "quiz", "lab"],
// 								format: "enum",
// 								nullable: false,
// 								description: "Type of the lesson",
// 							},
// 							content: {
// 								type: Type.STRING,
// 								nullable: true,
// 								description: "Content of the lesson",
// 							},
// 							learningOutcomes: {
// 								type: Type.ARRAY,
// 								items: { type: Type.STRING },
// 								nullable: true,
// 								description: "Learning outcomes of the lesson",
// 							},
// 						},
// 						required: ["title", "type"],
// 					},
// 				},
// 			},
// 		});
// 		return c.json(JSON.parse(result.response.text()), 200);
		
// 	} catch (error) {
// 		return c.json((error as any)?.message || "Internal server error", 500);
// 	}
// });


app.post("/generateLesson", async (c) => {
    const { title } = await c.req.json();

    if (!title) {
        return c.json({ message: "Title is required" }, 400);
    }

    try {
        const result = await model.generateContent({
            contents: [
                {
                    parts: [
                        {
                            text: title,
                        },
                    ],
                    role: "user",
                },
            ],
            systemInstruction:
                "You are an expert course creator specializing in educational content development. For the given lesson title, generate a comprehensive set of lessons that follow a logical learning progression. Each lesson should include:\n\n1. A clear, descriptive title that accurately reflects the content\n2. An appropriate lesson type (lecture, quiz, or lab) based on the content's purpose\n3. Detailed, comprehensive content that thoroughly explains concepts, includes relevant examples, practical applications, and addresses potential questions or misconceptions\n4. Specific learning outcomes that are measurable, achievable, and aligned with the lesson content\n\nFor lectures: Include thorough explanations, examples, definitions, and contextual information.\nFor quizzes: Create meaningful assessment questions with explanations for correct answers.\nFor labs: Design practical, hands-on activities with clear step-by-step instructions.\n\nEnsure all content is educationally sound, engaging, and provides sufficient depth for learners to master the topic. The entire collection of lessons should build upon each other and cover the course subject comprehensively. Make sure that quizzes have qestions and answers relevent to the topic.\n\n\n Lesson.content is the entire so INCLUDE A FULL BOOK OF CONTENT in the field, user can learn about the full topic just by reading the content of the lesson. \n\n\n",	
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            nullable: false,
                            description: "Title of the lesson",
                        },
                        type: {
                            type: Type.STRING,
                            enum: ["lecture", "quiz", "lab"],
                            format: "enum",
                            nullable: false,
                            description: "Type of the lesson",
                        },
                        content: {
                            type: Type.STRING,
                            nullable: true,
                            description: "Content of the lesson",
                        },
                        learningOutcomes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            nullable: true,
                            description: "Learning outcomes of the lesson",
                        },
                    },
                    required: ["title", "type"],
                },
            },
        });
        return c.json(JSON.parse(result.response.text()), 200);
        
    } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
    }
});


app.post("/generateContent", async (c) => {
	const { title } = await c.req.json();

	if (!title) {
		return c.json({ message: "Title is required" }, 400);
	}

	try {
		const result = await model.generateContent({
			contents: [
				{
					parts: [
						{
							text: title,
						},
					],
					role: "user",
				},
			],
			systemInstruction:
				"You are an expert course creator. For the given lesson title, generate a comprehensive content that thoroughly explains concepts, includes relevant examples, practical applications, and addresses potential questions or misconceptions.",
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						content: {
							type: Type.STRING,
							nullable: false,
							description: "Content of the lesson",
						},
					},
					required: ["content"],
				},
			},
		});
		return c.json(JSON.parse(result.response.text()), 200);
	} catch (error) {
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

app.post("/generateOutcomes", async (c) => {
	const { title } = await c.req.json();

	if (!title) {
		return c.json({ message: "Title is required" }, 400);
	}

	try {
		const result = await model.generateContent({
			contents: [
				{
					parts: [
						{
							text: title,
						},
					],
					role: "user",
				},
			],
			systemInstruction:
				"You are an expert course creator. For the given lesson title, generate a comprehensive set of learning outcomes that are measurable, achievable, and aligned with the lesson content.",
			generationConfig: {
				responseMimeType: "application/json",
				responseSchema: {
					type: Type.ARRAY,
					items: {
						type: Type.STRING,
						nullable: false,
						description: "Learning outcome of the lesson",
					},
				},
			},
		});
		return c.json(JSON.parse(result.response.text()), 200);
	} catch (error) {
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

dbConnect().then(() => {
	// get all courses
	app.get("/getAllCourses", async (c) => {
		const course = await Course.find();
		return c.json(course, 200);
	});
});

// get course by course ID
app.get("/getCourse/:id", async (c) => {
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

app.post("/test", (c) => c.json({ message: "PUT works!" }));

// make course Draft
app.post("/togglePublish/:id", async (c) => {
	try {
		const courseId = c.req.param("id");
		const course = await Course.findById(courseId);
		if (!course) {
			return c.json({ message: "Course not found" }, 404);
		}

		course.status = course.status === "Draft" ? "Published" : "Draft";
		await course.save();

		return c.json(
			{
				message: `Course status updated to ${course.status}`,
				course,
			},
			200,
		);
	} catch (error) {
		console.error(error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// delete lesson
app.post("/deleteLesson/:courseId/:moduleId/:lessonId", async (c) => {
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
			200,
		);
	} catch (error) {
		console.error("Error deleting lesson:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

//  add lesson
app.post("/addLesson/:courseId/:moduleId", async (c) => {
	const courseId = c.req.param("courseId");
	const moduleId = c.req.param("moduleId");
	const { title, type, content, learningOutcomes } = await c.req.json();

	if (!title || !type ) {
		return c.json({ message: "Lesson title and type are required" }, 400);
	}

	const lessonData = {
		id: `lesson-${Date.now()}`, // Generate a unique ID for the lesson
		title,
		type,
		content,
		learningOutcomes,
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
			200,
		);
	} catch (error) {
		console.error("Error adding lesson:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// update lesson
app.post("/updateLesson/:courseId/:moduleId/:lessonId", async (c) => {
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
			...lessonData,
		};

		// Force the ID to be the original one
		updatedLesson.id = lessonId;

		// Replace the lesson with the updated version
		module.lessons[lessonIndex] = updatedLesson;

		await course.save();

		return c.json(
			{
				message: "Lesson updated successfully",
				course,
			},
			200,
		);
	} catch (error) {
		console.error("Error updating lesson:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// create a new course
app.post("/createCourse", async (c) => {
	try {
		const {
			title,
			description,
			category,
			difficultyLevel,
			thumbnail,
			status,
			modules = [],
		} = await c.req.json();

		// Validate required fields
		if (!title || !category || !difficultyLevel) {
			return c.json(
				{
					message: "Title, category, and difficulty level are required",
				},
				400,
			);
		}

		// Create course object
		const courseData = {
			title,
			description: description || "",
			category,
			difficultyLevel,
			thumbnail: thumbnail || "",
			status: status || "Draft",
			modules: modules.map((module) => ({
				...module,
				id:
					module.id ||
					`module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			})),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const course = new Course(courseData);
		const savedCourse = await course.save();

		return c.json(
			{
				message: "Course created successfully",
				course: savedCourse,
			},
			201,
		);
	} catch (error) {
		console.error("Error creating course:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// delete module
app.post("/deleteModule/:courseId/:moduleId", async (c) => {
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

		return c.json(
			{
				message: "Module deleted successfully",
				course,
			},
			200,
		);
	} catch (error) {
		console.error("Error deleting module:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

// add a module to a course
app.post("/addModule/:courseId", async (c) => {
	const courseId = c.req.param("courseId");
	const { title, description, lessons } = await c.req.json();
	console.log("Lesson:", lessons);
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
			lessons: lessons,
		};

		course.modules.push(moduleData);
		await course.save();

		return c.json(
			{
				message: "Module added successfully",
				course,
			},
			200,
		);
	} catch (error) {
		console.error("Error adding module:", error);
		return c.json((error as any)?.message || "Internal server error", 500);
	}
});

export const GET = handle(app);
export const POST = handle(app);
