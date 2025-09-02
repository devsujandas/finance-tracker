import type { AppSettings, Category } from "@/lib/types"

export const defaultSettings: AppSettings = {
  currency: "USD",
  locale: "en-US",
  theme: "system",
  startOfWeek: "monday",
  startOfMonth: 1,
  density: "comfortable",
}

export const defaultCategories: Category[] = [
  { id: "groceries", name: "Groceries", type: "expense", icon: "🛒" },
  { id: "rent", name: "Rent", type: "expense", icon: "🏠" },
  { id: "transport", name: "Transport", type: "expense", icon: "🚌" },
  { id: "utilities", name: "Utilities", type: "expense", icon: "💡" },
  { id: "dining", name: "Dining", type: "expense", icon: "🍽️" },
  { id: "salary", name: "Salary", type: "income", icon: "💼" },
  { id: "freelance", name: "Freelance", type: "income", icon: "🧰" },
]
