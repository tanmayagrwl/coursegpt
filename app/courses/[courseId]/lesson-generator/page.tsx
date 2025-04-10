"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Wand2, Save, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LessonGenerator({ params }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [topic, setTopic] = useState("")
  const [complexity, setComplexity] = useState("intermediate")
  const [additionalContext, setAdditionalContext] = useState("")

  const handleGenerate = () => {
    if (!topic) return

    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent({
        title: `Understanding ${topic}`,
        learningOutcomes: [
          `Explain the core concepts of ${topic}`,
          `Identify key components and their relationships in ${topic}`,
          `Apply ${topic} principles to solve real-world problems`,
        ],
        content: `# Understanding ${topic}

## Introduction
${topic} is a fundamental concept in this field that helps us understand how systems interact and process information.

## Key Concepts
1. **Definition**: ${topic} refers to the systematic approach to organizing and interpreting data to extract meaningful insights.
2. **Historical Context**: The development of ${topic} began in the early stages of the field and has evolved significantly over time.
3. **Applications**: ${topic} is widely used in various domains including technology, science, and business.

## Practical Implementation
When implementing ${topic}, it's important to consider:
- Scalability concerns
- Performance optimization
- Integration with existing systems

## Common Challenges
- Complexity management
- Resource constraints
- Maintaining consistency

## Best Practices
1. Start with a clear understanding of requirements
2. Use modular design principles
3. Implement comprehensive testing
4. Document thoroughly

## Conclusion
Mastering ${topic} provides a strong foundation for advanced concepts and practical applications in the field.`,
        activities: [
          {
            title: "Concept Mapping Exercise",
            description: `Create a visual map of the key concepts related to ${topic} and how they interconnect.`,
          },
          {
            title: "Case Study Analysis",
            description: `Analyze a real-world implementation of ${topic} and identify strengths and weaknesses.`,
          },
        ],
        resources: [
          {
            title: `Introduction to ${topic}`,
            type: "Article",
            url: "#",
          },
          {
            title: `${topic} in Practice`,
            type: "Video",
            url: "#",
          },
        ],
      })

      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href={`/courses/${params.courseId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Course</span>
            </Link>
          </div>
          {generatedContent && (
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Lesson
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">AI Lesson Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Generation Parameters</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic or Concept</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Neural Networks"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger id="complexity">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Provide any specific requirements or focus areas..."
                      rows={4}
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleGenerate} disabled={!topic || isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Lesson
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!generatedContent && !isGenerating ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="bg-emerald-100 p-4 rounded-full mb-4">
                    <Wand2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">AI-Powered Lesson Generation</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Enter a topic or concept and our AI will generate a complete lesson with learning outcomes, content,
                    activities, and resources.
                  </p>
                </CardContent>
              </Card>
            ) : isGenerating ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
                  <h3 className="text-xl font-medium mb-2">Generating Your Lesson</h3>
                  <p className="text-gray-500 max-w-md">
                    Our AI is crafting a comprehensive lesson based on your parameters. This may take a moment...
                  </p>
                </CardContent>
              </Card>
            ) : (
              generatedContent && (
                <Card>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="learning-outcomes">Learning Outcomes</TabsTrigger>
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                      </TabsList>

                      <TabsContent value="preview" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">{generatedContent.title}</h3>
                          <Button variant="outline" size="sm">
                            <Wand2 className="h-3 w-3 mr-2" />
                            Regenerate
                          </Button>
                        </div>

                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border">
                            {generatedContent.content}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="learning-outcomes" className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Learning Outcomes</h3>
                          <Button variant="outline" size="sm">
                            <Wand2 className="h-3 w-3 mr-2" />
                            Regenerate
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {generatedContent.learningOutcomes.map((outcome, index) => (
                            <div key={index} className="p-3 border rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Outcome {index + 1}:</span>
                                <span>{outcome}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="activities" className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Learning Activities</h3>
                          <Button variant="outline" size="sm">
                            <Wand2 className="h-3 w-3 mr-2" />
                            Regenerate
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {generatedContent.activities.map((activity, index) => (
                            <div key={index} className="p-4 border rounded-md">
                              <h4 className="font-medium mb-2">{activity.title}</h4>
                              <p className="text-gray-600">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
