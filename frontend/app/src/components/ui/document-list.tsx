"use client"

import * as React from "react"
import { File, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
}

interface DocumentListProps {
  documents: DocumentItem[]
  onRemove?: (id: string) => void
  onDownload?: (id: string) => void
  className?: string
}

export function DocumentList({
  documents,
  onRemove,
  onDownload,
  className
}: DocumentListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (documents.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <File className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No documents uploaded yet</p>
        <p className="text-sm text-muted-foreground">
          Click &quot;Add Document&quot; to get started
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <File className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium truncate max-w-[300px]">{doc.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(doc.id)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download {doc.name}</span>
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(doc.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove {doc.name}</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
