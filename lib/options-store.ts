import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_CATEGORIES, DEFAULT_SUPPLIERS } from "@/lib/options"

type OptionsState = {
  suppliers: string[]
  categories: string[]
  addSupplier: (name: string) => void
  addCategory: (name: string) => void
  updateSupplier: (oldName: string, newName: string) => void
  updateCategory: (oldName: string, newName: string) => void
  removeSupplier: (name: string) => void
  removeCategory: (name: string) => void
  resetOptions: () => void
}

const addUnique = (list: string[], name: string) =>
  list.includes(name) ? list : [...list, name]

const renameUnique = (list: string[], oldName: string, newName: string) => {
  const value = newName.trim()
  if (!value || value === oldName) return list
  return list
    .map((n) => (n === oldName ? value : n))
    .filter((n, i, arr) => arr.indexOf(n) === i)
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      suppliers: DEFAULT_SUPPLIERS,
      categories: DEFAULT_CATEGORIES,
      addSupplier: (name) =>
        set((s) => ({ suppliers: addUnique(s.suppliers, name) })),
      addCategory: (name) =>
        set((s) => ({ categories: addUnique(s.categories, name) })),
      updateSupplier: (oldName, newName) =>
        set((s) => ({ suppliers: renameUnique(s.suppliers, oldName, newName) })),
      updateCategory: (oldName, newName) =>
        set((s) => ({
          categories: renameUnique(s.categories, oldName, newName),
        })),
      removeSupplier: (name) =>
        set((s) => ({ suppliers: s.suppliers.filter((v) => v !== name) })),
      removeCategory: (name) =>
        set((s) => ({ categories: s.categories.filter((v) => v !== name) })),
      resetOptions: () =>
        set({ suppliers: DEFAULT_SUPPLIERS, categories: DEFAULT_CATEGORIES }),
    }),
    {
      name: "minh-global-options",
      version: 2,
      // v2: defaults were emptied — drop previously persisted mock lists.
      migrate: () => ({
        suppliers: DEFAULT_SUPPLIERS,
        categories: DEFAULT_CATEGORIES,
      }),
    }
  )
)
