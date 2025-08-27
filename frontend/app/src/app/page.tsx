
"use client"

import * as React from "react"
import { Plus, Loader2 } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

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
  const [taskId, setTaskId] = React.useState<string>("")
  const [criteriaKey, setCriteriaKey] = React.useState(0)
  const [criteria, setCriteria] = React.useState<Criterion[]>([])
  const [reportResponse, setReportResponse] = React.useState<string>("")
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false)
  const [reportError, setReportError] = React.useState<string>("")
  const [parsedReport, setParsedReport] = React.useState<any>(null)
  const [expandedCard, setExpandedCard] = React.useState<number | null>(null)

  // Function to parse the raw response
  const parseReportResponse = (rawResponse: string) => {
    try {
      // Extract JSON from the raw response (it might be wrapped in markdown)
      const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : rawResponse
      const parsed = JSON.parse(jsonString)
      setParsedReport(parsed)
    } catch (error) {
      console.error('Error parsing report response:', error)
      setParsedReport(null)
    }
  }

  // Function to get color based on score (0-20 scale)
  const getScoreColor = (score: number) => {
    const percentage = score / 20
    const red = Math.round(255 * (1 - percentage))
    const green = Math.round(255 * percentage)
    return `rgb(${red}, ${green}, 0)`
  }

  // Custom tooltip component for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-md">
          <p className="font-semibold">{data.critere}</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.commentaire}</p>
        </div>
      )
    }
    return null
  }

  React.useEffect(() => {
    const fetchTaskId = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate-task-id`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          setTaskId(data.task_id)
        }
      } catch (error) {
        console.error('Error fetching task ID:', error)
      }
    }
    fetchTaskId()
  }, [])

  const handleFilesSelected = (files: File[]) => {
    console.log("Selected files:", files)
    
    if (!taskId) {
      console.error("No task ID available")
      return
    }

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append('task_id', taskId)
    
    files.forEach(file => {
      formData.append('files', file)
    })

    // Upload files to backend
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/absorb-document/`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Files absorbed:', data)
      
      // Convert files to DocumentItem format for local display
      const newDocuments: DocumentItem[] = files.map(file => ({
        id: Math.random().toString(36).substr(2, 9), // Simple ID generation
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      }))

      // Add to documents list
      setDocuments(prev => [...prev, ...newDocuments])
    })
    .catch(error => {
      console.error('Error absorbing documents:', error)
    })
    
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
    setCriteria(newCriteria)
  }

  const handleGenerateReport = async () => {
    if (!taskId) {
      console.error("No task ID available")
      setReportError("No task ID available. Please refresh the page.")
      return
    }

    if (documents.length === 0) {
      setReportError("Please upload at least one document before generating a report.")
      return
    }

    if (criteria.length === 0) {
      console.error("No criteria available")
      setReportError("Please add at least one criterion before generating a report.")
      return
    }

    setIsGeneratingReport(true)
    setReportError("") // Clear any previous errors

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query_criteria/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskId,
          criteria: criteria.map(c => c.text)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setReportResponse(data.raw_response)
        setReportError("") // Clear any errors on success
        parseReportResponse(data.raw_response) // Parse the response for visualization
        console.log('Report generated:', data.raw_response)
      } else {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`
        
        // Try to get more detailed error from response
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          }
        } catch (e) {
          // If we can't parse error response, use the status text
        }
        
        setReportError(errorMessage)
        console.error('Error generating report:', errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
      setReportError(`Failed to generate report: ${errorMessage}`)
      console.error('Error generating report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handleDeleteAll = () => {
    setDocuments([])
    setCriteriaKey(prev => prev + 1)
    setCriteria([])
    setReportResponse("")
    setReportError("")
    setParsedReport(null)
    setExpandedCard(null)
    setIsGeneratingReport(false)
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
          <Button onClick={handleDeleteAll} variant="default" className="mt-4 bg-black text-white hover:bg-gray-800">
            New Conv
          </Button>
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
                key={criteriaKey}
                title="Document Criteria"
                placeholder="Enter evaluation criterion..."
                maxWords={50}
                onCriteriaChange={handleCriteriaChange}
              />
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleGenerateReport} 
            size="lg" 
            className="gap-2"
            disabled={isGeneratingReport || documents.length === 0 || criteria.length === 0}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </div>

        {/* Error Display */}
        {reportError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-red-800">Error:</h3>
            <p className="text-red-700">{reportError}</p>
          </div>
        )}

        {/* Report Response Display */}
        {parsedReport && parsedReport.rapport && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-6">Report Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parsedReport.rapport.map((item: any, index: number) => {
                const scoreColor = getScoreColor(item.note)
                const remainingScore = 20 - item.note
                const chartData = [
                  { 
                    name: 'Score', 
                    value: item.note, 
                    color: scoreColor,
                    critere: item.critere,
                    commentaire: item.commentaire,
                    note: item.note
                  },
                  { 
                    name: 'Remaining', 
                    value: remainingScore, 
                    color: '#f3f4f6',
                    critere: item.critere,
                    commentaire: item.commentaire,
                    note: item.note
                  }
                ]

                return (
                  <Card
                    key={index}
                    className={`transition-all duration-300 ${
                      expandedCard === index ? 'transform scale-[1.02] shadow-xl ring-2 ring-blue-200' : 'hover:shadow-lg'
                    }`}
                    onMouseEnter={() => setExpandedCard(index)}
                    onMouseLeave={() => setExpandedCard(null)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{item.critere}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-center py-2">
                        {item.note}/20
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full mb-4 flex items-center justify-center">
                        <div className={`transition-all duration-300 ${
                          expandedCard === index ? 'w-32 h-32' : 'w-48 h-48'
                        }`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={expandedCard === index ? 15 : 30}
                                outerRadius={expandedCard === index ? 35 : 70}
                                paddingAngle={0}
                                dataKey="value"
                              >
                                {chartData.map((entry, i) => (
                                  <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="mt-4 text-center mb-3">
                        <div
                          className="inline-block w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: scoreColor }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {item.note >= 15 ? 'Excellent' : item.note >= 10 ? 'Good' : item.note >= 5 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                      <div
                        className={`text-xs text-gray-500 bg-gray-50 p-2 rounded transition-all duration-300 ${
                          expandedCard === index ? 'text-gray-700 bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className={`transition-all duration-300 ${
                          expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-12 opacity-80'
                        } overflow-hidden`}>
                          {expandedCard === index ? item.commentaire : (
                            item.commentaire.length > 100
                              ? `${item.commentaire.substring(0, 100)}...`
                              : item.commentaire
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Raw Report Response (fallback) */}
        {reportResponse && !parsedReport && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Raw Report Response:</h3>
            <pre className="whitespace-pre-wrap text-sm">{reportResponse}</pre>
          </div>
        )}
      </div>
    </main>  
  );
}
