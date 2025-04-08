export interface Lesson {
    id: string; // Unique identifier for the lesson
    title: string; // Title of the lesson
    type: 'lecture' | 'quiz' | 'lab'; // Type of lesson
    content?: string; // Optional content for the lesson
  }
  
  // Module Type
  export interface Module {
    id: string; // Unique identifier for the module
    title: string; // Title of the module
    description?: string; // Description of the module
    lessons: Lesson[]; // Array of lessons
  }
  
  // Course Type
  export interface Course {
    id: string; // Unique identifier for the course
    title: string; // Title of the course
    description?: string; // Description of the course
    category: string; // Category of the course (e.g., Programming, Data Science)
    difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced'; // Difficulty level
    thumbnail?: string; // URL for the course thumbnail
    status: 'Draft' | 'Published'; // Status of the course
    modules: Module[]; // Array of modules
    createdAt: Date; // Timestamp for course creation
    updatedAt: Date; // Timestamp for course updates
  }
  
  // User Type
  export interface User {
    name: string; // Name of the user
    email: string; // Email of the user
    password: string; // Password of the user
    enrolledCourses: string[]; // Array of course IDs (references to courses)
    role: 'Student' | 'Instructor' | 'Admin'; // Role of the user
  }