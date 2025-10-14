"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Minus, Target, Flame } from "lucide-react"

interface Habit {
  id: string
  name: string
  description: string
  color: string
  target: number
  unit: string
  createdAt: string
}

interface HabitEntry {
  habitId: string
  date: string
  completed: number
}

interface HabitCalendarProps {
  habit: Habit
  entries: HabitEntry[]
  isAuthenticated: boolean
  onUpdateEntry: (habitId: string, date: string, completed: number) => void
}

export function HabitCalendar({ habit, entries, isAuthenticated, onUpdateEntry }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEntryForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return entries.find((entry) => entry.habitId === habit.id && entry.date === dateString)
  }

  const updateEntry = (date: Date, change: number) => {
    if (!isAuthenticated) return

    const dateString = date.toISOString().split("T")[0]
    const currentEntry = getEntryForDate(date)
    const currentCompleted = currentEntry?.completed || 0
    const newCompleted = Math.max(0, Math.min(habit.target * 2, currentCompleted + change))

    onUpdateEntry(habit.id, dateString, newCompleted)
  }

  const getCompletionPercentage = (completed: number) => {
    return Math.min(100, (completed / habit.target) * 100)
  }

  const getCurrentStreak = () => {
    const today = new Date()
    let streak = 0
    const currentDate = new Date(today)

    while (true) {
      const entry = getEntryForDate(currentDate)
      if (entry && entry.completed >= habit.target) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const getTotalCompletions = () => {
    return entries.filter((entry) => entry.habitId === habit.id && entry.completed >= habit.target).length
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const currentStreak = getCurrentStreak()
  const totalCompletions = getTotalCompletions()

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${habit.color}`} />
            <CardTitle className="text-lg font-semibold">{habit.name}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-green-500" />
              <span>{totalCompletions} completed</span>
            </div>
          </div>
        </div>

        {habit.description && <p className="text-sm text-muted-foreground mt-2">{habit.description}</p>}

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="aspect-square" />
              }

              const entry = getEntryForDate(day)
              const completed = entry?.completed || 0
              const percentage = getCompletionPercentage(completed)
              const isToday = day.toDateString() === new Date().toDateString()
              const isFuture = day > new Date()

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square relative rounded-lg border-2 transition-all ${
                    isToday ? "border-primary" : "border-border/50"
                  } ${isFuture ? "opacity-50" : ""}`}
                >
                  {/* Background progress */}
                  <div
                    className={`absolute inset-0 rounded-lg ${habit.color} opacity-20`}
                    style={{ clipPath: `inset(${100 - percentage}% 0 0 0)` }}
                  />

                  {/* Day number */}
                  <div className="absolute top-1 left-1 text-xs font-medium text-foreground">{day.getDate()}</div>

                  {/* Completion indicator */}
                  {completed > 0 && (
                    <div className="absolute bottom-1 right-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs px-1 py-0 h-5 ${
                          completed >= habit.target ? `${habit.color} text-white` : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {completed}
                      </Badge>
                    </div>
                  )}

                  {/* Interactive buttons for authenticated users */}
                  {isAuthenticated && !isFuture && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-background/80 rounded-lg">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateEntry(day, -1)}
                          disabled={completed === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateEntry(day, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Target: {habit.target} {habit.unit} per day
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${habit.color} opacity-20`} />
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${habit.color}`} />
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
