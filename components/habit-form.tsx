"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, X } from "lucide-react"

interface Habit {
  id: string
  name: string
  description: string
  color: string
  target: number
  unit: string
  createdAt: string
}

interface HabitFormProps {
  habit?: Habit
  onSave: (habit: Omit<Habit, "id" | "createdAt">) => void
  onCancel: () => void
}

const colorOptions = [
  { name: "Blue", value: "bg-blue-500", ring: "ring-blue-500" },
  { name: "Green", value: "bg-green-500", ring: "ring-green-500" },
  { name: "Purple", value: "bg-purple-500", ring: "ring-purple-500" },
  { name: "Orange", value: "bg-orange-500", ring: "ring-orange-500" },
  { name: "Pink", value: "bg-pink-500", ring: "ring-pink-500" },
  { name: "Teal", value: "bg-teal-500", ring: "ring-teal-500" },
]

export function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [color, setColor] = useState(habit?.color || colorOptions[0].value)
  const [target, setTarget] = useState(habit?.target?.toString() || "1")
  const [unit, setUnit] = useState(habit?.unit || "times")

  const handleSave = () => {
    if (!name.trim()) return

    const habitData = {
      name: name.trim(),
      description: description.trim(),
      color,
      target: Number.parseInt(target) || 1,
      unit: unit.trim(),
    }

    onSave(habitData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{habit ? "Edit Habit" : "New Habit"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Habit Name</label>
            <Input
              placeholder="e.g., Drink water, Exercise, Read"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
            <Input
              placeholder="Brief description of your habit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`w-8 h-8 rounded-full ${colorOption.value} ${
                    color === colorOption.value ? `ring-2 ${colorOption.ring} ring-offset-2 ring-offset-background` : ""
                  } transition-all hover:scale-110`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Daily Target</label>
              <Input type="number" min="1" placeholder="1" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Unit</label>
              <Input placeholder="times, minutes, pages" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Habit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
