"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Wand2,
  FileText,
  CheckSquare,
  Beaker,
  GripVertical,
  Edit,
  Trash2,
  ImageIcon,
  Video,
  FileIcon,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AddLessonDialog from "@/components/add-lesson-dialog"
import MediaUploadDialog from "@/components/media-upload-dialog"
import MediaBadge from "@/components/media-badge"

export default function ModuleEditor({ module }) {
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; content: string; type: string; title: string } | null>(null)
  console.log("Selected lesson:", selectedLesson)
  const [mediaBadges, setMediaBadges] = useState([])
  console.log("Set selected lesson:", setSelectedLesson)
  const handleGenerateLesson = () => {
    setIsGeneratingLesson(true)
    // Simulate AI generation
    setTimeout(() => {
      setIsGeneratingLesson(false)
    }, 2000)
  }

  const getLessonIcon = (type) => {
    switch (type) {
      case "lecture":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "quiz":
        return <CheckSquare className="h-4 w-4 text-purple-500" />
      case "lab":
        return <Beaker className="h-4 w-4 text-amber-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getLessonTypeBadge = (type) => {
    switch (type) {
      case "lecture":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Lecture</span>
      case "quiz":
        return <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Quiz</span>
      case "lab":
        return <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Lab</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">{module.title}</h3>
              <p className="text-gray-500">{module.description}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 mt-6">
            <h4 className="font-medium">Lessons</h4>
            <div className="flex gap-2">
              <AddLessonDialog
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                }
                onAddLesson={(newLesson) => {
                  // Here you would typically update the lessons list
                  console.log("New lesson:", newLesson)
                }}
              />

              <Button size="sm" variant="outline">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {module.lessons.map((lesson) => (
                <div
                key={lesson.id}
                className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                  selectedLesson?.id === lesson.id ? "border-emerald-500 bg-emerald-50" : ""
                }`}
                onClick={() => setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)}
                >
                <div className="text-gray-400 cursor-grab">
                  <GripVertical className="h-5 w-5" />
                </div>
                {getLessonIcon(lesson.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                  <span className="font-medium">{lesson.title}</span>
                  {getLessonTypeBadge(lesson.type)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedLesson && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Lesson Content Editor</h3>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="learning-outcomes">Learning Outcomes</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Lesson Content</Label>
                  <Button variant="outline" size="sm">
                    <Wand2 className="h-3 w-3 mr-2" />
                    Enhance with AI
                  </Button>
                </div>
                <div className="flex gap-2 mb-2">
                  <MediaUploadDialog
                    type="image"
                    trigger={
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span>Add Image</span>
                      </Button>
                    }
                    onUpload={(media) => {
                      console.log("Image added:", media)
                      setMediaBadges([...mediaBadges, media])
                      // Here you would typically insert the image into the editor
                    }}
                  />
                  <MediaUploadDialog
                    type="video"
                    trigger={
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>Add Video</span>
                      </Button>
                    }
                    onUpload={(media) => {
                      console.log("Video added:", media)
                      setMediaBadges([...mediaBadges, media])
                      // Here you would typically insert the video into the editor
                    }}
                  />
                  <MediaUploadDialog
                    type="file"
                    trigger={
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <FileIcon className="h-4 w-4" />
                        <span>Add File</span>
                      </Button>
                    }
                    onUpload={(media) => {
                      console.log("File added:", media)
                      setMediaBadges([...mediaBadges, media])
                      // Here you would typically insert a link to the file into the editor
                    }}
                  />
                </div>

                {mediaBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 border rounded-md bg-gray-50">
                    <div className="text-xs font-medium text-gray-500 mr-2 flex items-center">Inserted Media:</div>
                    {mediaBadges.map((media) => (
                      <MediaBadge
                        key={media.id}
                        media={media}
                        onRemove={(id) => {
                          setMediaBadges(mediaBadges.filter((m) => m.id !== id))
                        }}
                        onInsert={(media) => {
                          // Here you would typically focus the editor and insert the media
                          console.log("Insert media:", media.insertText)
                        }}
                      />
                    ))}
                  </div>
                )}

                <Textarea
                  placeholder="Enter lesson content here..."
                  rows={12}
                  className="font-mono text-sm"
                  value={selectedLesson.content}
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </TabsContent>

              <TabsContent value="learning-outcomes" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Learning Outcomes</Label>
                  <Button variant="outline" size="sm">
                    <Wand2 className="h-3 w-3 mr-2" />
                    Generate Outcomes
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <Input defaultValue="Define machine learning and explain its importance" className="flex-1" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <Input
                      defaultValue="Identify the different types of machine learning approaches"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <Input defaultValue="Explain the key components of a machine learning system" className="flex-1" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Enter new learning outcome..." className="flex-1" />
                      <Button size="sm">Add</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>Additional Resources</Label>
                  <Button variant="outline" size="sm">
                    <Wand2 className="h-3 w-3 mr-2" />
                    Suggest Resources
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">Introduction to Machine Learning with Python</div>
                      <div className="text-sm text-gray-500">Book by Andreas C. Müller & Sarah Guido</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">Machine Learning Crash Course</div>
                      <div className="text-sm text-gray-500">Google's fast-paced, practical introduction to ML</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="p-3 border rounded-md">
                      <div className="space-y-2">
                        <Input placeholder="Resource title" className="w-full" />
                        <div className="flex gap-2">
                          <Input placeholder="URL or location" className="flex-1" />
                          <Select defaultValue="article">
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="book">Book</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" className="w-full">
                          Add Resource
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
