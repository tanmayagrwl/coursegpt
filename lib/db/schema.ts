import mongoose, { models } from "mongoose";

// Lesson Schema
const LessonSchema = new mongoose.Schema({
	title: { type: String, required: true }, // Title of the lesson
	type: { type: String, enum: ["lecture", "quiz", "lab"], required: true }, // Type of lesson
	content: { type: String }, // Optional content for the lesson
});

// Module Schema
const ModuleSchema = new mongoose.Schema({
	title: { type: String, required: true }, // Title of the module
	description: { type: String }, // Description of the module
	lessons: [LessonSchema], // Array of lessons
});

// Course Schema
const CourseSchema = new mongoose.Schema({
	title: { type: String, required: true }, // Title of the course
	description: { type: String }, // Description of the course
	category: { type: String, required: true }, // Category of the course (e.g., Programming, Data Science)
	difficultyLevel: {
		type: String,
		enum: ["Beginner", "Intermediate", "Advanced"],
		required: true,
	}, // Difficulty level
	thumbnail: { type: String }, // URL for the course thumbnail
	status: { type: String, enum: ["Draft", "Published"], default: "Draft" }, // Status of the course
	modules: [ModuleSchema], // Array of modules
	createdAt: { type: Date, default: Date.now }, // Timestamp for course creation
	updatedAt: { type: Date, default: Date.now }, // Timestamp for course updates
});

// User Schema
const UserSchema = new mongoose.Schema({
	name: { type: String, required: true }, // Name of the user
	email: { type: String, required: true, unique: true }, // Email of the user
	password: { type: String, required: true }, // Password of the user
	enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // References to enrolled courses
	role: {
		type: String,
		enum: ["Student", "Instructor", "Admin"],
		default: "Student",
	}, // Role of the user
});

// Export Models
export const Course = models.Course || mongoose.model("Course", CourseSchema);
