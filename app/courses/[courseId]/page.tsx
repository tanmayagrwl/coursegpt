"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown, Edit, Wand2, MoreHorizontal } from "lucide-react"
import ModuleEditor from "@/components/module-editor"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AddModuleDialog from "@/components/add-module-dialog"
import type { Course, Module } from "@/types/types"
import { useParams } from 'next/navigation'

interface ApiLesson {
  _id: string;
  title: string;
  type: string;
  difficultyLevel?: string;
  content: string;
  learningOutcomes?: string[];
}

interface ApiModule {
  _id: string;
  title: string;
  description: string;
  lessons: ApiLesson[];
}

interface ApiCourse {
  _id: string;
  title: string;
  description: string;
  status: string;
  modules: ApiModule[];
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState("modules")
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [course, setCourse] = useState<Course | null>(null)

  const fetchCourse = async () => {
    const response = await fetch(`/api/getCourse/${courseId}`);
    const data: ApiCourse = await response.json();
    
    if (data) {
      const mappedCourse: Course = {
        id: data._id,
        title: data.title,
        description: data.description,
        status: data.status === "Draft" || data.status === "Published" ? data.status : "Draft",
        modules: data.modules.map((module: ApiModule) => ({
          id: module._id,
          title: module.title,
          description: module.description,
          lessons: module.lessons.map((lesson: ApiLesson) => ({
            id: lesson._id,
            title: lesson.title,
            type: lesson.type,
            difficultyLevel: lesson.difficultyLevel || 'Beginner',
            content: lesson.content,
            learningOutcomes: lesson.learningOutcomes || [],
          })),
        })),
      };
      setCourse(mappedCourse);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // Function to handle lesson deletion refresh
  const handleLessonDeleted = () => {
    fetchCourse(); // Refetch the course data
  };

  const toggleCourseStatus = async () => {
    if (!course) return;
  
    try {
      const response = await fetch(`/api/togglePublish/${course.id}`, {
        method: "POST",
      });
      console.log("toggleCourseStatus", response)
      if (!response.ok) {
        throw new Error(`Failed to toggle course status: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data) {
        setCourse((prevCourse) => {
          if (!prevCourse) return null;
          return {
            ...prevCourse,
            status: prevCourse.status === "Draft" ? "Published" : "Draft",
          };
        });
      }
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
  };

  const handleModuleDelete = async (moduleId: string) => {
    if (!course) return;
  
    try {
      const response = await fetch(`/api/deleteModule/${course.id}/${moduleId}`, {
        method: "POST", // Changed from POST to DELETE
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete module: ${response.statusText}`);
      }
  
      // Optimistically update the UI
      setCourse(prevCourse => {
        if (!prevCourse) return null;
        return {
          ...prevCourse,
          modules: prevCourse.modules.filter(module => module.id !== moduleId),
        };
      });
  
      // Reset active module if it was the one deleted
      if (activeModule === moduleId) {
        setActiveModule(null);
      }
  
    } catch (error) {
      console.error("Error deleting module:", error);
      // Optionally show error to user
      alert("Failed to delete module. Please try again.");
      // Revert by refetching
      fetchCourse();
    }
  }

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId === activeModule ? null : moduleId)
  }

  if (!course) {
    return <div className="absolute top-1/2 left-1/2">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 py-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge>{course.status || "Draft"}</Badge>
            </div>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700" onClick={toggleCourseStatus}>{course.status === "Published"? "Draft Course" : "Publish Course"}</Button>
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
                        onAddModule={(newModule: Module) => {
                          setCourse((prevCourse) => {
                            if (!prevCourse) return null;
                            return {
                              ...prevCourse,
                              modules: [...prevCourse.modules, newModule],
                            };
                          });
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
                          onKeyUp={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              handleModuleClick(module.id);
                            }
                          }}
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
                                  <MoveUp className="h-4 w-4 mr-2" />
                                  Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MoveDown className="h-4 w-4 mr-2" />
                                  Move Down
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleModuleDelete(module.id)}>
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
                   <ModuleEditor 
                   courseId={courseId} 
                   module={course.modules.find((m) => m.id === activeModule)} 
                   onLessonDeleted={handleLessonDeleted}
                 />
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
                        onAddModule={(newModule : ApiModule) => {
                          setCourse((prevCourse) => ({
                            ...prevCourse!,
                            modules: [...prevCourse!.modules, newModule],
                          }))
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