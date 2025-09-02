"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { loadCategories, saveCategories } from "@/lib/storage"
import type { Category } from "@/lib/types"

export function CategoryManager() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [emoji, setEmoji] = useState("💡")
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    setCategories(loadCategories())
  }, [])

  const onAdd = () => {
    if (!name.trim()) return
    const id = crypto.randomUUID()
    const next: Category[] = [...categories, { id, name: name.trim(), type, icon: emoji }]
    setCategories(next)
    saveCategories(next)
    setName("")
    toast({ title: "Category added" })
  }

  const onEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setType(cat.type)
    setEmoji(cat.icon ?? "🏷️")
  }

  const onSave = () => {
    if (!editingId) return
    const next = categories.map((c) => (c.id === editingId ? { ...c, name: name.trim(), type, icon: emoji } : c))
    setCategories(next)
    saveCategories(next)
    setEditingId(null)
    setName("")
    toast({ title: "Category updated" })
  }

  const onDelete = (id: string) => {
    const next = categories.filter((c) => c.id !== id)
    setCategories(next)
    saveCategories(next)
    toast({ title: "Category deleted" })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cat-type">Type</Label>
          <select
            id="cat-type"
            className="rounded-md border bg-background px-3 py-2 text-sm capitalize"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="expense">expense</option>
            <option value="income">income</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cat-emoji">Emoji/Icon</Label>
          <Input id="cat-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="e.g., 🛒" />
        </div>
      </div>
      <div className="flex gap-2">
        {editingId ? (
          <>
            <Button onClick={onSave}>Save</Button>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={onAdd}>Add</Button>
        )}
      </div>

      <ul className="divide-y rounded-lg border">
        {categories.length === 0 && <li className="p-3 text-sm text-muted-foreground">No categories yet.</li>}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true">{c.icon ?? "🏷️"}</span>
              <div className="leading-tight">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
