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
  const [isGenerating, setIsGenerating] = useState(false)

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

  const handleCreateCourse = (e) => {
    e.preventDefault()
    // Here you would typically save the course to your backend
    router.push("/courses/1") // Redirect to the new course page
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
          <Button onClick={handleCreateCourse} disabled={!courseTitle}>
            <Save className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        <Tabs defaultValue="details" className="w-full">
        

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Introduction to Data Science"
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
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
                          <Label htmlFor="category">Category</Label>
                          <Input id="category" placeholder="e.g., Programming" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level">Difficulty Level</Label>
                          <Input id="level" placeholder="e.g., Beginner" />
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
