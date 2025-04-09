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
import { Wand2, Loader2 } from "lucide-react"

export default function AddModuleDialog({ trigger, courseId, handleRefresh}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")


  const handleAddModule = async () => {
    
    if (!moduleTitle) return;
    
    try {
      // Replace with your actual course ID and API endpoint

      
      const response = await fetch(`/api/addModule/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDescription,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add module');
      }
      
      handleRefresh()
      
      // Reset form
      setModuleTitle("");
      setModuleDescription("");
      setAiPrompt("");
      
    } catch (error) {
      console.error("Error adding module:", error);
      // You might want to add error handling UI here
    }
  };

  const handleGenerateModule = () => {
    if (!aiPrompt) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      setModuleTitle("Understanding Core Concepts")
      setModuleDescription(
        "This module covers the fundamental concepts and principles that form the foundation of the subject.",
      )
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>Create a new module manually or generate one with AI.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="ai">AI Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                placeholder="Enter module title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Module Description</Label>
              <Textarea
                id="module-description"
                placeholder="Describe what this module covers..."
                rows={3}
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">What should this module cover?</Label>
              <Textarea
                id="ai-prompt"
                placeholder="e.g., Create a module about machine learning algorithms with lessons on classification, regression, and clustering"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleGenerateModule} disabled={!aiPrompt || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Module
                </>
              )}
            </Button>

            {moduleTitle && (
              <div className="border rounded-md p-4 mt-4">
                <h4 className="font-medium">{moduleTitle}</h4>
                <p className="text-sm text-gray-500 mt-1">{moduleDescription}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleAddModule} disabled={!moduleTitle}>
            Add Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
