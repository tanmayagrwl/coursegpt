"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, CheckSquare, Beaker, Wand2, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import axios from "axios"
import { set } from "mongoose"

export default function AddLessonDialog({ trigger, courseId, moduleId, onLessonDeleted }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonType, setLessonType] = useState("lecture")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiDetails, setAiDetails] = useState("")
  const [open, setOpen] = useState(false);

  const handleGenerateLesson = () => {
    if (!aiPrompt) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      setLessonTitle(`Introduction to ${aiPrompt}`)
      setLessonType("lecture")
      setIsGenerating(false)
    }, 1500)
  }

  const handleAddLesson = async () => {
    if (!lessonTitle) return;

    try {
      // Assuming courseId and moduleId are props or coming from context/state
      // You'll need to add these as props to the component
      const response = await axios.post(`/api/addLesson/${courseId}/${moduleId}`, {
        title: lessonTitle,
        type: lessonType
      });

      if (response.status === 200) {
        onLessonDeleted()
        setOpen(false)

      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      // You might want to add error handling UI here
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>Create a new lesson manually or generate one with AI.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="ai">AI Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                placeholder="Enter lesson title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <RadioGroup value={lessonType} onValueChange={setLessonType} className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="lecture" id="lecture" />
                  <Label htmlFor="lecture" className="flex items-center cursor-pointer">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Lecture
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="quiz" id="quiz" />
                  <Label htmlFor="quiz" className="flex items-center cursor-pointer">
                    <CheckSquare className="h-4 w-4 mr-2 text-purple-500" />
                    Quiz
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="lab" id="lab" />
                  <Label htmlFor="lab" className="flex items-center cursor-pointer">
                    <Beaker className="h-4 w-4 mr-2 text-amber-500" />
                    Lab
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ai-topic">Topic or Concept</Label>
              <Input
                id="ai-topic"
                placeholder="e.g., Linear Regression in Machine Learning"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-details">Additional Details (Optional)</Label>
              <Textarea
                id="ai-details"
                placeholder="Provide any specific requirements or focus areas..."
                rows={3}
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleGenerateLesson} disabled={!aiPrompt || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Lesson...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Lesson
                </>
              )}
            </Button>

            {lessonTitle && (
              <div className="border rounded-md p-4 mt-4">
                <div className="flex items-center gap-2">
                  {lessonType === "lecture" && <FileText className="h-4 w-4 text-blue-500" />}
                  {lessonType === "quiz" && <CheckSquare className="h-4 w-4 text-purple-500" />}
                  {lessonType === "lab" && <Beaker className="h-4 w-4 text-amber-500" />}
                  <h4 className="font-medium">{lessonTitle}</h4>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleAddLesson} disabled={!lessonTitle}>
            Add Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
