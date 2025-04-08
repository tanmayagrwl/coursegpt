"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Video, Upload, LinkIcon, Loader2 } from "lucide-react"

export default function MediaUploadDialog({ trigger, type = "image", onUpload }) {
  const [isUploading, setIsUploading] = useState(false)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create preview for images
      if (type === "image" && selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target.result)
        }
        reader.readAsDataURL(selectedFile)
      }
    }
  }

  const handleUpload = () => {
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      if (onUpload) {
        if (file) {
          const mediaId = `media-${Date.now()}`
          const mediaObject = {
            id: mediaId,
            type: type,
            file,
            name: file.name,
            url: preview || `/placeholder.svg?height=200&width=300`,
            insertText:
              type === "image"
                ? `![${file.name}](${preview || `/placeholder.svg?height=200&width=300`})`
                : type === "video"
                  ? `<video src="${mediaId}" controls></video>`
                  : `[${file.name}](${mediaId})`,
          }
          onUpload(mediaObject)
        } else if (url) {
          const mediaId = `media-${Date.now()}`
          const mediaObject = {
            id: mediaId,
            type: type,
            url,
            name: url.split("/").pop() || "Media",
            insertText:
              type === "image"
                ? `![${url.split("/").pop() || "Image"}](${url})`
                : type === "video"
                  ? `<video src="${url}" controls></video>`
                  : `[${url.split("/").pop() || "File"}](${url})`,
          }
          onUpload(mediaObject)
        }
      }
    }, 1500)
  }

  const getTitle = () => {
    switch (type) {
      case "image":
        return "Add Image"
      case "video":
        return "Add Video"
      case "file":
        return "Add File"
      default:
        return "Add Media"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "file":
        return <Upload className="h-5 w-5" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            <span>{getTitle()}</span>
          </DialogTitle>
          <DialogDescription>Upload from your device or add from a URL.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept={type === "image" ? "image/*" : type === "video" ? "video/*" : undefined}
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-gray-100">{getIcon()}</div>
                  <div className="text-sm font-medium">Click to upload or drag and drop</div>
                  <div className="text-xs text-gray-500">
                    {type === "image"
                      ? "SVG, PNG, JPG or GIF"
                      : type === "video"
                        ? "MP4, WebM or OGG"
                        : "PDF, DOCX, or TXT"}
                  </div>
                </div>
              </Label>
            </div>

            {preview && type === "image" && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Preview</div>
                <div className="border rounded-md overflow-hidden">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-[200px] mx-auto" />
                </div>
              </div>
            )}

            {file && !preview && (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <div className="p-2 bg-gray-100 rounded">{getIcon()}</div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="media-url">Media URL</Label>
              <div className="flex gap-2">
                <div className="bg-gray-100 p-2 rounded-l-md flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="media-url"
                  placeholder={`Enter ${type} URL...`}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>

            {url && type === "image" && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Preview</div>
                <div className="border rounded-md overflow-hidden">
                  <img
                    src={url || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[200px] mx-auto"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleUpload} disabled={(!file && !url) || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Add Media"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
