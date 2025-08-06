
"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DragArea } from "@/components/ui/dragArea"
import { DocumentList } from "@/components/ui/document-list"

interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
}

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [documents, setDocuments] = React.useState<DocumentItem[]>([])

  const handleFilesSelected = (files: File[]) => {
    console.log("Selected files:", files)
    
    // Convert files to DocumentItem format
    const newDocuments: DocumentItem[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    }))

    // Add to documents list
    setDocuments(prev => [...prev, ...newDocuments])
    
    // Close dialog after successful upload
    setIsDialogOpen(false)
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleDownloadDocument = (id: string) => {
    // Here you would implement the actual download logic
    // For now, just log the action
    const document = documents.find(doc => doc.id === id)
    console.log("Download document:", document?.name)
  }

  return (
    <main className="container mx-auto py-10 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Document Manager</h1>
          <p className="text-muted-foreground">
            Upload and manage your documents easily
          </p>
        </div>

        {/* Add Document Button */}
        <div className="flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
                <DialogDescription>
                  Drag and drop your files here or click to browse. You can upload multiple files at once.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <DragArea
                  onFilesSelected={handleFilesSelected}
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                  multiple={true}
                  maxFileSize={50}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Document List */}
        <DocumentList
          documents={documents}
          onRemove={handleRemoveDocument}
          onDownload={handleDownloadDocument}
        />
      </div>
    </main>  
  );
}
