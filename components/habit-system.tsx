"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HabitAuth } from "./habit-auth"
import { HabitForm } from "./habit-form"
import { HabitCalendar } from "./habit-calendar"
import { Plus, Calendar, Lock, Unlock, Edit, Trash2 } from "lucide-react"

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

export function HabitSystem() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [entries, setEntries] = useState<HabitEntry[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>()

  // Load habits and auth state on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habit-tracker-habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    } else {
      // Add demo habits
      const demoHabits: Habit[] = [
        {
          id: "1",
          name: "Drink Water",
          description: "Stay hydrated throughout the day",
          color: "bg-blue-500",
          target: 8,
          unit: "glasses",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Exercise",
          description: "Daily physical activity",
          color: "bg-green-500",
          target: 30,
          unit: "minutes",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Read",
          description: "Read books or articles",
          color: "bg-purple-500",
          target: 20,
          unit: "pages",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ]
      setHabits(demoHabits)
      localStorage.setItem("habit-tracker-habits", JSON.stringify(demoHabits))
    }

    const savedEntries = localStorage.getItem("habit-tracker-entries")
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    } else {
      // Add some demo entries for the past few days
      const demoEntries: HabitEntry[] = []
      const today = new Date()

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split("T")[0]

        // Add some random completions for demo
        demoEntries.push(
          { habitId: "1", date: dateString, completed: Math.floor(Math.random() * 10) },
          { habitId: "2", date: dateString, completed: Math.floor(Math.random() * 45) },
          { habitId: "3", date: dateString, completed: Math.floor(Math.random() * 30) },
        )
      }

      setEntries(demoEntries)
      localStorage.setItem("habit-tracker-entries", JSON.stringify(demoEntries))
    }

    // Check auth state
    const authState = localStorage.getItem("habit-auth")
    const authTimestamp = localStorage.getItem("habit-auth-timestamp")

    if (authState === "true" && authTimestamp) {
      const timeDiff = Date.now() - Number.parseInt(authTimestamp)
      const oneHour = 60 * 60 * 1000

      if (timeDiff < oneHour) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem("habit-auth")
        localStorage.removeItem("habit-auth-timestamp")
      }
    }
  }, [])

  const handleSaveHabit = (habitData: Omit<Habit, "id" | "createdAt">) => {
    const now = new Date().toISOString()

    if (editingHabit) {
      // Update existing habit
      const updatedHabit = {
        ...editingHabit,
        ...habitData,
      }

      const updatedHabits = habits.map((h) => (h.id === editingHabit.id ? updatedHabit : h))
      setHabits(updatedHabits)
      localStorage.setItem("habit-tracker-habits", JSON.stringify(updatedHabits))
    } else {
      // Create new habit
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...habitData,
        createdAt: now,
      }

      const updatedHabits = [...habits, newHabit]
      setHabits(updatedHabits)
      localStorage.setItem("habit-tracker-habits", JSON.stringify(updatedHabits))
    }

    setShowForm(false)
    setEditingHabit(undefined)
  }

  const handleDeleteHabit = (id: string) => {
    if (confirm("Are you sure you want to delete this habit? All tracking data will be lost.")) {
      const updatedHabits = habits.filter((h) => h.id !== id)
      const updatedEntries = entries.filter((e) => e.habitId !== id)

      setHabits(updatedHabits)
      setEntries(updatedEntries)
      localStorage.setItem("habit-tracker-habits", JSON.stringify(updatedHabits))
      localStorage.setItem("habit-tracker-entries", JSON.stringify(updatedEntries))
    }
  }

  const handleUpdateEntry = (habitId: string, date: string, completed: number) => {
    const existingEntryIndex = entries.findIndex((e) => e.habitId === habitId && e.date === date)

    let updatedEntries: HabitEntry[]

    if (existingEntryIndex >= 0) {
      if (completed === 0) {
        // Remove entry if completed is 0
        updatedEntries = entries.filter((e) => !(e.habitId === habitId && e.date === date))
      } else {
        // Update existing entry
        updatedEntries = entries.map((e, index) => (index === existingEntryIndex ? { ...e, completed } : e))
      }
    } else if (completed > 0) {
      // Create new entry
      updatedEntries = [...entries, { habitId, date, completed }]
    } else {
      return // No change needed
    }

    setEntries(updatedEntries)
    localStorage.setItem("habit-tracker-entries", JSON.stringify(updatedEntries))
  }

  const handleLogout = () => {
    localStorage.removeItem("habit-auth")
    localStorage.removeItem("habit-auth-timestamp")
    setIsAuthenticated(false)
  }

  // Show auth modal
  if (showAuth) {
    return (
      <HabitAuth
        onAuthenticated={() => {
          setIsAuthenticated(true)
          setShowAuth(false)
        }}
        onCancel={() => setShowAuth(false)}
      />
    )
  }

  // Show form
  if (showForm) {
    return (
      <HabitForm
        habit={editingHabit}
        onSave={handleSaveHabit}
        onCancel={() => {
          setShowForm(false)
          setEditingHabit(undefined)
        }}
      />
    )
  }

  // Main habit tracker view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Habit Tracker</h2>
          <p className="text-muted-foreground mt-2">Track your daily habits and build lasting routines</p>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Habit
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <Unlock className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowAuth(true)} className="gap-2">
              <Lock className="h-4 w-4" />
              Admin Login
            </Button>
          )}
        </div>
      </div>

      {/* Habits */}
      {habits.length > 0 ? (
        <div className="space-y-6">
          {habits.map((habit) => (
            <div key={habit.id} className="relative group">
              {/* Edit/Delete buttons for authenticated users */}
              {isAuthenticated && (
                <div className="absolute top-4 right-4 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                    onClick={() => {
                      setEditingHabit(habit)
                      setShowForm(true)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <HabitCalendar
                habit={habit}
                entries={entries}
                isAuthenticated={isAuthenticated}
                onUpdateEntry={handleUpdateEntry}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No habits yet</p>
            <p className="text-muted-foreground/70 text-sm mt-2">
              {isAuthenticated ? "Create your first habit to start tracking" : "Check back to see habit progress"}
            </p>
            {isAuthenticated && (
              <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create First Habit
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
