"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BookOpen, Layers, Edit3, Zap } from "lucide-react"
import CourseList from "@/components/course-list"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-gray-900">CourseGPT</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Help
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input id="course-name" placeholder="Enter course name" />
                  </div>
                  <div className="space-y-2">
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">AI Generation Prompt (Optional)</Label>
                    <Textarea
                      id="ai-prompt"
                      placeholder="Describe your course and the AI will generate a structure for you..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Link href="/courses/new">
                    <Button>Continue</Button>
                  </Link>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to CourseGPT</h2>
            <p className="text-gray-600 mt-1">Create and manage AI-powered courses with ease</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>Choose a template or use AI to generate your course structure.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name-main">Course Name</Label>
                  <Input id="course-name-main" placeholder="Enter course name" />
                </div>
                <div className="space-y-2">
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt-main">AI Generation Prompt (Optional)</Label>
                  <Textarea
                    id="ai-prompt-main"
                    placeholder="Describe your course and the AI will generate a structure for you..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Link href="/courses/new">
                  <Button>Continue</Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-emerald-600" />}
            title="AI Lesson Generator"
            description="Create structured lessons with compelling content in seconds"
          />
          <FeatureCard
            icon={<Layers className="h-8 w-8 text-emerald-600" />}
            title="Module Organization"
            description="Organize lessons into cohesive modules with intelligent sequencing"
          />
          <FeatureCard
            icon={<Edit3 className="h-8 w-8 text-emerald-600" />}
            title="Interactive Editor"
            description="Edit and refine AI-generated content with powerful tools"
          />
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Your Courses</h3>
        </div>

        <CourseList />
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
