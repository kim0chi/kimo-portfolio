"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface SkillProgressBarProps {
  skill: string
  level: number
  delay?: number
}

export function SkillProgressBar({ skill, level, delay = 0 }: SkillProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(level)
    }, delay)

    return () => clearTimeout(timer)
  }, [level, delay])

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{skill}</span>
        <span className="text-xs text-muted-foreground">{level}%</span>
      </div>
      <Progress value={progress} className="h-2 bg-muted/50" />
    </div>
  )
}
