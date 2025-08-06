"use client"

import * as React from "react"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragAreaProps {
  onFilesSelected?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFileSize?: number // in MB
  className?: string
}

export function DragArea({
  onFilesSelected,
  accept = "*/*",
  multiple = true,
  maxFileSize = 10,
  className
}: DragAreaProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFileSelection(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFileSelection(files)
    }
  }

  const handleFileSelection = (files: File[]) => {
    // Filter files by size
    const validFiles = files.filter(file => {
      const fileSizeInMB = file.size / (1024 * 1024)
      return fileSizeInMB <= maxFileSize
    })

    setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : validFiles)
    onFilesSelected?.(validFiles)
  }

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          "flex flex-col items-center justify-center min-h-[200px] space-y-4"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={cn(
            "h-8 w-8 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )} />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse files
            </p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>Supported formats: {accept === "*/*" ? "All files" : accept}</p>
          <p>Maximum file size: {maxFileSize}MB</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="p-1 hover:bg-destructive/10 rounded-sm transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
