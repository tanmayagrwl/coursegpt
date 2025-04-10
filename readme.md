# CourseGPT

CourseGPT is a powerful AI-driven platform for creating and managing educational courses. Leverage the power of AI to generate complete course structures, modules, and lessons, saving hours of content creation time.

## Features

### Course Management
- **Create Courses**: Generate full courses with AI or create them manually with customizable titles, descriptions, and difficulty levels
- **Course Dashboard**: View and manage all your courses in one place
- **Publish/Draft Toggle**: Easily switch courses between published and draft status

### Module Management
- **AI Module Generation**: Automatically create comprehensive modules with a single prompt
- **Custom Modules**: Create your own modules with tailored titles and descriptions
- **Module Organization**: Arrange modules in a logical teaching sequence

### Lesson Creation
- **Multiple Lesson Types**: Create lectures, quizzes, and lab exercises
- **AI-Generated Lessons**: Generate complete lessons with AI, including:
  - Detailed content
  - Learning outcomes
  - Activities
- **Lesson Editor**: Edit and refine lesson content with a rich text editor
- **Markdown Support**: Format lesson content with Markdown, with live preview

### Content Enhancement
- **Learning Outcomes Generation**: Automatically create measurable learning outcomes for any lesson
- **Content Enhancement**: Use AI to improve and expand existing content
- **Thumbnails**: Upload or auto-generate course thumbnails

## Getting Started

1. **Dashboard**: Navigate to the main dashboard to see all your courses
2. **Create a Course**: Click "Create New Course" and enter basic course details
3. **Add Modules**: Within a course, create modules using AI or add them manually
4. **Add Lessons**: For each module, add lessons using the "Add Lesson" button
5. **Edit Content**: Use the module editor to refine and enhance your lesson content

## How to Use AI Generation

### Generate a Complete Course
1. Click "Create New Course"
2. Enter a course title
3. (Optional) Add an AI generation prompt
4. Click "Continue" to generate a full course structure

### Generate a Module
1. Navigate to your course
2. Click "Add Module"
3. Enter a topic or concept in the AI prompt field
4. Click "Generate Module"

### Generate a Lesson
1. Navigate to a module
2. Click "Add Lesson"
3. Select the "AI Generation" tab
4. Enter a topic and (optional) details
5. Click "Generate Lesson"

### Enhance Content
1. Select a lesson
2. In the content editor, click "Enhance with AI"
3. The AI will improve and expand your existing content

## Installation & Setup

### Prerequisites
- Node.js (v18 or later)
- pnpm
- Hono
- MongoDB (local instance or cloud connection)
- Google API credentials (for Gemini AI integration)

### Clone & Install
1. **Clone the repository**
    ```bash
    git clone https://github.com/tanmayagrwl/coursegpt.git
    cd coursegpt
    ```

2. **Install dependencies**
    ```bash
    pnpm install
    ```

3. **Environment setup**
    - Create a `.env` file in the root directory
    - Add the following variables:
      ```
      MONGODB_URI=your_mongodb_connection_string
      GOOGLE_API_KEY=your_gemini_api_key
      ```

### Running the Application
1. **Development mode**
    ```bash
    pnpm run dev
    ```

2. **Production build**
    ```bash
    pnpm run build
    pnpm start
    ```

3. **Access the application**
    - Open your browser and navigate to `http://localhost:3000`


## Technologies

CourseGPT is built with:
- Next.js
- TypeScript
- MongoDB
- Hono
- Tailwind CSS
- Shadcn UI
- Gemini 2.0 Flash

## License

[License information would be here]



---

Transform your course creation process with CourseGPT - the AI-powered solution for educators and content creators.