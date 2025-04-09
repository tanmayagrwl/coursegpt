"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Wand2 } from "lucide-react"
import Link from "next/link"

export default function NewCourse() {
  const router = useRouter()
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleGenerateDescription = () => {
    if (!courseTitle) return

    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setCourseDescription(
        `This comprehensive course on ${courseTitle} covers fundamental concepts, practical applications, and advanced techniques. Students will gain hands-on experience through interactive exercises and real-world projects.`,
      )
      setIsGenerating(false)
    }, 1500)
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!courseTitle || !category || !difficultyLevel) {
      setError("Title, category, and difficulty level are required")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/createCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription,
          category,
          difficultyLevel,
          status: "Draft",
          modules: []
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create course")
      }

      const { course } = await response.json()
      router.push(`/courses/${course._id}`)
    } catch (err) {
      console.error("Error creating course:", err)
      setError(err.message || "An error occurred while creating the course")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <Button 
            onClick={handleCreateCourse} 
            disabled={!courseTitle || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Course Title*</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Introduction to Data Science"
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="description">Course Description</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateDescription}
                            disabled={!courseTitle || isGenerating}
                            className="flex items-center gap-1"
                          >
                            <Wand2 className="h-3 w-3" />
                            {isGenerating ? "Generating..." : "Generate with AI"}
                          </Button>
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Describe what students will learn in this course..."
                          rows={5}
                          value={courseDescription}
                          onChange={(e) => setCourseDescription(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category*</Label>
                          <Input 
                            id="category" 
                            placeholder="e.g., Programming" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Difficulty Level*</Label>
                          <Input 
                            id="level" 
                            placeholder="e.g., Beginner" 
                            value={difficultyLevel}
                            onChange={(e) => setDifficultyLevel(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Course Preview</h3>
                    <div className="aspect-video bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500">
                      Course Thumbnail
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Upload a course thumbnail or generate one with AI</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Upload
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Wand2 className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}