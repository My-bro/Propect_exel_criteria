
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
import { CriteriaList } from "@/components/ui/criteriaList"

interface DocumentItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
}

interface Criterion {
  id: string
  text: string
  variant: "grey1" | "grey2" | "grey3" | "grey4" | "grey5"
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

  const handleCriteriaChange = (newCriteria: Criterion[]) => {
    console.log("Criteria updated:", newCriteria)
  }

  return (
    <main className="container mx-auto py-10 max-w-full px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Document Manager</h1>
          <p className="text-muted-foreground">
            Upload and manage your documents easily
          </p>
        </div>

        {/* Main layout: Documents center, Criteria right */}
        <div className="flex flex-col lg:flex-row gap-8 min-h-[10vh] max-h-[30vh] overflow-hidden">
          {/* Main section - Documents (equal width, with scroll) */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Add Document Button - consistent styling */}
            <div className="flex justify-start mb-4 flex-shrink-0">
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

            {/* Document List - scrollable */}
            <div className="overflow-y-auto flex-1">
              <DocumentList
                documents={documents}
                onRemove={handleRemoveDocument}
                onDownload={handleDownloadDocument}
              />
            </div>
          </div>

          {/* Vertical separator - hidden on mobile */}
          <div className="hidden lg:block w-px bg-border flex-shrink-0"></div>

          {/* Right section - Criteria (equal width, max 1/3 screen height) */}
          <div className="flex-1 max-h-[33vh] overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              <CriteriaList
                title="Document Criteria"
                placeholder="Enter evaluation criterion..."
                maxWords={50}
                onCriteriaChange={handleCriteriaChange}
              />
            </div>
          </div>
        </div>
      </div>
    </main>  
  );
}
