"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff } from "lucide-react"

interface HabitAuthProps {
  onAuthenticated: () => void
  onCancel: () => void
}

export function HabitAuth({ onAuthenticated, onCancel }: HabitAuthProps) {
  const [passcode, setPasscode] = useState("")
  const [showPasscode, setShowPasscode] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple passcode check (same as blog system)
    const correctPasscode = "portfolio2024"

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (passcode === correctPasscode) {
      localStorage.setItem("habit-auth", "true")
      localStorage.setItem("habit-auth-timestamp", Date.now().toString())
      onAuthenticated()
    } else {
      setError("Incorrect passcode. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Habit Tracker Authentication</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Enter the passcode to manage your habits</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPasscode ? "text" : "password"}
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasscode(!showPasscode)}
              >
                {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-transparent"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading || !passcode.trim()}>
                {isLoading ? "Authenticating..." : "Authenticate"}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Demo passcode:</strong> portfolio2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
