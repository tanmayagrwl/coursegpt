"use client"

import { useState } from "react"
import { ImageIcon, Video, FileIcon, X, Edit, Copy, ExternalLink } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default function MediaBadge({ media, onRemove, onInsert }) {
  const [isOpen, setIsOpen] = useState(false)

  const getIcon = () => {
    switch (media.type) {
      case "image":
        return <ImageIcon className="h-3 w-3 text-blue-500" />
      case "video":
        return <Video className="h-3 w-3 text-purple-500" />
      case "file":
        return <FileIcon className="h-3 w-3 text-amber-500" />
      default:
        return <FileIcon className="h-3 w-3 text-gray-500" />
    }
  }

  const handleInsert = () => {
    if (onInsert) {
      onInsert(media)
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md text-xs cursor-pointer hover:bg-gray-100">
          {getIcon()}
          <span className="truncate max-w-[150px]">{media.name}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-1">
          {media.type === "image" && media.url && (
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden mb-2 rounded-md">
              <img
                src={media.url || "/placeholder.svg"}
                alt={media.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {media.type === "video" && media.url && (
            <div className="w-full aspect-video bg-gray-100 flex items-center justify-center mb-2 rounded-md">
              <video src={media.url} controls className="max-w-full max-h-full"></video>
            </div>
          )}

          <div className="p-2">
            <h4 className="font-medium text-sm mb-1">{media.name}</h4>
            <p className="text-xs text-gray-500 mb-3">
              {media.type.charAt(0).toUpperCase() + media.type.slice(1)} •
              {media.file ? ` ${Math.round(media.file.size / 1024)} KB` : " External URL"}
            </p>

            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleInsert}>
                <Copy className="h-3 w-3 mr-1" />
                Insert
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {media.url && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => window.open(media.url, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-500 hover:text-red-600"
                onClick={() => onRemove && onRemove(media.id)}
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
