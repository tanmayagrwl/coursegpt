"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Play, Plus, Trash2, MoveUp, MoveDown, Edit, Wand2, MoreHorizontal } from "lucide-react"
import ModuleEditor from "@/components/module-editor"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AddModuleDialog from "@/components/add-module-dialog"
import { Course } from "@/types/types"

export default function CourseDetail({ params }) {
  const [activeTab, setActiveTab] = useState("modules")
  const [activeModule, setActiveModule] = useState(null)

  const course: Course = {
    id: params.courseId,
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning algorithms and applications",
    modules: [
      {
        id: "m1",
        title: "Getting Started with Machine Learning",
        description: "An introduction to key concepts and terminology",
        lessons: [
          { id: "l1", title: "What is Machine Learning?", type: "lecture" },
          { id: "l2", title: "Types of Machine Learning", type: "lecture" },
          { id: "l3", title: "Machine Learning Applications", type: "lecture" },
          { id: "l4", title: "Module Quiz", type: "quiz" },
        ],
      },
      {
        id: "m2",
        title: "Supervised Learning",
        description: "Understanding supervised learning algorithms and use cases",
        lessons: [
          { id: "l5", title: "Classification Algorithms", type: "lecture" },
          { id: "l6", title: "Regression Algorithms", type: "lecture" },
          { id: "l7", title: "Evaluation Metrics", type: "lecture" },
          { id: "l8", title: "Practical Exercise", type: "lab" },
        ],
      },
    ],
  }

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId === activeModule ? null : moduleId)
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge>Draft</Badge>
            </div>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700">Publish Course</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="modules">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Course Modules</h3>
                      <AddModuleDialog
                        trigger={
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Module
                          </Button>
                        }
                        onAddModule={(newModule) => {
                          // Here you would typically update the modules list
                          console.log("New module:", newModule)
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      {course.modules.map((module) => (
                        <div
                          key={module.id}
                          className={`border rounded-md p-3 cursor-pointer transition-colors ${
                            activeModule === module.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleModuleClick(module.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-sm text-gray-500">{module.lessons.length} lessons</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MoveUp className="h-4 w-4 mr-2" />
                                  Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MoveDown className="h-4 w-4 mr-2" />
                                  Move Down
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {activeModule ? (
                  <ModuleEditor module={course.modules.find((m) => m.id === activeModule)} />
                ) : (
                  <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Wand2 className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Select a module or create a new one</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Select a module from the list or create a new one to start building your course content
                      </p>
                      <AddModuleDialog
                        trigger={
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Module
                          </Button>
                        }
                        onAddModule={(newModule) => {
                          // Here you would typically update the modules list
                          console.log("New module:", newModule)
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
