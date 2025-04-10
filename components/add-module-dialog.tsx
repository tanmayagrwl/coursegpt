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

export default function AddModuleDialog({ 
  trigger, 
  courseId, 
  handleRefresh,
  courseTitle,
}: { 
  trigger: React.ReactNode; 
  courseId: string; 
  handleRefresh: () => void 
  courseTitle: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDescription, setModuleDescription] = useState("")
  const [moduleLessons, setModuleLessons] = useState([])
  const [aiPrompt, setAiPrompt] = useState("")
  const [open, setOpen] = useState(false)

  const handleAddModule = async () => {
    if (!moduleTitle) return;
    try {      
      const response = await fetch(`/api/addModule/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDescription,
          lessons: moduleLessons,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add module');
      }
      
      handleRefresh()
      setModuleTitle("");
      setModuleDescription("");
      setAiPrompt("");
      
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  const handleGenerateModule = async () => {
    if (!aiPrompt) return;
  
    setIsGenerating(true);
  
    try {
      const response = await fetch(`/api/generateModule/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: `create a descriptive module around the topic ${aiPrompt} with reference to the course called ${courseTitle}` }),
      });
      console.log("Response:", response.body);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate module');
      }
  
      const moduleData = await response.json();
      console.log("Module Data >>>>>>:", moduleData.lessons);
      // Update state with the generated module data
      setModuleTitle(moduleData.title);
      setModuleDescription(moduleData.description || '');
      setModuleLessons(moduleData.lessons || []);
      console.log("Module lessonssss:", moduleLessons);
      
      // If you need to handle the lessons data as well
      // setLessons(moduleData.lessons);
      
      // You might want to add the module to the course here or in a separate function
      
    } catch (error) {
      console.error('Error generating module:', error);
      // Handle error, perhaps set an error state to display to the user
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddModule} disabled={!moduleTitle}>
            Add Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
