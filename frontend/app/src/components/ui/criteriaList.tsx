"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Criterion {
  id: string
  text: string
  variant: "grey1" | "grey2" | "grey3" | "grey4" | "grey5"
}

interface CriteriaListProps {
  title?: string
  placeholder?: string
  maxWords?: number
  className?: string
  onCriteriaChange?: (criteria: Criterion[]) => void
}

export function CriteriaList({
  title = "Criteria",
  placeholder = "Enter a criterion...",
  maxWords = 50,
  className,
  onCriteriaChange
}: CriteriaListProps) {
  const [criteria, setCriteria] = React.useState<Criterion[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isAddingCriterion, setIsAddingCriterion] = React.useState(false)
  const [wordCount, setWordCount] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Grey variants for cycling through different tones
  const greyVariants: Array<"grey1" | "grey2" | "grey3" | "grey4" | "grey5"> = [
    "grey1", "grey2", "grey3", "grey4", "grey5"
  ]

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = countWords(value)
    
    if (words <= maxWords) {
      setInputValue(value)
      setWordCount(words)
    }
  }

  const handleAddCriterion = () => {
    if (inputValue.trim() && wordCount <= maxWords) {
      const newCriterion: Criterion = {
        id: Math.random().toString(36).substr(2, 9),
        text: inputValue.trim(),
        variant: greyVariants[criteria.length % greyVariants.length]
      }
      
      const updatedCriteria = [...criteria, newCriterion]
      setCriteria(updatedCriteria)
      setInputValue("")
      setWordCount(0)
      setIsAddingCriterion(false)
      onCriteriaChange?.(updatedCriteria)
    }
  }

  const handleRemoveCriterion = (id: string) => {
    const updatedCriteria = criteria.filter(criterion => criterion.id !== id)
    setCriteria(updatedCriteria)
    onCriteriaChange?.(updatedCriteria)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddCriterion()
    }
    if (e.key === "Escape") {
      setIsAddingCriterion(false)
      setInputValue("")
      setWordCount(0)
    }
  }

  const startAddingCriterion = () => {
    setIsAddingCriterion(true)
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Add Criterion Button - above title */}
      {!isAddingCriterion && (
        <div className="flex justify-start">
          <Button
            size="lg"
            onClick={startAddingCriterion}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Criterion
          </Button>
        </div>
      )}

      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {/* Input for adding new criterion */}
      {isAddingCriterion && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Press Enter to add, Esc to cancel</span>
                <span className={cn(
                  wordCount > maxWords * 0.8 && wordCount <= maxWords && "text-yellow-600",
                  wordCount > maxWords && "text-red-600"
                )}>
                  {wordCount}/{maxWords} words
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={handleAddCriterion}
                disabled={!inputValue.trim() || wordCount > maxWords}
              >
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingCriterion(false)
                  setInputValue("")
                  setWordCount(0)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Tags */}
      {criteria.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {criteria.length} criterion{criteria.length !== 1 ? "ia" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {criteria.map((criterion) => {
              // Map custom variants to allowed Badge variants
              const badgeVariant: "default" | "destructive" | "outline" | "secondary" | null | undefined =
                criterion.variant === "grey1" ? "default"
                : criterion.variant === "grey2" ? "secondary"
                : criterion.variant === "grey3" ? "outline"
                : criterion.variant === "grey4" ? "destructive"
                : "default";
              return (
                <Badge
                  key={criterion.id}
                  variant={badgeVariant}
                  className="flex items-center gap-1 pr-1 cursor-default"
                >
                  <span>{criterion.text}</span>
                  <button
                    onClick={() => handleRemoveCriterion(criterion.id)}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {criterion.text}</span>
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {criteria.length === 0 && !isAddingCriterion && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground text-sm">
            No criteria added yet
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Click &quot;Add Criterion&quot; to get started
          </p>
        </div>
      )}
    </div>
  )
}
